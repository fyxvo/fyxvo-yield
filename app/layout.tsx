import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
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
            <footer className="mt-8 border-t border-white/6 py-6 text-center text-xs text-zinc-600">
              <a
                href="https://www.fyxvo.com"
                className="transition-colors hover:text-orange-400"
              >
                fyxvo.com
              </a>
              <span className="mx-2">·</span>
              <span>Yield data from public protocol APIs. Not financial advice.</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
