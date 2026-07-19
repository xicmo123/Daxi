export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="px-5 pt-3 pb-4">
      {eyebrow ? (
        <div
          className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1"
          style={{ color: "var(--cognac-deep)" }}
        >
          {eyebrow}
        </div>
      ) : null}
      <h1 className="font-serif text-xl font-semibold">{title}</h1>
      {subtitle ? (
        <div className="text-[13px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
