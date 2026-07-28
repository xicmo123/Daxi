"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export type StatusBlock = "wood" | "moss" | "river" | "red";

export type StatusButton = {
  href: string;
  label: string;
  block: StatusBlock;
  icon: ReactNode;
  count?: number;
};

// Big gradient number-card — directly modeled on iRead 臺北市立圖書館's home
// screen "個人借閱證" widget (name + 借閱中/預約中/閱讀存摺點數 as three big
// numbers side by side, separated by hairlines, on one teal-to-gold gradient
// card that overlaps the banner photo). Same three links/counts as before,
// just number-forward instead of icon-badge-forward.
export default function ResidentStatusButtons({ items }: { items: StatusButton[] }) {
  return (
    <div className="safe-page-x">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(120deg, var(--block-wood) 0%, var(--block-river-deep) 100%)",
          boxShadow: "var(--shadow-float)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
          <span className="text-[11px] font-bold tracking-[0.14em]" style={{ color: "rgba(43,36,32,0.72)" }}>
            大溪今日動態
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} aria-hidden>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--block-fg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </div>
        <div className="grid grid-cols-3 px-1 pb-3.5">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-2 text-center transition-opacity active:opacity-70"
              style={i > 0 ? { borderLeft: "1px solid rgba(43,36,32,0.16)" } : undefined}
            >
              <div className="text-[26px] font-bold leading-none" style={{ color: "var(--block-fg)" }}>
                {item.count ?? 0}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold" style={{ color: "rgba(43,36,32,0.78)" }}>
                <span className="w-[13px] h-[13px] block">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
