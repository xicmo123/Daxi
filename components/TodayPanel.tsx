import Link from "next/link";
import { SectionLabel } from "./ui/Card";

// 「今天的大溪」 — the state of the town right now, above the fold.
//
// The home page used to be a menu: a hero, a carousel and a row of links to
// four sections, each of which held one live number. A visitor standing at the
// 老街 with a phone wants those numbers, not the menu — is it raining, is
// anything on today, is there anywhere to park, are the buses running. All
// four already existed in this codebase; they were just one tap further away
// than they needed to be, on four separate pages.
//
// Server-rendered on purpose: every value here comes from a server fetch in
// app/(site)/page.tsx, so there is no client-side loading state to design and
// nothing shifts after paint.

export type TodayStat = {
  key: string;
  href: string;
  label: string;
  /** The number or short phrase that is the point of the tile. */
  value: string;
  /** Qualifier under the value — units, freshness, or why it is empty. */
  hint: string;
  tone: "wood" | "moss" | "river" | "muted";
};

// Flat pastel, not a gradient down to the -deep stop.
//
// The -deep stops are dark enough that the caption under each value drops to
// roughly 3.7:1 against them — under the 4.5:1 AA floor for text this size.
// On the flat pastel, --block-fg-soft clears 4.7:1 everywhere. The gradient
// was decoration; the number being readable is the entire point of the tile.
const TONE_STYLES: Record<TodayStat["tone"], { background: string; color: string }> = {
  wood: { background: "var(--block-wood)", color: "var(--block-fg)" },
  moss: { background: "var(--block-moss)", color: "var(--block-fg)" },
  river: { background: "var(--block-river)", color: "var(--block-fg)" },
  // For "no data right now" — a coloured tile would imply a live reading.
  muted: { background: "var(--card)", color: "var(--ink)" },
};

export default function TodayPanel({ stats }: { stats: TodayStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="safe-page-x pt-5" aria-labelledby="today-panel-heading">
      <SectionLabel className="mb-2">
        <span id="today-panel-heading">今天的大溪</span>
      </SectionLabel>

      {/* 2×2 rather than a 4-across row: at 375px four tiles left ~80px each,
          which truncated every label ("在地店家 …", "CCTV / …"). */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat) => {
          const tone = TONE_STYLES[stat.tone];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="flex flex-col justify-between rounded-2xl px-3.5 py-3 transition-transform active:scale-[0.98]"
              style={{ ...tone, minHeight: 92, boxShadow: "var(--shadow-card)" }}
            >
              {/* A solid secondary colour rather than opacity on the inherited
                  one: opacity blends toward the tile and was how the old
                  rgba(43,36,32,0.7) ended up failing contrast. */}
              <span className="text-app-caption font-bold" style={{ color: stat.tone === "muted" ? "var(--ink-soft)" : "var(--block-fg-soft)" }}>
                {stat.label}
              </span>
              <span className="mt-1.5 block">
                <span className="block text-app-title font-black leading-tight">{stat.value}</span>
                <span
                  className="mt-0.5 block text-app-caption"
                  style={{ color: stat.tone === "muted" ? "var(--ink-soft)" : "var(--block-fg-soft)" }}
                >
                  {stat.hint}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
