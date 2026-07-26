"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
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
        <circle cx="12" cy="8.3" r="3.3" />
        <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
      </svg>
    ),
  },
];

export default function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 flex glass-nav"
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, display: "flex", justifyContent: "center" }}
    >
      <div
        className="mx-auto flex w-full max-w-md border-t md:max-w-3xl md:border-x lg:max-w-5xl"
        style={{
          borderColor: "var(--line)",
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: "64rem",
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1.5 py-3 transition-opacity active:opacity-70"
              style={{
                color: active ? "var(--river-teal)" : "var(--ink)",
                opacity: active ? 1 : 0.54,
                minHeight: 56,
                padding: "8px 2px calc(8px + env(safe-area-inset-bottom))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                textDecoration: "none",
                position: "relative",
              }}
            >
              <span
                aria-hidden
                className="absolute top-1.5 h-0.5 w-5 rounded-full transition-opacity duration-300"
                style={{ background: "var(--river-teal)", opacity: active ? 1 : 0 }}
              />
              <span
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "var(--river-teal-soft)" : "transparent",
                  transform: active ? "scale(1.08)" : "scale(1)",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-[10.5px] font-normal tracking-wide transition-all duration-300" style={{ fontSize: 10.5, fontWeight: 400, lineHeight: 1.1 }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
