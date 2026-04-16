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
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em]",
              active
                ? "border-emerald-400/50 bg-emerald-500/14 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.16)]"
                : "border-white/8 bg-black/30 text-zinc-400 hover:border-emerald-500/25 hover:text-zinc-100",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
