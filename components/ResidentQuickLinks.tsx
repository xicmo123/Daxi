"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export type QuickLinkBlock = "wood" | "moss" | "river" | "red";

const gradientCard: Record<QuickLinkBlock, { background: string; fg: string; fgSoft: string }> = {
  wood: {
    background: "linear-gradient(160deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  moss: {
    background: "linear-gradient(160deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  river: {
    background: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  red: {
    background: "linear-gradient(160deg, var(--daxi-red) 0%, color-mix(in srgb, var(--daxi-red) 100%, black 28%) 100%)",
    fg: "#fff",
    fgSoft: "rgba(255,255,255,0.82)",
  },
};

export type QuickLink = { href: string; label: string; desc: string; block: QuickLinkBlock; icon: ReactNode };

// Horizontal cover-shelf — directly modeled on iRead 臺北市立圖書館's home
// screen "新書推薦" row (section header with a ">" more-chevron, then a
// horizontally-scrolling row of full-bleed cover tiles with the caption
// below each cover) instead of a static 4-column icon grid. Same 8 links,
// same destinations — just shelf-browsing instead of a fixed grid.
export default function ResidentQuickLinks({ links, extra }: { links: QuickLink[]; extra?: ReactNode }) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between safe-page-x mb-2.5">
        <div className="flex items-center gap-1.5">
          <span aria-hidden>🔗</span>
          <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
            常用服務
          </div>
        </div>
        <span aria-hidden style={{ color: "var(--ink-soft)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 safe-page-x" style={{ scrollbarWidth: "none" }}>
        {links.map((q, i) => {
          const card = gradientCard[q.block];
          return (
            <motion.div
              key={q.href}
              className="shrink-0 w-[86px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.35, ease: "easeOut" }}
              whileTap={{ scale: 0.94 }}
            >
              <Link href={q.href} className="flex flex-col items-center gap-1.5">
                <span
                  className="relative flex h-[92px] w-[86px] shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: card.background, boxShadow: "var(--shadow-card)" }}
                >
                  <motion.span
                    className="w-[26px] h-[26px] block"
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
    </div>
  );
}
