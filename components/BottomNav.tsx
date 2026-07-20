"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "首頁",
    // 豆干 — two stacked tofu cubes
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="5" y="9" width="8" height="8" rx="1" />
        <rect x="11" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    href: "/spots",
    label: "景點",
    // 舞龍舞獅 — a lion-dance head
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="14" r="6.5" />
        <circle cx="9.3" cy="13" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.7" cy="13" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8.5 10c1.5-1.8 5.5-1.8 7 0" />
        <path d="M12 3.5c-1.6 1.3-1.6 3.4 0 4.7 1.6-1.3 1.6-3.4 0-4.7Z" />
      </svg>
    ),
  },
  {
    href: "/businesses",
    label: "商家",
    // 木藝 — a log's growth-ring cross-section
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.3" />
      </svg>
    ),
  },
  {
    href: "/parking",
    label: "停車",
    // 陀螺 — a spinning top
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="10.5" y="2.5" width="3" height="2.5" rx="0.5" />
        <path d="M7 7.5h10l-1.7 4.5h-6.6L7 7.5Z" />
        <path d="M9.3 12h5.4L12 20.5 9.3 12Z" />
      </svg>
    ),
  },
  {
    href: "/weather",
    label: "路況",
    // 水庫 — mountains cradling rippled water
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M3 12.5 7 6l3.5 4.5L14.5 5 21 12.5" />
        <path d="M3 16.5c1.8-1.3 3.6-1.3 5.4 0s3.6 1.3 5.4 0 3.6-1.3 5.4 0" />
        <path d="M3 19.5c1.8-1.3 3.6-1.3 5.4 0s3.6 1.3 5.4 0 3.6-1.3 5.4 0" />
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
