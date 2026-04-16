export type ProtocolName = "Kamino" | "MarginFi" | "Orca";
export type StrategyType = "Lending" | "LP" | "Staking";
export type RiskTier = "Low" | "Medium" | "High";

export type YieldOpportunity = {
  id: string;
  protocol: ProtocolName;
  strategyType: StrategyType;
  asset: string;
  apy: number;
  tvl: number;
  riskTier: RiskTier;
  riskRationale: string;
  sourceUrl: string;
  vaultAddress?: string;
  updatedAt: string;
};

export type TokenBalance = {
  mint: string;
  symbol: string;
  uiAmount: number;
  rawAmount: string;
  decimals: number;
  matchLabel?: string;
};

export type WalletPosition = {
  id: string;
  protocol: ProtocolName;
  strategyType: StrategyType;
  asset: string;
  apy: number;
  vaultAddress: string;
  estimatedUnderlying: number;
  estimatedUnderlyingUsd: number;
  dailyEarnings: number;
  dailyEarningsUsd: number;
  weeklyEarnings: number;
  weeklyEarningsUsd: number;
  monthlyEarnings: number;
  monthlyEarningsUsd: number;
};

export type WalletSnapshot = {
  walletAddress: string;
  solBalance: number;
  tokenBalances: TokenBalance[];
  positions: WalletPosition[];
  notes: string;
};
