"use client";

import { useEffect, useRef, useState } from "react";
import { AssetLogo, ProtocolLogo } from "@/components/protocol-logo";
import { RiskBadge } from "@/components/risk-badge";
import { formatMoney, formatPercent } from "@/lib/format";
import type { YieldOpportunity } from "@/lib/types";

type OpportunitiesTableProps = {
  opportunities: YieldOpportunity[];
};

// Each row tracks mouse position for cursor-glow effect
function OpportunityRow({ opportunity, index }: { opportunity: YieldOpportunity; index: number }) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, active: false });
  const [visible, setVisible] = useState(false);

  // Staggered entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const onMouseMove = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };
  const onMouseLeave = () => setGlow((g) => ({ ...g, active: false }));

  const isHigh = opportunity.protocol === "Orca"; // simple heuristic for demo pulsing

  return (
    <tr
      ref={rowRef}
      className="opp-row group relative"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
      }}
    >
      {/* Cursor glow overlay */}
      {glow.active && (
        <td
          colSpan={7}
          className="pointer-events-none absolute inset-0 border-none p-0"
          aria-hidden="true"
          style={{
            background: `radial-gradient(200px circle at ${glow.x}px ${glow.y}px, rgba(249,115,22,0.06), transparent 70%)`,
            zIndex: 0,
          }}
        />
      )}

      <td className="relative z-10 border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="logo-entrance"
            style={{ animation: `logo-scale-in 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60 + 100}ms both` }}
          >
            <ProtocolLogo protocol={opportunity.protocol} size={20} />
          </div>
          <span className="text-zinc-100">{opportunity.protocol}</span>
        </div>
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4 text-zinc-400">
        {opportunity.strategyType}
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2">
          <AssetLogo asset={opportunity.asset} size={18} />
          <span className="text-zinc-300">{opportunity.asset}</span>
        </div>
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4 font-semibold tabular-nums">
        <span
          className="apy-text"
          style={{ color: "#fb923c", textShadow: "0 0 20px rgba(249,115,22,0.5)" }}
        >
          {formatPercent(opportunity.apy)}
        </span>
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4 text-zinc-300 tabular-nums">
        {formatMoney(opportunity.tvl)}
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4">
        <span className={isHigh ? "animate-pulse-glow" : ""}>
          <RiskBadge protocol={opportunity.protocol} />
        </span>
      </td>
      <td className="relative z-10 border-b border-white/5 px-4 py-4">
        <a
          href={opportunity.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="glow-btn-sm inline-flex rounded-full border border-orange-500/30 bg-orange-500/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-orange-200 transition-all duration-200 hover:border-orange-400/60 hover:bg-orange-500/16 hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
        >
          View
        </a>
      </td>
    </tr>
  );
}

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            {["Protocol", "Strategy", "Asset", "APY", "TVL", "Risk", "Action"].map((h) => (
              <th key={h} className="border-b border-white/8 px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp, i) => (
            <OpportunityRow key={opp.id} opportunity={opp} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
