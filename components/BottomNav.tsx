"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
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
    label: "景點",
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
    href: "/businesses",
    label: "商家",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9.5h14l-1.1-4h-11.8Z" />
        <path d="M6 9.5v9h12v-9" />
        <path d="M8 9.5v1.2a2 2 0 0 0 4 0V9.5" />
        <path d="M12 9.5v1.2a2 2 0 0 0 4 0V9.5" />
        <path d="M9 18.5v-4h6v4" />
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
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 flex glass-nav"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-md border-t md:border-x"
        style={{
          borderColor: "var(--line)",
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: "28rem",
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href === "/parking" && pathname === "/weather");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1.5 py-3 transition-opacity active:opacity-70"
              style={{
                color: active ? "var(--daxi-red)" : "var(--ink)",
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
                style={{ background: "var(--daxi-red)", opacity: active ? 1 : 0 }}
              />
              <span
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "var(--daxi-red-soft)" : "transparent",
                  transform: active ? "scale(1.08)" : "scale(1)",
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10.5px] font-normal tracking-wide transition-all duration-300"
                style={{ fontSize: 10.5, fontWeight: 400, lineHeight: 1.1 }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
