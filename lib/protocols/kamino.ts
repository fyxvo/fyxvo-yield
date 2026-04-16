import { getRiskProfile } from "@/lib/risk";
import type { WalletPosition, YieldOpportunity } from "@/lib/types";

const KAMINO_MARKET =
  "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";
const KAMINO_BASE_URL = "https://api.kamino.finance";

type KaminoReserveMetric = {
  reserve: string;
  liquidityToken: string;
  liquidityTokenMint: string;
  supplyApy: string;
  totalSupplyUsd: string;
};

export type KaminoVault = {
  address: string;
  state: {
    name: string;
    tokenMint: string;
    sharesMint: string;
    tokenMintDecimals: number;
  };
};

type KaminoUserPosition = {
  vaultAddress: string;
  totalShares: string;
  state: {
    name: string;
    tokenMint: string;
    sharesMint: string;
  };
};

type KaminoVaultMetrics = {
  apy: string;
  sharePrice: string;
  tokenPrice: string;
  tokensPerShare: string;
};

async function fetchJson<T>(path: string) {
  const response = await fetch(`${KAMINO_BASE_URL}${path}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Kamino request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchKaminoOpportunities(): Promise<YieldOpportunity[]> {
  const data = await fetchJson<KaminoReserveMetric[]>(
    `/kamino-market/${KAMINO_MARKET}/reserves/metrics`,
  );

  const riskProfile = getRiskProfile("Kamino");

  return data
    .map((reserve) => ({
      id: `kamino-${reserve.reserve}`,
      protocol: "Kamino" as const,
      strategyType: "Lending" as const,
      asset: reserve.liquidityToken,
      apy: Number(reserve.supplyApy) * 100,
      tvl: Number(reserve.totalSupplyUsd),
      riskTier: riskProfile.tier,
      riskRationale: riskProfile.explanation,
      sourceUrl: `https://app.kamino.finance/lend/${reserve.reserve}`,
      vaultAddress: reserve.reserve,
      updatedAt: new Date().toISOString(),
    }))
    .filter((reserve) => Number.isFinite(reserve.apy) && reserve.tvl > 0)
    .sort((left, right) => right.apy - left.apy)
    .slice(0, 4);
}

export async function fetchKaminoVaults() {
  return fetchJson<KaminoVault[]>("/kvaults/vaults");
}

export async function fetchKaminoUserPositions(walletAddress: string) {
  return fetchJson<KaminoUserPosition[]>(`/kvaults/users/${walletAddress}/positions`);
}

export async function fetchKaminoVaultMetrics(vaultAddress: string) {
  return fetchJson<KaminoVaultMetrics>(`/kvaults/vaults/${vaultAddress}/metrics`);
}

export async function buildKaminoWalletPositions(
  walletAddress: string,
): Promise<WalletPosition[]> {
  const userPositions = await fetchKaminoUserPositions(walletAddress);

  const positions = await Promise.all(
    userPositions.map(async (position) => {
      const metrics = await fetchKaminoVaultMetrics(position.vaultAddress);
      const apyFraction = Number(metrics.apy);
      const totalShares = Number(position.totalShares);
      const tokensPerShare = Number(metrics.tokensPerShare);
      const tokenPrice = Number(metrics.tokenPrice);
      const estimatedUnderlying = totalShares * tokensPerShare;
      const estimatedUnderlyingUsd = estimatedUnderlying * tokenPrice;
      const dailyEarnings = estimatedUnderlying * (apyFraction / 365);
      const weeklyEarnings = dailyEarnings * 7;
      const monthlyEarnings = dailyEarnings * 30;

      return {
        id: `kamino-position-${position.vaultAddress}`,
        protocol: "Kamino" as const,
        strategyType: "Staking" as const,
        asset: position.state.name || "Vault Position",
        apy: apyFraction * 100,
        vaultAddress: position.vaultAddress,
        estimatedUnderlying,
        estimatedUnderlyingUsd,
        dailyEarnings,
        dailyEarningsUsd: dailyEarnings * tokenPrice,
        weeklyEarnings,
        weeklyEarningsUsd: weeklyEarnings * tokenPrice,
        monthlyEarnings,
        monthlyEarningsUsd: monthlyEarnings * tokenPrice,
      };
    }),
  );

  return positions.filter(
    (position) =>
      Number.isFinite(position.apy) &&
      Number.isFinite(position.estimatedUnderlying) &&
      position.estimatedUnderlying > 0,
  );
}
