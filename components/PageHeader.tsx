import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="px-5 pt-3 pb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
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
      {right ? <div className="shrink-0 pt-0.5">{right}</div> : null}
    </div>
  );
}
