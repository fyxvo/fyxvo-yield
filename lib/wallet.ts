import { PublicKey } from "@solana/web3.js";
import {
  buildKaminoWalletPositions,
  fetchKaminoVaultMetrics,
  fetchKaminoVaults,
} from "@/lib/protocols/kamino";
import { fyxvoRpc } from "@/lib/fyxvo";
import type { TokenBalance, WalletPosition, WalletSnapshot } from "@/lib/types";

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

type TokenAccountResponse = {
  value: Array<{
    account: {
      data: {
        parsed?: {
          info?: {
            mint?: string;
            tokenAmount?: {
              amount: string;
              decimals: number;
              uiAmount: number | null;
            };
          };
        };
      };
    };
  }>;
};

function toUiAmount(amount: string, decimals: number) {
  return Number(amount) / 10 ** decimals;
}

function buildEarningsPosition(
  id: string,
  asset: string,
  vaultAddress: string,
  apyFraction: number,
  underlyingAmount: number,
  tokenPrice: number,
): WalletPosition {
  const dailyEarnings = underlyingAmount * (apyFraction / 365);
  const weeklyEarnings = dailyEarnings * 7;
  const monthlyEarnings = dailyEarnings * 30;

  return {
    id,
    protocol: "Kamino",
    strategyType: "Staking",
    asset,
    apy: apyFraction * 100,
    vaultAddress,
    estimatedUnderlying: underlyingAmount,
    estimatedUnderlyingUsd: underlyingAmount * tokenPrice,
    dailyEarnings,
    dailyEarningsUsd: dailyEarnings * tokenPrice,
    weeklyEarnings,
    weeklyEarningsUsd: weeklyEarnings * tokenPrice,
    monthlyEarnings,
    monthlyEarningsUsd: monthlyEarnings * tokenPrice,
  };
}

async function fetchWalletTokenAccounts(walletAddress: string, programId: string) {
  return fyxvoRpc<TokenAccountResponse>("getTokenAccountsByOwner", [
    walletAddress,
    { programId },
    { encoding: "jsonParsed" },
  ]);
}

export async function getWalletSnapshot(
  walletAddress: string,
): Promise<WalletSnapshot> {
  const owner = new PublicKey(walletAddress);
  const normalizedAddress = owner.toBase58();

  const [solBalance, tokenAccounts, token2022Accounts, kaminoVaults, kaminoPositions] =
    await Promise.all([
      fyxvoRpc<{ value: number }>("getBalance", [normalizedAddress]).then(
        (result) => result.value / 1_000_000_000,
      ),
      fetchWalletTokenAccounts(normalizedAddress, TOKEN_PROGRAM_ID),
      fetchWalletTokenAccounts(normalizedAddress, TOKEN_2022_PROGRAM_ID),
      fetchKaminoVaults(),
      buildKaminoWalletPositions(normalizedAddress).catch(() => []),
    ]);

  const vaultByShareMint = new Map(
    kaminoVaults.map((vault) => [vault.state.sharesMint, vault]),
  );

  const tokenBalances = [...tokenAccounts.value, ...token2022Accounts.value]
    .map((item) => item.account.data.parsed?.info)
    .filter(
      (
        info,
      ): info is {
        mint: string;
        tokenAmount: { amount: string; decimals: number; uiAmount: number | null };
      } => Boolean(info?.mint && info.tokenAmount),
    )
    .map<TokenBalance>((info) => {
      const matchedVault = vaultByShareMint.get(info.mint);

      return {
        mint: info.mint,
        symbol:
          matchedVault?.state.name ||
          (matchedVault ? "Kamino Vault Share" : "SPL Token"),
        uiAmount:
          info.tokenAmount.uiAmount ??
          toUiAmount(info.tokenAmount.amount, info.tokenAmount.decimals),
        rawAmount: info.tokenAmount.amount,
        decimals: info.tokenAmount.decimals,
        matchLabel: matchedVault ? `Kamino vault share: ${matchedVault.address}` : undefined,
      };
    })
    .filter((balance) => balance.uiAmount > 0)
    .sort((left, right) => right.uiAmount - left.uiAmount);

  const fallbackKaminoPositions = (
    await Promise.all(
      tokenBalances.map(async (balance) => {
        const vault = vaultByShareMint.get(balance.mint);

        if (!vault) {
          return null;
        }

        const metrics = await fetchKaminoVaultMetrics(vault.address);
        const apyFraction = Number(metrics.apy);
        const tokensPerShare = Number(metrics.tokensPerShare);
        const tokenPrice = Number(metrics.tokenPrice);
        const underlyingAmount = balance.uiAmount * tokensPerShare;

        return buildEarningsPosition(
          `kamino-wallet-${vault.address}`,
          vault.state.name || "Vault Position",
          vault.address,
          apyFraction,
          underlyingAmount,
          tokenPrice,
        );
      }),
    )
  ).filter((position): position is WalletPosition => Boolean(position));

  const dedupedPositions = new Map<string, WalletPosition>();

  for (const position of [...kaminoPositions, ...fallbackKaminoPositions]) {
    dedupedPositions.set(position.vaultAddress, position);
  }

  return {
    walletAddress: normalizedAddress,
    solBalance,
    tokenBalances,
    positions: [...dedupedPositions.values()],
    notes:
      dedupedPositions.size > 0
        ? "Matched Kamino Earn vault positions are shown with estimated earnings. MarginFi and Orca exposures may remain visible only as token balances without wallet-specific public position metadata."
        : "No known vault share positions were matched. The balance view still shows your read-only token inventory, but some protocol exposures do not publish wallet-level position metadata.",
  };
}
