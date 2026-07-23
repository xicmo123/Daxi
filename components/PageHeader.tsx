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
    <div className="relative safe-page-x pt-8 pb-7 text-center sm:pt-10 sm:pb-8 lg:pt-12">
      <div className="relative">
        {eyebrow ? (
          <div
            className="text-[11px] font-normal tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-serif text-2xl font-bold tracking-wide sm:text-[28px] lg:text-[32px]" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        {subtitle ? (
          <div className="text-[13px] mt-2 font-medium" style={{ color: "var(--ink)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="absolute right-4 top-8 sm:right-6 sm:top-10">{right}</div> : null}
    </div>
  );
}
