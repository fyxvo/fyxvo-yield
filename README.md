# Fyxvo Yield Terminal

Standalone Solana yield aggregator dashboard built with Next.js, TypeScript, Tailwind CSS, and `@fyxvo/sdk`.

## Features

- Live yield discovery across Kamino, MarginFi, and Orca
- Read-only wallet tracker for Solana addresses
- Rebalance alerts with localStorage persistence
- Static risk scoring with badge tooltips
- Dark, terminal-inspired data-dense UI

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- `@fyxvo/sdk` for all Solana RPC calls

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Add your Fyxvo API key to `.env.local`:

```bash
NEXT_PUBLIC_FYXVO_API_KEY=fyxvo_live_your_key_here
```

4. Start the development server:

```bash
pnpm dev
```

5. Open `http://localhost:3000`.

## Routes

- `/` Yield discovery dashboard
- `/wallet` Wallet tracker
- `/alerts` Rebalance alerts
- `/risk` Risk methodology and scoring

## Notes

- Solana RPC calls are routed through `@fyxvo/sdk`.
- Kamino and Orca yield data use their public protocol APIs.
- Wallet position matching currently provides the best coverage for Kamino Earn vault positions; other protocol exposures may appear only in the token balance inventory.

## Validation

Run the standard checks:

```bash
pnpm lint
pnpm build
pnpm dev
```
