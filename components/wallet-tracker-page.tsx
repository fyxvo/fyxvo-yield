"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { StatePanel } from "@/components/state-panel";
import { formatMoney, formatPercent, shortenAddress } from "@/lib/format";
import type { WalletSnapshot } from "@/lib/types";

const SAMPLE_WALLET = "AxqtG9SHDkZTLSWg81Sp7VqAzQpRqXtR9ziJ3VQAS8As";

export function WalletTrackerPage() {
  const [walletAddress, setWalletAddress] = useState(SAMPLE_WALLET);
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/wallet?address=${encodeURIComponent(walletAddress)}`,
        { cache: "no-store" },
      );

      const payload = (await response.json()) as WalletSnapshot & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load wallet snapshot.");
      }

      setSnapshot(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load wallet snapshot.",
      );
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wallet Read-Only"
        title="Wallet Tracker"
        description="Paste any Solana mainnet address to inspect balances without signing. Token balances are fetched through the Fyxvo RPC gateway, and matched Kamino vault positions include estimated earnings."
      />

      <Panel className="px-5 py-5">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Solana Wallet Address
            </span>
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value.trim())}
              placeholder="Enter a base58 wallet address"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-orange-400/40"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-xl border border-orange-500/30 bg-orange-500/12 px-5 py-3 text-xs uppercase tracking-[0.24em] text-orange-200 transition-colors hover:border-orange-400/50 hover:bg-orange-500/18 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Scanning..." : "Track Wallet"}
          </button>
        </form>
      </Panel>

      {loading ? (
        <StatePanel
          title="Querying Wallet"
          message="Fetching SOL balance, SPL token accounts, and matched vault positions through the dashboard data layer."
        />
      ) : error ? (
        <StatePanel title="Wallet Query Error" message={error} tone="error" />
      ) : snapshot ? (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="px-5 py-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                Wallet
              </div>
              <div className="text-lg font-semibold text-zinc-100">
                {shortenAddress(snapshot.walletAddress)}
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Read-only tracking. No signing or transaction simulation.
              </p>
            </Panel>
            <Panel className="px-5 py-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                SOL Balance
              </div>
              <div className="text-3xl font-semibold text-orange-300">
                {snapshot.solBalance.toFixed(4)} SOL
              </div>
            </Panel>
            <Panel className="px-5 py-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                Detected Positions
              </div>
              <div className="text-3xl font-semibold text-zinc-100">
                {snapshot.positions.length}
              </div>
              <p className="mt-2 text-sm text-zinc-400">{snapshot.notes}</p>
            </Panel>
          </div>

          <Panel className="px-2 py-2">
            <div className="border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
              Token Balances
            </div>
            <div className="terminal-scrollbar overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    <th className="border-b border-white/8 px-4 py-3 font-medium">
                      Asset
                    </th>
                    <th className="border-b border-white/8 px-4 py-3 font-medium">
                      Balance
                    </th>
                    <th className="border-b border-white/8 px-4 py-3 font-medium">
                      Mint
                    </th>
                    <th className="border-b border-white/8 px-4 py-3 font-medium">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.tokenBalances.map((balance) => (
                    <tr key={balance.mint}>
                      <td className="border-b border-white/5 px-4 py-4 text-zinc-100">
                        {balance.symbol}
                      </td>
                      <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                        {balance.uiAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </td>
                      <td className="border-b border-white/5 px-4 py-4 text-zinc-500">
                        {shortenAddress(balance.mint)}
                      </td>
                      <td className="border-b border-white/5 px-4 py-4 text-zinc-400">
                        {balance.matchLabel ?? "Unmatched"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {snapshot.positions.length > 0 ? (
            <Panel className="px-2 py-2">
              <div className="border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                Matched Positions
              </div>
              <div className="terminal-scrollbar overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Protocol
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Asset
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Position
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        APY
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Daily
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Weekly
                      </th>
                      <th className="border-b border-white/8 px-4 py-3 font-medium">
                        Monthly
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.positions.map((position) => (
                      <tr key={position.id}>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-100">
                          {position.protocol}
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                          {position.asset}
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                          <div>
                            {position.estimatedUnderlying.toFixed(4)} {position.asset}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {formatMoney(position.estimatedUnderlyingUsd)}
                          </div>
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-orange-300">
                          {formatPercent(position.apy)}
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                          {position.dailyEarnings.toFixed(4)} {position.asset}
                          <div className="mt-1 text-xs text-zinc-500">
                            {formatMoney(position.dailyEarningsUsd)}
                          </div>
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                          {position.weeklyEarnings.toFixed(4)} {position.asset}
                          <div className="mt-1 text-xs text-zinc-500">
                            {formatMoney(position.weeklyEarningsUsd)}
                          </div>
                        </td>
                        <td className="border-b border-white/5 px-4 py-4 text-zinc-300">
                          {position.monthlyEarnings.toFixed(4)} {position.asset}
                          <div className="mt-1 text-xs text-zinc-500">
                            {formatMoney(position.monthlyEarningsUsd)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ) : (
            <StatePanel
              title="No Matched Vault Positions"
              message={snapshot.notes}
              tone="empty"
            />
          )}
        </div>
      ) : (
        <StatePanel
          title="Awaiting Wallet Input"
          message="Use the sample address above or paste another Solana wallet to inspect holdings."
        />
      )}
    </div>
  );
}
