"use client";

import { useEffect, useMemo, useState } from "react";
import { OpportunitiesTable } from "@/components/opportunities-table";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { StatePanel } from "@/components/state-panel";
import { formatPercent } from "@/lib/format";
import type { YieldOpportunity } from "@/lib/types";

const ALERT_THRESHOLD_KEY = "fyxvo-alert-threshold";
const ALERT_CURRENT_APY_KEY = "fyxvo-current-apy";

type RebalanceAlertsPanelProps = {
  standalone?: boolean;
  compact?: boolean;
};

export function RebalanceAlertsPanel({
  standalone = false,
  compact = false,
}: RebalanceAlertsPanelProps) {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [threshold, setThreshold] = useState("2");
  const [currentApy, setCurrentApy] = useState("5");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedThreshold = window.localStorage.getItem(ALERT_THRESHOLD_KEY);
    const storedCurrentApy = window.localStorage.getItem(ALERT_CURRENT_APY_KEY);

    if (storedThreshold) {
      setThreshold(storedThreshold);
    }

    if (storedCurrentApy) {
      setCurrentApy(storedCurrentApy);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ALERT_THRESHOLD_KEY, threshold);
  }, [threshold]);

  useEffect(() => {
    window.localStorage.setItem(ALERT_CURRENT_APY_KEY, currentApy);
  }, [currentApy]);

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

  const parsedThreshold = Number(threshold) || 0;
  const parsedCurrentApy = Number(currentApy) || 0;

  const betterOpportunities = useMemo(() => {
    return opportunities.filter(
      (opportunity) => opportunity.apy - parsedCurrentApy >= parsedThreshold,
    );
  }, [opportunities, parsedCurrentApy, parsedThreshold]);

  const wrapperClass = compact ? "space-y-4" : "space-y-6";

  return (
    <div className={wrapperClass}>
      {standalone ? (
        <PageHeader
          eyebrow="Automation"
          title="Rebalance Alerts"
          description="Set your current portfolio APY and an improvement threshold. The panel will surface any live opportunities that beat your baseline by the delta you care about."
        />
      ) : null}

      <Panel className="grid gap-4 px-5 py-5 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-emerald-400/70">
            Alert Logic
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            We trigger a rebalance alert when an opportunity&apos;s APY is at
            least your current APY plus the alert delta. Settings persist in
            localStorage so the dashboard keeps your baseline between visits.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Current APY %
            </span>
            <input
              value={currentApy}
              onChange={(event) => setCurrentApy(event.target.value)}
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Improvement Delta %
            </span>
            <input
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/40"
            />
          </label>
        </div>
      </Panel>

      {loading ? (
        <StatePanel
          title="Scanning Market"
          message="Comparing fresh opportunities against your saved APY threshold."
        />
      ) : error ? (
        <StatePanel title="Alert Engine Error" message={error} tone="error" />
      ) : betterOpportunities.length > 0 ? (
        <Panel className="border-emerald-400/30 bg-emerald-500/10 px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-emerald-300">
            Opportunity Detected
          </div>
          <p className="text-sm leading-6 text-emerald-100">
            {betterOpportunities[0]?.protocol} {betterOpportunities[0]?.asset}
            {" "}is yielding {formatPercent(betterOpportunities[0]?.apy ?? 0)},
            which beats your baseline of {formatPercent(parsedCurrentApy)} by at
            least {formatPercent(parsedThreshold)}.
          </p>
        </Panel>
      ) : (
        <StatePanel
          title="No Better Match Yet"
          message="No live opportunity is currently clearing your rebalance threshold. Your saved settings remain active."
          tone="empty"
        />
      )}

      {!compact && !loading && !error && betterOpportunities.length > 0 ? (
        <Panel className="px-2 py-2">
          <div className="border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
            Matched Opportunities
          </div>
          <OpportunitiesTable opportunities={betterOpportunities} />
        </Panel>
      ) : null}
    </div>
  );
}
