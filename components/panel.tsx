import { PropsWithChildren } from "react";

type PanelProps = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`panel-strong rounded-2xl ${className}`}>{children}</section>
  );
}
