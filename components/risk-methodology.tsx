import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { getAllRiskProfiles } from "@/lib/risk";

export function RiskMethodology() {
  const profiles = getAllRiskProfiles();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Risk Desk"
        title="Protocol Risk Scoring"
        description="Static risk tiers help frame yield in context. Scores combine public audit posture, TVL band, and protocol age, then map to low, medium, or high terminal badges across the dashboard."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-emerald-400/70">
            Audit Status
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Audited protocols start from a lower base risk than unaudited
            systems. Active integrations and program complexity can still move
            the score up.
          </p>
        </Panel>
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-emerald-400/70">
            TVL Range
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Deeper liquidity and a larger capital base generally improve market
            resilience and execution confidence, but do not remove smart
            contract or liquidity risks.
          </p>
        </Panel>
        <Panel className="px-5 py-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-emerald-400/70">
            Protocol Age
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Older protocols with sustained usage and fewer major disruptions
            receive lower risk bands than newer or rapidly changing systems.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {profiles.map((profile) => {
          const badgeClass =
            profile.tier === "Low"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : profile.tier === "Medium"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                : "border-red-500/30 bg-red-500/10 text-red-200";

          return (
            <Panel key={profile.protocol} className="px-5 py-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                    {profile.protocol}
                  </div>
                  <h3 className="mt-2 font-sans text-2xl font-semibold text-zinc-100">
                    {profile.tier} Risk
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${badgeClass}`}
                >
                  Score {profile.score}/9
                </span>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                {profile.explanation}
              </p>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3">
                  <dt className="text-zinc-500">Audit status</dt>
                  <dd className="text-zinc-200">{profile.auditStatus}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3">
                  <dt className="text-zinc-500">TVL range</dt>
                  <dd className="text-zinc-200">{profile.tvlRange}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3">
                  <dt className="text-zinc-500">Protocol age</dt>
                  <dd className="text-zinc-200">{profile.protocolAge}</dd>
                </div>
              </dl>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
