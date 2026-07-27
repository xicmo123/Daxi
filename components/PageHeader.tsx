import type { ReactNode } from "react";

export type PageTint = "wood" | "moss" | "river" | "red";

const tintBg: Record<PageTint, string> = {
  wood: "linear-gradient(160deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
  moss: "linear-gradient(160deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
  river: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
  red: "linear-gradient(160deg, var(--daxi-red) 0%, color-mix(in srgb, var(--daxi-red) 100%, black 28%) 100%)",
};

// Solid color-block banner behind the title, chicTrip-style — each section
// of the app gets its own hue instead of one uniform cream wash throughout.
// Large flat silhouettes of Daxi motifs (old-street parapet, spinning top,
// dried-tofu blocks, the reservoir) break up the flat color fill without
// competing with the title — same tone-on-tone treatment as the plain
// geometric shapes this replaced, just recognizably "Daxi" now.
export function HeaderShapes() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      style={{ mixBlendMode: "overlay" }}
    >
      {/* 老街牌樓 — old-street shophouse facade, stepped Baroque arch with two window slits */}
      <svg x="-6%" y="-14%" width="110" height="110" viewBox="0 0 100 100">
        <path
          d="M12 92V52c0-8 6-8 6-14c0-8 8-8 8-14c0-8 8-8 8-14c0-8 10-10 16-10s16 2 16 10c0 6 8 6 8 14c0 6 8 6 8 14c0 6 6 6 6 14v40Z"
          fill="rgba(255,255,255,0.2)"
        />
        <rect x="30" y="60" width="12" height="32" fill="rgba(0,0,0,0.16)" />
        <rect x="58" y="60" width="12" height="32" fill="rgba(0,0,0,0.16)" />
      </svg>

      {/* 陀螺 — Daxi spinning top, top right */}
      <svg x="74%" y="-14%" width="110" height="110" viewBox="0 0 100 100">
        <rect x="44" y="6" width="12" height="10" rx="2" fill="rgba(255,255,255,0.22)" />
        <path
          d="M50 14c18 0 28 14 28 30c0 12-6 20-14 25l-6 21a8 8 0 0 1-16 0l-6-21c-8-5-14-13-14-25c0-16 10-30 28-30Z"
          fill="rgba(255,255,255,0.22)"
        />
        <path d="M30 40Q50 48 70 40" stroke="rgba(0,0,0,0.14)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M33 52Q50 58 67 52" stroke="rgba(0,0,0,0.14)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* 豆干 — three stacked dried-tofu blocks, bottom left */}
      <svg x="4%" y="50%" width="64" height="64" viewBox="0 0 100 100">
        <rect x="12" y="50" width="34" height="34" rx="5" fill="rgba(255,255,255,0.12)" />
        <rect x="50" y="50" width="34" height="34" rx="5" fill="rgba(255,255,255,0.16)" />
        <rect x="31" y="16" width="34" height="34" rx="5" fill="rgba(255,255,255,0.22)" />
      </svg>

      {/* 水庫 — reservoir hills with rippled water, bottom right */}
      <svg x="76%" y="52%" width="84" height="66" viewBox="0 0 100 78">
        <path
          d="M0 44 L10 30 L22 42 L34 18 L46 38 L58 10 L70 36 L82 26 L100 40 V78 H0Z"
          fill="rgba(255,255,255,0.2)"
        />
        <path
          d="M4 58Q22 50 40 58T76 58T100 58"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="3.5"
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
  // The wood/moss/river tints are pastel enough for dark ink text; the
  // red tint is a much deeper, saturated fill (same contrast call already
  // made for the "red" gradient card on the resident home page) and needs
  // white instead.
  const ink = tint === "red" ? "#fff" : tint ? "var(--block-fg)" : "var(--ink)";
  const soft = tint === "red" ? "rgba(255,255,255,0.82)" : tint ? "rgba(43,36,32,0.7)" : "var(--ink-soft)";

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
          <div className="text-[13px] mt-2 font-medium" style={{ color: tint === "red" ? "rgba(255,255,255,0.9)" : tint ? "rgba(43,36,32,0.82)" : "var(--ink)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="absolute right-4 top-8 sm:right-6 sm:top-10">{right}</div> : null}
    </div>
  );
}
