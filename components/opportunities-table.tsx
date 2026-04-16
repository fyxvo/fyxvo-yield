import { RiskBadge } from "@/components/risk-badge";
import { formatMoney, formatPercent } from "@/lib/format";
import type { YieldOpportunity } from "@/lib/types";

type OpportunitiesTableProps = {
  opportunities: YieldOpportunity[];
};

export function OpportunitiesTable({
  opportunities,
}: OpportunitiesTableProps) {
  return (
    <div className="terminal-scrollbar overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <th className="border-b border-white/8 px-4 py-3 font-medium">
              Protocol
            </th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">
              Strategy
            </th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">
              Asset
            </th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">APY</th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">TVL</th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">
              Risk
            </th>
            <th className="border-b border-white/8 px-4 py-3 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id} className="group hover:bg-white/[0.025]">
              <td className="border-b border-white/5 px-4 py-4 text-zinc-100">
                {opportunity.protocol}
              </td>
              <td className="border-b border-white/5 px-4 py-4 text-zinc-400">
                {opportunity.strategyType}
              </td>
              <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                {opportunity.asset}
              </td>
              <td className="border-b border-white/5 px-4 py-4 font-medium text-emerald-300">
                {formatPercent(opportunity.apy)}
              </td>
              <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                {formatMoney(opportunity.tvl)}
              </td>
              <td className="border-b border-white/5 px-4 py-4">
                <RiskBadge protocol={opportunity.protocol} />
              </td>
              <td className="border-b border-white/5 px-4 py-4">
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-emerald-200 hover:border-emerald-400/50 hover:bg-emerald-500/14"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
