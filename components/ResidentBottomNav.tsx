"use client";

// Resident tab bar — same component as the tourist one, different
// destinations and accent. See components/BottomNavBar.tsx.
//
// 關於 used to occupy the fifth slot here (opening a modal) while the tourist
// bar used it for 我的. That meant switching modes moved the user's own
// settings; 關於 now lives as a row inside 我的 on both sides, where the
// notification settings and identity switch already are.
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
    href: "/resident/profile",
    label: "我的",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8.6" r="3.6" />
        <path d="M5.2 19.4a6.8 6.8 0 0 1 13.6 0" />
      </svg>
    ),
  },
];

export default function ResidentBottomNav() {
  return <BottomNavBar tabs={tabs} accent="var(--river-teal)" accentSoft="var(--river-teal-soft)" ariaLabel="大溪人導覽" />;
}
