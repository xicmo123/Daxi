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

// Icon-forward button row — was three separate white cards each with their
// own shadow, floating with visible gaps between them (read as three
// disconnected islands). Now one shared card container with hairline
// dividers between items, so the row reads as a single grouped module —
// matching the card language used by the bulletin section right below it.
export default function ResidentStatusButtons({ items }: { items: StatusButton[] }) {
  return (
    <div className="safe-page-x pt-4">
      <div
        className="grid grid-cols-3 rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
            whileTap={{ scale: 0.94 }}
            style={i > 0 ? { borderLeft: "1px solid var(--line)" } : undefined}
          >
            <Link href={item.href} className="relative flex flex-col items-center gap-1.5 px-2 py-3.5">
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
    </div>
  );
}
