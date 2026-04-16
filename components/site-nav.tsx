"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Discovery" },
  { href: "/wallet", label: "Wallet Tracker" },
  { href: "/alerts", label: "Rebalance Alerts" },
  { href: "/risk", label: "Risk Desk" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition-colors",
              active
                ? "border-orange-500/40 bg-orange-500/12 text-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.14)]"
                : "border-white/8 bg-black/30 text-zinc-400 hover:border-orange-500/20 hover:text-zinc-200",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="ml-auto hidden sm:block">
        <a
          href="https://www.fyxvo.com"
          className="rounded-full border border-white/8 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-500 transition-colors hover:border-orange-500/20 hover:text-zinc-300"
        >
          ← Fyxvo.com
        </a>
      </div>
    </nav>
  );
}
