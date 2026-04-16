import bs58 from "bs58";
import { createHash } from "node:crypto";
import { BorshCoder } from "@coral-xyz/anchor";
import { MARGINFI_IDL } from "@mrgnlabs/marginfi-client-v2";
import { fyxvoRpc } from "@/lib/fyxvo";
import { getRiskProfile } from "@/lib/risk";
import type { YieldOpportunity } from "@/lib/types";

const MARGINFI_PROGRAM_ID = "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA";
const MARGINFI_GROUP_ID = "4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8";
const STABLECOINS = new Set(["USDC", "USDT", "FDUSD", "PYUSD", "USDG", "USDS"]);

type MarginfiBankMetadata = {
  bankAddress: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
};

type ProgramAccountInfo = {
  pubkey: string;
  account: { data: [string, string] };
};

// I80F48 is a 16-byte little-endian signed fixed-point number with 48 fractional bits.
function i80f48ToNumber(bytes: number[]): number {
  // Treat the 16 bytes as a little-endian signed 128-bit integer then divide by 2^48.
  let lo = 0;
  let hi = 0;
  for (let i = 7; i >= 0; i--) {
    lo = lo * 256 + (bytes[i] ?? 0);
  }
  for (let i = 15; i >= 8; i--) {
    hi = hi * 256 + (bytes[i] ?? 0);
  }
  // Sign-extend using the top bit of byte[15]
  const sign = (bytes[15] ?? 0) & 0x80 ? -1 : 1;
  if (sign < 0) {
    // Two's complement for the 128-bit value
    hi = ~hi >>> 0;
    lo = ~lo >>> 0;
    lo = (lo + 1) >>> 0;
    if (lo === 0) hi = (hi + 1) >>> 0;
    return -(hi * 2 ** 64 + lo) / 2 ** 48;
  }
  return (hi * 2 ** 64 + lo) / 2 ** 48;
}

function computeLendingApy(
  totalAssetShares: number[],
  totalLiabilityShares: number[],
  config: {
    interest_rate_config: {
      optimal_utilization_rate: { value: number[] };
      plateau_interest_rate: { value: number[] };
      max_interest_rate: { value: number[] };
      insurance_fee_fixed_apr: { value: number[] };
      insurance_ir_fee: { value: number[] };
      protocol_fixed_fee_apr: { value: number[] };
      protocol_ir_fee: { value: number[] };
    };
  },
): number {
  const irc = config.interest_rate_config;
  const optUtil = i80f48ToNumber(irc.optimal_utilization_rate.value);
  const plateauRate = i80f48ToNumber(irc.plateau_interest_rate.value);
  const maxRate = i80f48ToNumber(irc.max_interest_rate.value);
  const protocolIrFee = i80f48ToNumber(irc.protocol_ir_fee.value);

  const totalAssets = i80f48ToNumber(totalAssetShares);
  const totalLiabilities = i80f48ToNumber(totalLiabilityShares);

  if (totalAssets <= 0) return 0;

  const utilization = Math.min(totalLiabilities / totalAssets, 1);

  let borrowRate: number;
  if (utilization <= optUtil && optUtil > 0) {
    borrowRate = (utilization / optUtil) * plateauRate;
  } else if (optUtil < 1) {
    borrowRate =
      plateauRate +
      ((utilization - optUtil) / (1 - optUtil)) * (maxRate - plateauRate);
  } else {
    borrowRate = maxRate;
  }

  // Lenders earn borrow rate * utilization, minus protocol/insurance fees
  const lendingRate = borrowRate * utilization * (1 - protocolIrFee);
  // Convert APR to APY
  return ((1 + lendingRate / 365) ** 365 - 1) * 100;
}

function getAccountDiscriminator(name: string) {
  return createHash("sha256")
    .update(`account:${name}`)
    .digest()
    .subarray(0, 8);
}

function getBorshCoder() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new BorshCoder(MARGINFI_IDL as any);
}

async function fetchMarginfiMetadata() {
  const response = await fetch(
    "https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json",
    { next: { revalidate: 300 } },
  );
  if (!response.ok) {
    throw new Error(`MarginFi metadata request failed: ${response.status}`);
  }
  return (await response.json()) as MarginfiBankMetadata[];
}

export async function fetchMarginfiOpportunities(): Promise<YieldOpportunity[]> {
  const discriminator = bs58.encode(getAccountDiscriminator("Bank"));

  const [metadata, accounts] = await Promise.all([
    fetchMarginfiMetadata(),
    fyxvoRpc<ProgramAccountInfo[]>("getProgramAccounts", [
      MARGINFI_PROGRAM_ID,
      {
        commitment: "confirmed",
        encoding: "base64",
        filters: [{ memcmp: { offset: 0, bytes: discriminator } }],
      },
    ]),
  ]);
  const coder = getBorshCoder();

  const metadataByBank = new Map(
    metadata.map((item) => [item.bankAddress, item]),
  );
  const riskProfile = getRiskProfile("MarginFi");

  const opportunities = accounts
    .map((account) => {
      try {
        const raw = Buffer.from(account.account.data[0], "base64");
        // Use "Bank" (PascalCase) — the IDL defines the account as "Bank"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: any = coder.accounts.decode("Bank", raw);

        const group = decoded.group?.toBase58?.();
        if (group !== MARGINFI_GROUP_ID) return null;

        const bankMetadata = metadataByBank.get(account.pubkey);
        const symbol = bankMetadata?.tokenSymbol;
        if (!symbol || !STABLECOINS.has(symbol)) return null;

        const apy = computeLendingApy(
          decoded.total_asset_shares?.value ?? [],
          decoded.total_liability_shares?.value ?? [],
          decoded.config,
        );

        // TVL: totalAssets * assetShareValue in token units
        const assetShareValue = i80f48ToNumber(
          decoded.asset_share_value?.value ?? [],
        );
        const totalAssets = i80f48ToNumber(
          decoded.total_asset_shares?.value ?? [],
        );
        const mintDecimals: number = decoded.mint_decimals ?? 6;
        const tvl = (totalAssets * assetShareValue) / 10 ** mintDecimals;

        if (!Number.isFinite(apy) || !Number.isFinite(tvl) || tvl <= 0) {
          return null;
        }

        return {
          id: `marginfi-${account.pubkey}`,
          protocol: "MarginFi" as const,
          strategyType: "Lending" as const,
          asset: symbol,
          apy,
          tvl,
          riskTier: riskProfile.tier,
          riskRationale: riskProfile.explanation,
          sourceUrl: "https://app.marginfi.com/earn",
          vaultAddress: account.pubkey,
          updatedAt: new Date().toISOString(),
        };
      } catch {
        return null;
      }
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && item.apy > 0,
    )
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 4);

  return opportunities;
}
