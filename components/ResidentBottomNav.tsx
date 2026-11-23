"use client";

// Resident tab bar — same component as the tourist one, different
// destinations and accent. See components/BottomNavBar.tsx.
//
// The fifth slot is 關於 (/resident/about) — the owner's note and contact.
// 我的 settings (/resident/profile) are linked from that page and the full
// menu, and keep this tab lit while open.
import BottomNavBar, { type NavTab } from "./BottomNavBar";

const tabs: NavTab[] = [
  {
    href: "/resident",
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
    href: "/resident/announcements",
    label: "公告",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
        <path d="M4.8 20.2h14.4" />
        <path d="M9.2 8h5.6" />
        <path d="M9.2 11.2h5.6" />
        <path d="M9.2 14.4h3.4" />
      </svg>
    ),
  },
  {
    href: "/resident/services",
    label: "服務",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 8.5h15v10a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-10Z" />
        <path d="M8 8.5V6.8a2.3 2.3 0 0 1 2.3-2.3h3.4A2.3 2.3 0 0 1 16 6.8v1.7" />
        <path d="M4.5 12.8h15" />
      </svg>
    ),
  },
  {
    href: "/resident/outages",
    label: "停水停電",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3 5.5 13.5h4.8L11 21l7.5-10.5h-4.8L13 3Z" />
      </svg>
    ),
  },
  {
    // 關於 replaces 我的 on the resident side; the personal settings (居民卡、
    // 里別、通知) are one tap away from the About page and in the full menu.
    href: "/resident/about",
    label: "關於",
    alsoActiveOn: ["/resident/profile"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
];

export default function ResidentBottomNav() {
  return <BottomNavBar tabs={tabs} accent="var(--river-teal)" accentSoft="var(--river-teal-soft)" ariaLabel="大溪人導覽" />;
}
