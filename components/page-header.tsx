type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      <p className="text-[11px] uppercase tracking-[0.35em] text-orange-400/70">
        {eyebrow}
      </p>
      <h2 className="font-sans text-3xl font-semibold tracking-tight text-zinc-100">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
