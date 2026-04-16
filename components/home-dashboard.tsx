"use client";

import { useEffect, useMemo, useState } from "react";
import { OpportunitiesTable } from "@/components/opportunities-table";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { RebalanceAlertsPanel } from "@/components/rebalance-alerts-panel";
import { StatePanel } from "@/components/state-panel";
import { formatMoney, formatPercent } from "@/lib/format";
import type { YieldOpportunity } from "@/lib/types";

export function HomeDashboard() {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/opportunities", {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          error?: string;
          opportunities?: YieldOpportunity[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load opportunities.");
        }

        setOpportunities(payload.opportunities ?? []);
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load opportunities.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  const metrics = useMemo(() => {
    const best = opportunities.reduce<YieldOpportunity | null>((top, item) => {
      if (!top || item.apy > top.apy) {
        return item;
      }

      return top;
    }, null);

    const tvl = opportunities.reduce((sum, item) => sum + item.tvl, 0);
    const protocols = new Set(opportunities.map((item) => item.protocol));

    return {
      best,
      tvl,
      protocolCount: protocols.size,
    };
  }, [opportunities]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discovery"
        title="Yield Discovery"
        description="Live Solana yield scouting across Kamino, MarginFi, and Orca. Compare lending, LP, and staking-style opportunities with static risk overlays and direct protocol links."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
            Best Live APY
          </div>
          <div className="text-3xl font-semibold text-orange-300">
            {metrics.best ? formatPercent(metrics.best.apy) : "--"}
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {metrics.best
              ? `${metrics.best.protocol} ${metrics.best.asset}`
              : "Waiting for fresh protocol data."}
          </p>
        </Panel>
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
            Tracked TVL
          </div>
          <div className="text-3xl font-semibold text-zinc-100">
            {formatMoney(metrics.tvl)}
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Aggregated from the currently surfaced strategies.
          </p>
        </Panel>
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
            Protocol Coverage
          </div>
          <div className="text-3xl font-semibold text-zinc-100">
            {metrics.protocolCount}/3
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Kamino, MarginFi, and Orca are included in the live scan set.
          </p>
        </Panel>
      </div>

      <RebalanceAlertsPanel compact />

      {loading ? (
        <StatePanel
          title="Syncing Opportunities"
          message="Pulling fresh APY and TVL snapshots from protocol APIs and Fyxvo-backed Solana RPC."
        />
      ) : error ? (
        <StatePanel title="Discovery Feed Error" message={error} tone="error" />
      ) : opportunities.length === 0 ? (
        <StatePanel
          title="No Opportunities Returned"
          message="The scan completed but no strategies were returned. Check your API key configuration or try again in a moment."
          tone="empty"
        />
      ) : (
        <Panel className="px-2 py-2">
          <div className="flex flex-col gap-2 border-b border-white/8 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                Live Opportunities
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Risk scores are static overlays based on audits, protocol age,
                and current TVL range. Hover badges for explanations.
              </p>
            </div>
            <div className="rounded-full border border-white/8 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-zinc-400">
              Sorted by APY desc
            </div>
          </div>
          <OpportunitiesTable opportunities={opportunities} />
        </Panel>
      )}
    </div>
  );
}
