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
        <div className="flex items-center justify-end">
          <Link
            href="/resident/profile"
            aria-label="我的"
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
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

        <div className="text-[13px] mt-3" style={{ color: "rgba(255,255,255,0.8)" }}>
          {todayLabel}
        </div>
        <div className="font-serif text-[24px] font-bold leading-tight flex items-center gap-1.5" style={{ color: "#fff" }}>
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
        <p className="text-[12.5px] mt-2" style={{ color: "rgba(255,255,255,0.88)" }}>
          里民服務、區公所公告、停水停電通知，一站看完
        </p>
      </div>
    </motion.div>
  );
}
