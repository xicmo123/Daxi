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
const TONE_STYLES: Record<TodayStat["tone"], { accent: string; icon: string }> = {
  wood: { accent: "var(--block-wood-deep)", icon: "☼" },
  moss: { accent: "var(--block-moss-deep)", icon: "⌁" },
  river: { accent: "var(--river-teal)", icon: "◉" },
  muted: { accent: "var(--ink-soft)", icon: "—" },
};

export default function TodayPanel({ stats }: { stats: TodayStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="safe-page-x pt-5" aria-labelledby="today-panel-heading">
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>
          <span id="today-panel-heading">現在的大溪</span>
        </SectionLabel>
        <span className="text-app-micro font-semibold" style={{ color: "var(--ink-soft)" }}>即時資訊</span>
      </div>

      {/* On a phone this remains an easy-to-scan two-by-two grid; on wider
          screens it becomes a four-card dashboard.  The old full-width rows
          made each tiny live reading occupy a disproportionate amount of
          vertical space. */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {stats.map((stat) => {
          const tone = TONE_STYLES[stat.tone];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="group relative min-w-0 overflow-hidden rounded-2xl border px-3 py-3.5 transition-transform active:scale-[0.98]"
              style={{ background: "var(--card)", borderColor: "var(--line)", boxShadow: "var(--shadow-card)" }}
            >
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-app-label font-black" style={{ background: `color-mix(in srgb, ${tone.accent} 16%, transparent)`, color: tone.accent }} aria-hidden>{tone.icon}</span>
              <span className="block min-w-0">
                <span className="block text-app-label font-bold" style={{ color: "var(--ink-soft)" }}>{stat.label}</span>
                <span className="mt-0.5 block truncate text-app-heading font-black leading-tight" style={{ color: "var(--ink)" }}>{stat.value}</span>
                <span className="mt-1 block truncate text-app-caption" style={{ color: "var(--ink-soft)" }}>{stat.hint}</span>
              </span>
              <span className="absolute right-3 top-3 text-app-heading transition-transform group-hover:translate-x-0.5" style={{ color: "var(--ink-soft)" }} aria-hidden>›</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
