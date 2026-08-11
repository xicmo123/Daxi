"use client";

// Tourist tab bar. Layout, active states and haptics all live in
// BottomNavBar — this file is only the destinations.
//
// Five, per iOS HIG's tab-bar guidance. 景點 and 商家 are one 探索 tab because
// they're the same mental model (places near you, as a list or on a map) and
// both routes keep their own URL for deep links and SEO. The fifth slot is 我的
// in both halves of the app, so a user's own settings never move when they
// switch modes.
import BottomNavBar, { type NavTab } from "./BottomNavBar";

const tabs: NavTab[] = [
  {
    href: "/",
    label: "首頁",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 11.5 12 5l7.5 6.5" />
        <path d="M6.5 10.3v8.2h11v-8.2" />
        <path d="M9.5 18.5v-5h5v5" />
        <path d="M8.2 8.7V6h2.3" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "活動",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 5.8h8" />
        <path d="M9 4.1h6" />
        <path d="M8.6 7.3c-1.2 1.3-1.8 3.1-1.8 5s.6 3.7 1.8 5" />
        <path d="M15.4 7.3c1.2 1.3 1.8 3.1 1.8 5s-.6 3.7-1.8 5" />
        <path d="M9 18.2h6" />
        <path d="M12 5.8v12.4" />
        <path d="M4.6 9.1l.6 1.1 1.1.6-1.1.6-.6 1.1-.6-1.1-1.1-.6 1.1-.6Z" />
      </svg>
    ),
  },
  {
    href: "/spots",
    label: "探索",
    alsoActiveOn: ["/businesses"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s6.4-5.9 6.4-10.7a6.4 6.4 0 0 0-12.8 0C5.6 15.1 12 21 12 21Z" />
        <circle cx="12" cy="10.3" r="2.2" />
        <path d="m6.3 18.6 3.1-1.2" />
        <path d="m17.7 18.6-3.1-1.2" />
      </svg>
    ),
  },
  {
    href: "/parking",
    label: "停車",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="4" width="15" height="15" rx="4" />
        <path d="M10 15.8V8.2h3.1a2.45 2.45 0 1 1 0 4.9H10" />
        <path d="M17.6 18.7 19.2 21l1.6-2.3" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "我的",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8.6" r="3.6" />
        <path d="M5.2 19.4a6.8 6.8 0 0 1 13.6 0" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  return <BottomNavBar tabs={tabs} accent="var(--daxi-red)" accentSoft="var(--daxi-red-soft)" ariaLabel="主導覽" />;
}
