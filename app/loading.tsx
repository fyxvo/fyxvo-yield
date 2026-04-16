export default function Loading() {
  return (
    <div className="panel-strong rounded-2xl px-6 py-12">
      <div className="mb-3 text-[11px] uppercase tracking-[0.35em] text-orange-400/70">
        Loading
      </div>
      <div className="h-3 w-52 animate-pulse rounded-full bg-orange-500/20" />
      <div className="mt-4 h-3 w-80 animate-pulse rounded-full bg-zinc-800" />
      <div className="mt-2 h-3 w-64 animate-pulse rounded-full bg-zinc-800/80" />
    </div>
  );
}
