import { Panel } from "@/components/panel";

type StatePanelProps = {
  title: string;
  message: string;
  tone?: "default" | "error" | "empty";
};

export function StatePanel({
  title,
  message,
  tone = "default",
}: StatePanelProps) {
  const toneClass =
    tone === "error"
      ? "border-red-500/30 bg-red-500/8 text-red-100"
      : tone === "empty"
        ? "border-amber-500/20 bg-amber-500/8 text-amber-100"
        : "border-emerald-500/20 bg-emerald-500/8 text-emerald-100";

  return (
    <Panel className={`px-6 py-8 ${toneClass}`}>
      <div className="mb-2 text-[11px] uppercase tracking-[0.35em] opacity-80">
        {title}
      </div>
      <p className="max-w-2xl text-sm leading-6 opacity-90">{message}</p>
    </Panel>
  );
}
