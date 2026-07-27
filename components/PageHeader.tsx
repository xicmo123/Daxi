import type { ReactNode } from "react";

export type PageTint = "wood" | "moss" | "river";

const tintBg: Record<PageTint, string> = {
  wood: "linear-gradient(160deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
  moss: "linear-gradient(160deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
  river: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
};

// Solid color-block banner behind the title, chicTrip-style — each section
// of the app gets its own hue instead of one uniform cream wash throughout.
// Large flat silhouettes of Daxi motifs (old-street parapet, spinning top,
// dried-tofu blocks, the reservoir dam) break up the flat color fill
// without competing with the title — same tone-on-tone treatment as the
// plain geometric shapes this replaced, just recognizably "Daxi" now.
export function HeaderShapes() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      style={{ mixBlendMode: "overlay" }}
    >
      {/* 老街牌樓 — old-street shophouse parapet, scalloped Baroque skyline */}
      <svg x="-8%" y="-12%" width="150" height="100" viewBox="0 0 160 100">
        <path
          d="M0 100V46c6-16 16-24 24-12 4-16 18-22 28-8 6-18 22-24 32-4 6-16 20-20 28-4 6-14 18-16 24-2v84H0Z"
          fill="rgba(0,0,0,0.15)"
        />
      </svg>

      {/* 陀螺 — Daxi spinning top, top right */}
      <svg x="76%" y="-16%" width="120" height="120" viewBox="0 0 100 100">
        <path
          d="M50 6c15 0 24 11 24 25 0 11-5 19-12 25l-9 36a3.2 3.2 0 0 1-6.2 0l-9-36c-7-6-12-14-12-25 0-14 9-25 24-25Z"
          fill="rgba(255,255,255,0.22)"
        />
        <rect x="45" y="0" width="10" height="9" rx="2.5" fill="rgba(255,255,255,0.22)" />
      </svg>

      {/* 豆干 — stacked dried-tofu blocks, bottom left */}
      <svg x="8%" y="80%" width="86" height="86" viewBox="0 0 100 100">
        <rect x="10" y="36" width="54" height="54" rx="9" transform="rotate(-9 37 63)" fill="rgba(255,255,255,0.15)" />
        <rect x="34" y="12" width="54" height="54" rx="9" transform="rotate(7 61 39)" fill="rgba(255,255,255,0.22)" />
      </svg>

      {/* 水庫 — reservoir dam wall + ripples, bottom right */}
      <svg x="68%" y="80%" width="160" height="96" viewBox="0 0 170 96">
        <path d="M0 34 Q42 12 85 34 T170 34 V96H0Z" fill="rgba(0,0,0,0.15)" />
        <path
          d="M14 50 Q42 38 70 50 T126 50"
          stroke="rgba(255,255,255,0.24)"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </svg>
  );
}

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
      className="relative overflow-hidden safe-page-x pt-8 pb-7 text-center sm:pt-10 sm:pb-8 lg:pt-12"
      style={
        tint
          ? { background: tintBg[tint], borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }
          : undefined
      }
    >
      {tint ? <HeaderShapes /> : null}
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
