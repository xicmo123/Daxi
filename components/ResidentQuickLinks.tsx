"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export type QuickLinkBlock = "wood" | "moss" | "river" | "red";

const gradientCard: Record<QuickLinkBlock, { background: string; fg: string; fgSoft: string }> = {
  wood: {
    background: "linear-gradient(135deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  moss: {
    background: "linear-gradient(135deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  river: {
    background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  red: {
    background: "linear-gradient(135deg, var(--daxi-red) 0%, color-mix(in srgb, var(--daxi-red) 100%, black 28%) 100%)",
    fg: "#fff",
    fgSoft: "rgba(255,255,255,0.82)",
  },
};

export type QuickLink = { href: string; label: string; desc: string; block: QuickLinkBlock; icon: ReactNode };

// Full-gradient tiles (the same 135deg treatment already used for the
// TodayStatusRow stat cards) instead of flat white cards with a thin accent
// bar — plus a staggered pop-in and a tap-scale bounce, borrowing the
// tourist side's liveliness while staying anchored in the resident section's
// wood/moss/river/red block palette rather than tourist's photo-card style.
export default function ResidentQuickLinks({ links, extra }: { links: QuickLink[]; extra?: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 safe-page-x pt-5">
      {links.map((q, i) => {
        const card = gradientCard[q.block];
        return (
          <motion.div
            key={q.href}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.35, ease: "easeOut" }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={q.href}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl px-3 py-3"
              style={{ background: card.background, boxShadow: "var(--shadow-card)" }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-2"
                style={{ background: "rgba(255,255,255,0.3)", color: card.fg }}
              >
                <span className="w-[17px] h-[17px] block">{q.icon}</span>
              </span>
              <div className="text-[12.5px] font-bold leading-snug" style={{ color: card.fg }}>
                {q.label}
              </div>
              <div className="text-[10px] mt-0.5 leading-snug" style={{ color: card.fgSoft }}>
                {q.desc}
              </div>
            </Link>
          </motion.div>
        );
      })}
      {extra}
    </div>
  );
}
