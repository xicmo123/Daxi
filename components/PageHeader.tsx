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
    <div className="relative px-6 pt-8 pb-8 text-center">
      {eyebrow ? (
        <div
          className="text-[11px] font-normal tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--ink-soft)" }}
        >
          {eyebrow}
        </div>
      ) : null}
      <h1 className="font-serif text-2xl font-semibold tracking-wide">{title}</h1>
      {subtitle ? (
        <div className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
          {subtitle}
        </div>
      ) : null}
      {right ? <div className="absolute right-6 top-8">{right}</div> : null}
    </div>
  );
}
