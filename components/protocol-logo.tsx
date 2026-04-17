import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
};

const PROTOCOL_LOGOS: Record<string, string> = {
  Kamino: "/logos/kamino.svg",
  MarginFi: "/logos/marginfi.svg",
  Orca: "/logos/orca.svg",
  Raydium: "/logos/raydium.svg",
  Drift: "/logos/orca.svg",
};

const ASSET_LOGOS: Record<string, string> = {
  USDC: "/logos/usdc.svg",
  USDT: "/logos/usdt.svg",
  SOL: "/logos/solana.svg",
  FDUSD: "/logos/usdt.svg",
  PYUSD: "/logos/usdc.svg",
  USDG: "/logos/usdc.svg",
  USDS: "/logos/usdt.svg",
  tBTC: "/logos/bitcoin.svg",
  cbBTC: "/logos/bitcoin.svg",
  whETH: "/logos/ethereum.svg",
};

export function ProtocolLogo({
  protocol,
  size = 20,
  className,
}: LogoProps & { protocol: string }) {
  const src = PROTOCOL_LOGOS[protocol];
  if (!src) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400 ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        {protocol.slice(0, 1)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={protocol}
      width={size}
      height={size}
      className={`shrink-0 rounded ${className ?? ""}`}
    />
  );
}

export function AssetLogo({
  asset,
  size = 20,
  className,
}: LogoProps & { asset: string }) {
  const src = ASSET_LOGOS[asset];
  if (!src) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        {asset.slice(0, 1)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={asset}
      width={size}
      height={size}
      className={`shrink-0 rounded-full ${className ?? ""}`}
    />
  );
}
