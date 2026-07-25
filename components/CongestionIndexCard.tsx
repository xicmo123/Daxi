"use client";

import { motion } from "framer-motion";

export type CongestionBand = "chill" | "normal" | "busy" | "packed";

const BAND_COPY: Record<CongestionBand, { emoji: string; label: string; tip: string; color: string }> = {
  chill: { emoji: "😌", label: "老街今天很閒", tip: "現在出門，車位跟位子都不用搶", color: "var(--status-ok)" },
  normal: { emoji: "🙂", label: "普通日常擁擠度", tip: "正常時段，照原計畫出門就好", color: "var(--river-teal)" },
  busy: { emoji: "😅", label: "有點塞囉", tip: "建議避開和平路、中山路一帶，改走外圍道路", color: "var(--cognac-deep)" },
  packed: { emoji: "🥵", label: "非常擁擠，建議晚點出門", tip: "老街周邊車位吃緊，早鳥或晚鳥時段會輕鬆很多", color: "var(--daxi-red)" },
};

function bandFromScore(score: number): CongestionBand {
  if (score < 35) return "chill";
  if (score < 65) return "normal";
  if (score < 85) return "busy";
  return "packed";
}

export default function CongestionIndexCard({ score }: { score: number }) {
  const band = bandFromScore(score);
  const copy = BAND_COPY[band];

  return (
    <div className="safe-page-x fade-in">
      <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--ink-soft)" }}>
            週末出門指數
          </div>
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-[20px]"
            aria-hidden="true"
          >
            {copy.emoji}
          </motion.span>
        </div>
        <div className="text-[15px] font-bold mb-2" style={{ color: "var(--ink)" }}>
          {copy.label}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full mb-2" style={{ background: "var(--paper-2)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: copy.color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        <div className="text-[11.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {copy.tip}
        </div>
      </div>
    </div>
  );
}
