import type { ProtocolName, RiskTier } from "@/lib/types";

type RiskProfile = {
  protocol: ProtocolName;
  score: number;
  tier: RiskTier;
  auditStatus: string;
  tvlRange: string;
  protocolAge: string;
  explanation: string;
};

const RISK_PROFILES: Record<ProtocolName, RiskProfile> = {
  Kamino: {
    protocol: "Kamino",
    score: 3,
    tier: "Low",
    auditStatus: "Audited, mature lending and vault suite",
    tvlRange: "$500M+ range",
    protocolAge: "Multi-year mainnet history",
    explanation:
      "Kamino scores low risk thanks to public audits, deep TVL, and a longer operating history on Solana. Vault complexity still adds strategy risk, but the base protocol profile is comparatively strong.",
  },
  MarginFi: {
    protocol: "MarginFi",
    score: 5,
    tier: "Medium",
    auditStatus: "Audited lending protocol",
    tvlRange: "$100M+ range",
    protocolAge: "Established but evolving",
    explanation:
      "MarginFi lands in medium risk: it has meaningful TVL and audit coverage, but active product iteration and money-market leverage dynamics justify a more cautious tier than Kamino.",
  },
  Orca: {
    protocol: "Orca",
    score: 5,
    tier: "Medium",
    auditStatus: "Audited AMM infrastructure",
    tvlRange: "$100M+ pools and broad usage",
    protocolAge: "Long-running Solana DEX",
    explanation:
      "Orca earns a medium score. The venue is mature and widely used, but LP strategies add impermanent loss and concentrated-liquidity management risk beyond plain lending markets.",
  },
};

export function getRiskProfile(protocol: ProtocolName) {
  return RISK_PROFILES[protocol];
}

export function getAllRiskProfiles() {
  return Object.values(RISK_PROFILES);
}
