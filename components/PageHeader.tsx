import type { ReactNode } from "react";

// No background image of its own — the whole app now has a fixed sketch
// wallpaper behind it (see SiteLayout), so a second image here would just
// double up on top of that.
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
    <div className="relative px-6 pt-10 pb-8 text-center">
      <div className="relative">
        {eyebrow ? (
          <div
            className="text-[11px] font-normal tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-serif text-2xl font-bold tracking-wide" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        {subtitle ? (
          <div className="text-[13px] mt-2 font-medium" style={{ color: "var(--ink)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="absolute right-6 top-10">{right}</div> : null}
    </div>
  );
}
