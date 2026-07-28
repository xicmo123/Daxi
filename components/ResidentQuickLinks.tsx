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
    <div className="grid grid-cols-4 gap-2 safe-page-x pt-5">
      {links.map((q, i) => {
        const card = gradientCard[q.block];
        return (
          <motion.div
            key={q.href}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.35, ease: "easeOut" }}
            whileTap={{ scale: 0.85 }}
          >
            <Link href={q.href} className="flex flex-col items-center gap-1.5">
              <span
                className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: card.background, boxShadow: "var(--shadow-card)" }}
              >
                <motion.span
                  className="w-[17px] h-[17px] block"
                  style={{ color: card.fg }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 2.2 + (i % 3) * 0.3,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                >
                  {q.icon}
                </motion.span>
              </span>
              <div className="text-[10.5px] font-semibold leading-tight text-center" style={{ color: "var(--ink)" }}>
                {q.label}
              </div>
            </Link>
          </motion.div>
        );
      })}
      {extra}
    </div>
  );
}
