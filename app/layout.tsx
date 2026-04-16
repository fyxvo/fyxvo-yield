import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
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
  title: "Fyxvo Yield Terminal",
  description: "Solana yield aggregator dashboard powered by @fyxvo/sdk",
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
        <div className="terminal-grid min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-black/70 px-5 py-5 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-400/70">
                  Solana Yield Aggregator
                </p>
                <div>
                  <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-100">
                    Fyxvo Yield Terminal
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Bloomberg-style yield discovery, wallet monitoring, alerts,
                    and protocol risk scoring for Solana mainnet.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-zinc-400">
                <div className="mb-1 text-[11px] uppercase tracking-[0.3em] text-emerald-400">
                  RPC Layer
                </div>
                <div>All on-chain reads route through `@fyxvo/sdk`.</div>
              </div>
            </header>
            <SiteNav />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
