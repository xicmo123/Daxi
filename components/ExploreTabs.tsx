"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The 探索 tab covers two routes; this segmented control is what tells the
// user that. Both keep their own URL so deep links and search results still
// land on the right list.
const segments = [
  { href: "/spots", label: "景點" },
  { href: "/businesses", label: "商家" },
];

export default function ExploreTabs() {
  const pathname = usePathname();

  return (
    <div className="safe-page-x pb-3">
      <div
        role="tablist"
        aria-label="探索分類"
        className="grid gap-1 rounded-2xl p-1"
        style={{ background: "var(--cognac-tint)", gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
      >
        {segments.map((segment) => {
          const active = pathname === segment.href;
          return (
            <Link
              key={segment.href}
              href={segment.href}
              role="tab"
              aria-selected={active}
              className="flex items-center justify-center rounded-xl text-[13px] font-bold transition-opacity active:opacity-75"
              style={{
                minHeight: 40,
                background: active ? "var(--card)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink-soft)",
                boxShadow: active ? "var(--shadow-card)" : "none",
              }}
            >
              {segment.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
