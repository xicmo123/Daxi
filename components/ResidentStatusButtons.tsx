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
  /** `null` means the upstream source could not be read — not "zero". */
  count: number | null;
};

function compactLabel(label: string) {
  if (label.includes("停水")) return "停水";
  if (label.includes("道路")) return "施工";
  if (label.includes("公告")) return "公告";
  return label;
}

export default function ResidentStatusButtons({ items }: { items: StatusButton[] }) {
  return (
    <div className="safe-page-x">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex items-center gap-2 overflow-hidden rounded-2xl px-3 py-2.5"
        style={{
          background: "linear-gradient(120deg, rgba(215,160,107,0.28) 0%, rgba(125,168,201,0.34) 100%)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="shrink-0">
          <div className="text-[10px] font-black tracking-[0.12em]" style={{ color: "var(--block-wood-deep)" }}>
            大溪今日動態
          </div>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
          {items.map((item) => {
            // A dash, not a 0. Rendering "停水停電 0" when 台水/台電 is
            // unreachable tells a resident "nothing is wrong today", which is
            // the opposite of what we actually know.
            const unknown = item.count === null;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={unknown ? `${item.label}：資料暫時無法取得` : `${item.label}：${item.count} 筆`}
                title={unknown ? "資料來源暫時無回應，點入看官方頁面" : undefined}
                className="flex min-w-0 items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition-opacity active:opacity-70"
                style={{ background: "rgba(255,255,255,0.38)" }}
              >
                <span className="w-3 h-3 shrink-0">{item.icon}</span>
                <span
                  className="text-[15px] font-black leading-none tabular-nums"
                  style={{ color: unknown ? "var(--ink-soft)" : "var(--ink)" }}
                >
                  {unknown ? "—" : item.count}
                </span>
                <span className="truncate text-[10.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
                  {compactLabel(item.label)}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
