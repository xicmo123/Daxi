import type { ReactNode } from "react";

export type PageTint = "wood" | "moss" | "river";

const tintBg: Record<PageTint, string> = {
  wood: "linear-gradient(160deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
  moss: "linear-gradient(160deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
  river: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
};

// Solid color-block banner behind the title, chicTrip-style — each section
// of the app gets its own hue instead of one uniform cream wash throughout.
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  tint,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  tint?: PageTint;
}) {
  const ink = tint ? "var(--block-fg)" : "var(--ink)";
  const soft = tint ? "rgba(43,36,32,0.7)" : "var(--ink-soft)";

  return (
    <div
      className="relative safe-page-x pt-8 pb-7 text-center sm:pt-10 sm:pb-8 lg:pt-12"
      style={
        tint
          ? { background: tintBg[tint], borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }
          : undefined
      }
    >
      <div className="relative">
        {eyebrow ? (
          <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-2" style={{ color: soft }}>
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-wide sm:text-[28px] lg:text-[32px]" style={{ color: ink }}>
          {title}
        </h1>
        {subtitle ? (
          <div className="text-[13px] mt-2 font-medium" style={{ color: tint ? "rgba(43,36,32,0.82)" : "var(--ink)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="absolute right-4 top-8 sm:right-6 sm:top-10">{right}</div> : null}
    </div>
  );
}
