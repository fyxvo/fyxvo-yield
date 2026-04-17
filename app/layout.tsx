import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Fyxvo Yield — Solana Yield Aggregator",
    template: "%s | Fyxvo Yield",
  },
  description:
    "Live Solana yield discovery across Kamino, MarginFi, and Orca. Compare APY, track wallet positions, set rebalance alerts, and review protocol risk — all powered by the Fyxvo RPC network.",
  metadataBase: new URL("https://yield.fyxvo.com"),
  openGraph: {
    type: "website",
    url: "https://yield.fyxvo.com",
    siteName: "Fyxvo Yield",
    title: "Fyxvo Yield — Solana Yield Aggregator",
    description:
      "Live yield discovery across Kamino, MarginFi, and Orca on Solana mainnet.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fyxvo Yield — Solana Yield Aggregator",
    description:
      "Live yield discovery across Kamino, MarginFi, and Orca on Solana mainnet.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="site-grid min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/60 px-5 py-5 shadow-[0_0_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(249,115,22,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="https://www.fyxvo.com"
                  className="shrink-0 transition-opacity hover:opacity-80"
                  title="Back to Fyxvo"
                >
                  <Image
                    src="/logo.png"
                    alt="Fyxvo"
                    width={36}
                    height={36}
                    className="rounded-lg"
                    priority
                  />
                </a>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xl font-semibold tracking-tight text-zinc-100">
                      Fyxvo
                    </span>
                    <span className="rounded border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-orange-300">
                      Yield
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Solana yield aggregator — Kamino · MarginFi · Orca
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-400">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-orange-400/80">
                    RPC
                  </span>
                  <span className="ml-2">Powered by{" "}
                    <a
                      href="https://www.fyxvo.com"
                      className="text-zinc-300 transition-colors hover:text-orange-300"
                    >
                      @fyxvo/sdk
                    </a>
                  </span>
                </div>
              </div>
            </header>
            <SiteNav />
            <main className="flex-1">{children}</main>
            <footer className="mt-8 border-t border-white/8 py-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Fyxvo" width={28} height={28} className="rounded-lg" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-zinc-100">Fyxvo Yield</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Solana yield aggregator</p>
                    </div>
                  </div>
                  <p className="max-w-xs text-xs leading-5 text-zinc-600">
                    Live yield discovery across Kamino, MarginFi, and Orca on Solana mainnet. Not financial advice.
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
                    <a href="https://www.fyxvo.com" className="transition-colors hover:text-orange-400" target="_blank" rel="noreferrer">fyxvo.com</a>
                    <a href="https://yield.fyxvo.com" className="transition-colors hover:text-orange-400">yield.fyxvo.com</a>
                    <a href="https://status.fyxvo.com" className="transition-colors hover:text-orange-400" target="_blank" rel="noreferrer">status.fyxvo.com</a>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a href="https://github.com/fyxvo" target="_blank" rel="noreferrer" aria-label="GitHub" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-zinc-500 transition-colors hover:border-orange-500/30 hover:text-zinc-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.162 19.49c.5.092.683-.216.683-.48 0-.237-.009-.866-.014-1.7-2.782.605-3.37-1.34-3.37-1.34-.455-1.157-1.11-1.466-1.11-1.466-.908-.62.07-.608.07-.608 1.004.071 1.533 1.03 1.533 1.03.892 1.53 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.338-2.221-.253-4.556-1.11-4.556-4.943 0-1.092.39-1.985 1.03-2.684-.104-.253-.447-1.274.098-2.656 0 0 .84-.269 2.75 1.025A9.55 9.55 0 0 1 12 6.844c.85.004 1.708.115 2.508.337 1.909-1.294 2.748-1.025 2.748-1.025.547 1.382.204 2.403.1 2.656.64.699 1.028 1.592 1.028 2.684 0 3.842-2.338 4.687-4.566 4.935.36.31.68.922.68 1.858 0 1.34-.012 2.422-.012 2.752 0 .267.18.577.688.479A10 10 0 0 0 12 2Z"/></svg>
                    </a>
                    <a href="https://x.com/fyxvo" target="_blank" rel="noreferrer" aria-label="X" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-zinc-500 transition-colors hover:border-orange-500/30 hover:text-zinc-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M18.901 2H22l-6.767 7.733L23.2 22h-6.24l-4.887-7.447L5.555 22H2.455l7.238-8.273L.8 2h6.398l4.418 6.738L18.901 2Zm-1.087 18h1.718L6.267 3.896H4.424L17.814 20Z"/></svg>
                    </a>
                    <a href="https://discord.gg/Uggu236Jgj" target="_blank" rel="noreferrer" aria-label="Discord" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-zinc-500 transition-colors hover:border-orange-500/30 hover:text-zinc-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M20.317 4.369A19.791 19.791 0 0 0 15.458 3a13.215 13.215 0 0 0-.676 1.374 18.27 18.27 0 0 0-5.565 0A13.036 13.036 0 0 0 8.541 3a19.736 19.736 0 0 0-4.86 1.37C.533 9.042-.319 13.58.107 18.057a19.93 19.93 0 0 0 5.993 2.943 14.34 14.34 0 0 0 1.285-2.11 12.98 12.98 0 0 1-2.023-.98c.17-.12.337-.246.498-.375 3.904 1.821 8.135 1.821 11.993 0 .163.135.33.261.499.375-.648.384-1.328.712-2.027.981.37.75.801 1.454 1.287 2.109a19.862 19.862 0 0 0 6-2.944c.5-5.186-.85-9.684-3.295-13.688ZM8.02 15.331c-1.17 0-2.13-1.068-2.13-2.381 0-1.314.94-2.382 2.13-2.382 1.2 0 2.148 1.078 2.13 2.382 0 1.313-.94 2.381-2.13 2.381Zm7.96 0c-1.17 0-2.13-1.068-2.13-2.381 0-1.314.94-2.382 2.13-2.382 1.2 0 2.148 1.078 2.13 2.382 0 1.313-.93 2.381-2.13 2.381Z"/></svg>
                    </a>
                  </div>
                  <p className="text-[11px] text-zinc-700">© {new Date().getFullYear()} Fyxvo</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-3 text-xs">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Platform</p>
                    <div className="flex flex-col gap-2 text-zinc-500">
                      <a href="https://www.fyxvo.com" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Fyxvo Platform</a>
                      <a href="https://www.fyxvo.com/dashboard" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Dashboard</a>
                      <a href="https://www.fyxvo.com/pricing" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Pricing</a>
                      <a href="https://www.fyxvo.com/docs" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Docs</a>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Yield</p>
                    <div className="flex flex-col gap-2 text-zinc-500">
                      <Link href="/" className="transition-colors hover:text-zinc-300">Discovery</Link>
                      <Link href="/wallet" className="transition-colors hover:text-zinc-300">Wallet Tracker</Link>
                      <Link href="/alerts" className="transition-colors hover:text-zinc-300">Rebalance Alerts</Link>
                      <Link href="/risk" className="transition-colors hover:text-zinc-300">Risk Desk</Link>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Network</p>
                    <div className="flex flex-col gap-2 text-zinc-500">
                      <a href="https://status.fyxvo.com" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Status</a>
                      <a href="https://www.fyxvo.com/explore" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Explore</a>
                      <a href="https://www.fyxvo.com/security" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Security</a>
                      <a href="https://www.fyxvo.com/privacy" className="transition-colors hover:text-zinc-300" target="_blank" rel="noreferrer">Privacy</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
