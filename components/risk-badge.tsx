import { getRiskProfile } from "@/lib/risk";
import type { ProtocolName } from "@/lib/types";

type RiskBadgeProps = {
  protocol: ProtocolName;
};

export function RiskBadge({ protocol }: RiskBadgeProps) {
  const profile = getRiskProfile(protocol);

  const palette =
    profile.tier === "Low"
      ? "border-green-500/30 bg-green-500/12 text-green-200"
      : profile.tier === "Medium"
        ? "border-amber-500/30 bg-amber-500/12 text-amber-200"
        : "border-red-500/30 bg-red-500/12 text-red-200";

  return (
    <span
      title={profile.explanation}
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] ${palette}`}
    >
      {profile.tier}
    </span>
  );
}
