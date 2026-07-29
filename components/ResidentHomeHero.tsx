"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { writeIdentity } from "@/lib/identity";

export default function ResidentHomeHero({ todayLabel }: { todayLabel: string }) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const goTourist = () => {
    setSwitching(true);
    writeIdentity("tourist");
    router.push("/");
  };

  return (
    <motion.div
      className="safe-page-x pt-5 pb-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--ink-soft)" }}>
            大溪今日 · {todayLabel}
          </div>
          <div className="font-serif text-[22px] font-black leading-tight flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
            大溪居民您好
            <motion.span
              aria-hidden="true"
              className="text-[18px]"
              style={{ display: "inline-block", transformOrigin: "70% 70%" }}
              animate={{ rotate: [0, 16, -8, 16, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            >
              👋
            </motion.span>
          </div>
        </div>
        <Link
          href="/resident/profile"
          aria-label="我的"
          className="relative w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0"
          style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8.3" r="3.3" />
            <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
          </svg>
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-full" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
          <span
            className="px-3.5 py-1 rounded-full text-[12px] font-bold"
            style={{ background: "var(--card)", color: "var(--river-teal)", boxShadow: "0 1px 5px rgba(43,36,32,0.08)" }}
          >
            我是大溪人
          </span>
          <button
            type="button"
            onClick={goTourist}
            disabled={switching}
            className="px-3.5 py-1 rounded-full text-[12px] font-bold transition-all"
            style={{ background: "transparent", color: "var(--ink-soft)", opacity: switching ? 0.6 : 1 }}
          >
            {switching ? "切換中…" : "遊客"}
          </button>
        </div>
        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>
          公告、交通、清運，一眼掌握
        </span>
      </div>
    </motion.div>
  );
}
