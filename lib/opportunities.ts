import { fetchKaminoOpportunities } from "@/lib/protocols/kamino";
import { fetchMarginfiOpportunities } from "@/lib/protocols/marginfi";
import { fetchOrcaOpportunities } from "@/lib/protocols/orca";
import type { YieldOpportunity } from "@/lib/types";

export async function getYieldOpportunities(): Promise<YieldOpportunity[]> {
  const results = await Promise.allSettled([
    fetchKaminoOpportunities(),
    fetchMarginfiOpportunities(),
    fetchOrcaOpportunities(),
  ]);

  const opportunities = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (opportunities.length === 0) {
    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason)
      .map((reason) =>
        reason instanceof Error ? reason.message : "Unknown protocol error",
      );

    throw new Error(errors.join(" | "));
  }

  return opportunities.sort((left, right) => right.apy - left.apy);
}
