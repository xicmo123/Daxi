"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "首頁",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 10 12 3l8 7" />
        <path d="M6 9v10h12V9" />
      </svg>
    ),
  },
  {
    href: "/spots",
    label: "景點",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.2" />
      </svg>
    ),
  },
  {
    href: "/businesses",
    label: "商家",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M4 9v10h16V9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    ),
  },
  {
    href: "/parking",
    label: "停車",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
      </svg>
    ),
  },
  {
    href: "/weather",
    label: "路況",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M9 21 10.5 3M15 21 13.5 3" />
        <path d="M12 5.5v2.5M12 11v2.5M12 16.5V19" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 flex glass-nav">
      <div className="mx-auto flex w-full max-w-md border-t md:border-x" style={{ borderColor: "var(--line)" }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1.5 py-3 transition-opacity active:opacity-70"
              style={{ color: "var(--ink)", opacity: active ? 1 : 0.4 }}
            >
              <span
                className="w-[21px] h-[21px] flex items-center justify-center transition-all duration-300 ease-out"
                style={{ transform: active ? "scale(1.08)" : "scale(1)" }}
              >
                {tab.icon}
              </span>
              <span className="text-[10.5px] font-normal tracking-wide transition-all duration-300">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
