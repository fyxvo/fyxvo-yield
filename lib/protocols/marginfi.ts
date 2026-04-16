import bs58 from "bs58";
import { createHash } from "node:crypto";
import {
  MARGINFI_IDL,
  computeInterestRates,
  decodeBankRaw,
  parseBankRaw,
} from "@mrgnlabs/marginfi-client-v2";
import { PublicKey } from "@solana/web3.js";
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
  account: {
    data: [string, string];
  };
};

function getAccountDiscriminator(name: string) {
  return createHash("sha256")
    .update(`account:${name}`)
    .digest()
    .subarray(0, 8);
}

async function fetchMarginfiMetadata() {
  const response = await fetch(
    "https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json",
    {
      next: { revalidate: 300 },
    },
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

  const metadataByBank = new Map(metadata.map((item) => [item.bankAddress, item]));
  const riskProfile = getRiskProfile("MarginFi");

  const opportunities = accounts
    .map((account) => {
      const raw = Buffer.from(account.account.data[0], "base64");
      const bankMetadata = metadataByBank.get(account.pubkey);
      const parsed = parseBankRaw(
        new PublicKey(account.pubkey),
        decodeBankRaw(raw, MARGINFI_IDL),
        bankMetadata,
      );

      if (parsed.group.toBase58() !== MARGINFI_GROUP_ID) {
        return null;
      }

      const symbol = bankMetadata?.tokenSymbol;
      if (!symbol || !STABLECOINS.has(symbol)) {
        return null;
      }

      const { lendingRate } = computeInterestRates(parsed);
      const apr = lendingRate.toNumber();
      const apyFraction = (1 + apr / 365) ** 365 - 1;
      const rawQuantity = parsed.totalAssetShares
        .times(parsed.assetShareValue)
        .div(10 ** parsed.mintDecimals)
        .toNumber();

      return {
        id: `marginfi-${account.pubkey}`,
        protocol: "MarginFi" as const,
        strategyType: "Lending" as const,
        asset: symbol,
        apy: apyFraction * 100,
        tvl: rawQuantity,
        riskTier: riskProfile.tier,
        riskRationale: riskProfile.explanation,
        sourceUrl: "https://app.marginfi.com/earn",
        vaultAddress: account.pubkey,
        updatedAt: new Date().toISOString(),
      };
    })
    .filter(
      (
        item,
      ): item is NonNullable<typeof item> => {
        if (!item) {
          return false;
        }

        return Number.isFinite(item.apy) && item.tvl > 0;
      },
    )
    .sort((left, right) => right.apy - left.apy)
    .slice(0, 4);

  return opportunities;
}
