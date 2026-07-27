"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export type StatusBlock = "wood" | "moss" | "river" | "red";

const blockColor: Record<StatusBlock, string> = {
  wood: "var(--block-wood-deep)",
  moss: "var(--block-moss-deep)",
  river: "var(--block-river-deep)",
  red: "var(--daxi-red)",
};

export type StatusButton = {
  href: string;
  label: string;
  block: StatusBlock;
  icon: ReactNode;
  count?: number;
};

// Icon-forward button row — was three text-heavy gradient cards ("停水停電 /
// 1 筆預告"); now a colored icon badge + label, with the count (if any)
// as a small corner dot instead of a full sentence, so it reads at a glance
// like the quick-link tiles below it rather than as a block of text.
export default function ResidentStatusButtons({ items }: { items: StatusButton[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 safe-page-x pt-4">
      {items.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
          whileTap={{ scale: 0.94 }}
        >
          <Link
            href={item.href}
            className="relative flex flex-col items-center gap-1.5 rounded-xl px-2 py-3.5"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
          >
            <span
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: blockColor[item.block], color: "#fff" }}
            >
              <span className="w-[18px] h-[18px] block">{item.icon}</span>
              {item.count && item.count > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                  style={{ background: "var(--daxi-red)", color: "#fff", border: "1.5px solid var(--card)" }}
                >
                  {item.count}
                </span>
              ) : null}
            </span>
            <span className="text-[11px] font-bold text-center leading-tight" style={{ color: "var(--ink)" }}>
              {item.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
