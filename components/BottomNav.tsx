"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "首頁",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 10 12 3l8 7" />
        <path d="M6 9v10h12V9" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "活動",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
      </svg>
    ),
  },
  {
    href: "/parking",
    label: "停車",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
      </svg>
    ),
  },
  {
    href: "/weather",
    label: "路況",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 17a4 4 0 1 1 1.2-7.8A5 5 0 0 1 18 11a3.5 3.5 0 0 1-.5 7H7Z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 flex" style={{ background: "var(--paper-2)" }}>
      <div
        className="mx-auto flex w-full max-w-md border-t md:border-x"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center gap-1 py-2.5"
              style={{ color: active ? "var(--bordeaux)" : "var(--ink-soft)" }}
            >
              <span className="w-[22px] h-[22px]">{tab.icon}</span>
              <span className={`text-[11px] ${active ? "font-semibold" : ""}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
