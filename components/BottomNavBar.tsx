"use client";

// The one tab bar, worn by both halves of the app.
//
// There used to be two hand-written bars: BottomNav (tourist) and
// ResidentBottomNav (resident). They had drifted apart in ways a user feels
// even if they can't name them — different active-state markup, different
// opacity for the inactive state, and a raised floating circle on the resident
// side that the tourist side didn't have. Worse, the fifth slot meant two
// different things: 我的 for tourists, 關於 for residents, so switching modes
// moved the user's own settings out from under their thumb.
//
// The float is gone with it. It overlapped page content at the bottom of
// /resident (「用服務」 was rendering underneath it), and a raised centre
// button is a "compose"/"scan" affordance — 服務 is a list of links, not a
// primary creative action.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { tapLight } from "@/lib/haptics";

export type NavTab = {
  href: string;
  label: string;
  /** Extra routes that should also light this tab up. */
  alsoActiveOn?: string[];
  icon: ReactNode;
};

export default function BottomNavBar({
  tabs,
  accent,
  accentSoft,
  ariaLabel,
}: {
  tabs: NavTab[];
  /** Active colour token — the one thing the two bars legitimately differ on. */
  accent: string;
  accentSoft: string;
  ariaLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav fixed bottom-0 inset-x-0 z-20 flex justify-center glass-nav" aria-label={ariaLabel}>
      <div
        className="mx-auto grid w-full max-w-md border-t md:max-w-3xl md:border-x lg:max-w-6xl"
        style={{ borderColor: "var(--line)", gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href || Boolean(tab.alsoActiveOn?.includes(pathname));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={tapLight}
              className="relative flex flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-2 transition-opacity active:opacity-70"
              // Inactive was opacity 0.54, which against --paper lands at about
              // 3.3:1 — under the 4.5:1 WCAG AA floor for the 10.5px label.
              // 0.78 clears it while still reading as clearly unselected.
              style={{ minHeight: 56, color: active ? accent : "var(--ink)", opacity: active ? 1 : 0.78 }}
            >
              <span
                aria-hidden
                className="absolute top-1.5 h-0.5 w-5 rounded-full transition-opacity duration-300"
                style={{ background: accent, opacity: active ? 1 : 0 }}
              />
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ease-out"
                style={{ background: active ? accentSoft : "transparent", transform: active ? "scale(1.08)" : "scale(1)" }}
              >
                {tab.icon}
              </span>
              <span className="text-app-micro font-medium tracking-wide" style={{ lineHeight: 1.1 }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
