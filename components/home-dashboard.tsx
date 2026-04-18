"use client";

import { useEffect, useMemo, useState } from "react";
import { CountUp } from "@/components/countup";
import { Globe } from "@/components/globe";
import { OpportunitiesTable } from "@/components/opportunities-table";
import { Panel } from "@/components/panel";
import { ParticleBackground } from "@/components/particle-background";
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
        if (!response.ok) throw new Error(payload.error ?? "Unable to load opportunities.");
        setOpportunities(payload.opportunities ?? []);
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        setError(
          caughtError instanceof Error ? caughtError.message : "Unable to load opportunities.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const metrics = useMemo(() => {
    const best = opportunities.reduce<YieldOpportunity | null>(
      (top, item) => (!top || item.apy > top.apy ? item : top),
      null,
    );
    const tvl = opportunities.reduce((sum, item) => sum + item.tvl, 0);
    const protocols = new Set(opportunities.map((item) => item.protocol));
    return { best, tvl, protocolCount: protocols.size };
  }, [opportunities]);

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="hero-section relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden">
        {/* Globe background */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <div className="relative h-full w-full max-w-3xl">
            <Globe className="h-full w-full" cameraZ={2.5} />
          </div>
        </div>

        {/* Radial glow behind globe */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(249,115,22,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-48"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-black/40 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-orange-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
            Live Solana Yield Intelligence
          </div>

          <h1
            className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            style={{
              background: "linear-gradient(135deg, #f1f5f9 0%, #f97316 50%, #fbbf24 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer-text 4s linear infinite",
            }}
          >
            Yield Discovery
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Live Solana yield scouting across Kamino, MarginFi, and Orca. Compare APY, TVL, and
            risk overlays with direct protocol links — all powered by Fyxvo RPC.
          </p>

          {/* Hero stats — count up on load */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { label: "Protocols Covered", value: 3, suffix: "" },
              { label: "Max APY Today", value: metrics.best ? Math.round(metrics.best.apy * 100) / 100 : 0, suffix: "%" },
              { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-zinc-100 sm:text-4xl">
                  <CountUp
                    target={s.value}
                    suffix={s.suffix}
                    decimals={(s as { decimals?: number }).decimals ?? 0}
                    duration={1800}
                  />
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#opportunities"
              className="glow-btn inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-400"
            >
              View Live Opportunities
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/risk"
              className="glow-btn-secondary inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-200 hover:border-orange-500/40 hover:bg-white/8"
            >
              Risk Methodology
            </a>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
      <div id="opportunities" className="relative animate-fade-up space-y-6 px-0 pb-8">
        {/* Particle background for dashboard sections */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40" aria-hidden="true">
          <ParticleBackground className="h-full w-full" />
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-3">
          <Panel className="glass-card card-hover animate-fade-up animation-delay-75 px-5 py-5">
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
          <Panel className="glass-card card-hover animate-fade-up animation-delay-150 px-5 py-5">
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
          <Panel className="glass-card card-hover animate-fade-up animation-delay-225 px-5 py-5">
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

        <div className="relative z-10">
          <RebalanceAlertsPanel compact />
        </div>

        {/* Infrastructure image banner */}
        <div className="relative z-10 overflow-hidden rounded-2xl" style={{ height: "220px" }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              backgroundAttachment: "local",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,20,0.7) 50%, rgba(10,10,15,0.85) 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 80% at 20% 50%, rgba(249,115,22,0.1) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />
          <div className="relative flex h-full items-center px-6" style={{ zIndex: 10 }}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-400/80">
                Powered by Fyxvo RPC
              </p>
              <h3 className="mt-2 text-xl font-bold text-zinc-100 sm:text-2xl">
                Live yield intelligence across Solana protocols
              </h3>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">
                Real-time APY and TVL snapshots fetched directly from Kamino, MarginFi, and Orca
                via the Fyxvo-backed Solana RPC network.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
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
                    Risk scores are static overlays based on audits, protocol age, and current TVL
                    range. Hover badges for explanations.
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
      </div>
    </div>
  );
}
