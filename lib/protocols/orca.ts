import { getRiskProfile } from "@/lib/risk";
import type { YieldOpportunity } from "@/lib/types";

type OrcaPool = {
  address: string;
  tokenA: { symbol: string };
  tokenB: { symbol: string };
  tvlUsdc: string;
  stats?: {
    "24h"?: {
      yieldOverTvl?: string;
    };
  };
};

type OrcaPoolsResponse = {
  data: OrcaPool[];
};

export async function fetchOrcaOpportunities(): Promise<YieldOpportunity[]> {
  const response = await fetch(
    "https://api.orca.so/v2/solana/pools?size=8&sortBy=tvl&sortDirection=desc&stats=24h",
    { next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error(`Orca request failed: ${response.status}`);
  }

  const payload = (await response.json()) as OrcaPoolsResponse;
  const riskProfile = getRiskProfile("Orca");

  return payload.data
    .map((pool) => {
      const dailyYield = Number(pool.stats?.["24h"]?.yieldOverTvl ?? 0);
      const apyFraction = dailyYield * 365;

      return {
        id: `orca-${pool.address}`,
        protocol: "Orca" as const,
        strategyType: "LP" as const,
        asset: `${pool.tokenA.symbol}/${pool.tokenB.symbol}`,
        apy: apyFraction * 100,
        tvl: Number(pool.tvlUsdc),
        riskTier: riskProfile.tier,
        riskRationale: riskProfile.explanation,
        sourceUrl: `https://www.orca.so/pools/${pool.address}`,
        vaultAddress: pool.address,
        updatedAt: new Date().toISOString(),
      };
    })
    .filter((pool) => Number.isFinite(pool.apy) && pool.tvl > 0)
    .sort((left, right) => right.apy - left.apy)
    .slice(0, 4);
}
