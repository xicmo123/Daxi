"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import AboutModal from "./AboutModal";

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
    href: null,
    label: "關於",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 11v5.2" />
        <circle cx="12" cy="7.8" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

export default function ResidentBottomNav() {
  const pathname = usePathname();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 flex glass-nav"
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, display: "flex", justifyContent: "center" }}
    >
      <div
        className="mx-auto flex w-full max-w-md border-t md:max-w-3xl md:border-x lg:max-w-6xl"
        style={{
          borderColor: "var(--line)",
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          width: "100%",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.href !== null && pathname === tab.href;

          // Center tab gets a raised filled-circle treatment — borrowed from
          // iRead 臺北市立圖書館's home screen, where its primary action
          // ("手機借書") floats above the bar instead of sitting flush with
          // the other four. Same link/behavior as before, just visually
          // promoted since 服務 is the resident tab's equivalent primary action.
          if (tab.href === "/resident/services") {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1 py-2 transition-transform active:scale-95"
                style={{ textDecoration: "none", position: "relative" }}
              >
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 46,
                    height: 46,
                    marginTop: -26,
                    background: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
                    boxShadow: "var(--shadow-float)",
                    border: "3px solid var(--paper)",
                    color: "var(--block-fg)",
                  }}
                >
                  <span className="w-[20px] h-[20px] block">{tab.icon}</span>
                </span>
                <span
                  className="text-[10.5px] font-normal tracking-wide"
                  style={{ color: active ? "var(--river-teal)" : "var(--ink)", opacity: active ? 1 : 0.68 }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          const itemStyle: CSSProperties = {
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
            background: "none",
            border: "none",
            width: "100%",
          };
          const content = (
            <>
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
            </>
          );

          if (tab.href === null) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setShowAbout(true)}
                className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1.5 py-3 transition-opacity active:opacity-70"
                style={itemStyle}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 min-h-12 flex flex-col items-center justify-center gap-1.5 py-3 transition-opacity active:opacity-70"
              style={itemStyle}
            >
              {content}
            </Link>
          );
        })}
      </div>
      {showAbout ? <AboutModal onClose={() => setShowAbout(false)} /> : null}
    </nav>
  );
}
