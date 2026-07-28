"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { writeIdentity } from "@/lib/identity";
import { HeaderShapes } from "./PageHeader";

// Keeps the real Daxi-bridge photo (vs. the tourist home's solid mood-color
// gradient) as the at-a-glance signal this is the resident side — but adds
// the same playful motion language (HeaderShapes overlay, a bit of motion)
// so it doesn't read as flatter/less-alive than the tourist hero.
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
      className="relative safe-page-x pt-6 pb-5 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        boxShadow: "var(--shadow-float)",
      }}
    >
      <Image src="/images/daxi-bridge.jpg" alt="" fill priority sizes="100vw" className="object-cover" style={{ zIndex: 0 }} />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(74,117,148,0.55) 0%, rgba(35,45,56,0.85) 100%)",
          zIndex: 1,
        }}
        aria-hidden
      />
      <div className="absolute inset-0" style={{ zIndex: 1, opacity: 0.55 }} aria-hidden>
        <HeaderShapes />
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Row 1 mirrors the tourist hero's eyebrow+headline / icon row so the
            two heroes end up the same overall height. */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase" style={{ color: "rgba(255,255,255,0.75)" }}>
              大溪今日 · {todayLabel}
            </div>
            <div className="font-serif text-[19px] font-bold leading-tight flex items-center gap-1.5" style={{ color: "#fff" }}>
              大溪居民您好
              <motion.span
                aria-hidden="true"
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
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0"
            style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8.3" r="3.3" />
              <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
            </svg>
          </Link>
        </div>
        {/* Identity switcher — mirrors the tourist home's pill toggle so
            switching back is just as discoverable, not buried in a profile
            page. */}
        <div className="pt-4">
          <div className="inline-flex p-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <span
              className="px-4 py-1.5 rounded-full text-[12.5px] font-medium"
              style={{ background: "#ffffff", color: "var(--river-teal)" }}
            >
              我是大溪人
            </span>
            <button
              type="button"
              onClick={goTourist}
              disabled={switching}
              className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
              style={{ background: "transparent", color: "rgba(255,255,255,0.85)", opacity: switching ? 0.6 : 1 }}
            >
              {switching ? "切換中…" : "我是遊客"}
            </button>
          </div>
        </div>

        {/* Row 3 — a white pill matching the tourist hero's search-bar row so
            the third row lines up in height too, just carrying a static blurb
            instead of a search input. */}
        <div className="pt-3">
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "#ffffff" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--river-teal)" }}>
              <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
              <path d="M4.8 20.2h14.4" />
              <path d="M9.2 8h5.6" />
              <path d="M9.2 11.2h5.6" />
              <path d="M9.2 14.4h3.4" />
            </svg>
            <span className="text-[12.5px]" style={{ color: "var(--ink)" }}>
              里民服務、區公所公告、停水停電通知，一站看完
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
