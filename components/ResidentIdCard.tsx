"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { readResidentName, writeResidentName } from "@/lib/residentCard";

function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="rounded-2xl border px-4 py-5 text-center" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-app-body font-semibold mb-1" style={{ color: "var(--ink)" }}>
        建立我的在地優惠卡
      </div>
      <div className="text-app-label mb-3" style={{ color: "var(--ink-soft)" }}>
        名稱只存在這台裝置，用來辨識優惠；不是身分或居住地驗證。
      </div>
      <div className="flex gap-2">
        <input
          aria-label="怎麼稱呼你"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="怎麼稱呼你？"
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-app-body outline-none"
          style={{ background: "var(--paper-2)", border: "1px solid var(--line)", color: "var(--ink)" }}
        />
        <button
          type="button"
          disabled={!value.trim()}
          onClick={() => {
            if (!value.trim()) return;
            writeResidentName(value);
            onSubmit(value.trim());
          }}
          className="shrink-0 rounded-full px-4 py-2.5 text-app-body font-semibold transition-opacity active:opacity-70 disabled:opacity-40"
          style={{ background: "var(--river-teal)", color: "#fff" }}
        >
          建立
        </button>
      </div>
    </div>
  );
}

export default function ResidentIdCard() {
  const [name, setName] = useState<string | null>(() => readResidentName());
  const [flipped, setFlipped] = useState(false);

  if (!name) return <NamePrompt onSubmit={setName} />;

  return (
    <div>
      <div className="mx-auto" style={{ perspective: 1200 }}>
        <motion.button
          type="button"
          aria-pressed={flipped}
          aria-label={flipped ? "顯示優惠卡正面" : "顯示優惠使用方式"}
          className="relative mx-auto block h-[200px] w-full max-w-[340px] cursor-pointer border-0 p-0 text-left"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          onClick={() => setFlipped((v) => !v)}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[20px] p-5"
            style={{
              backfaceVisibility: "hidden",
              background: "var(--block-river)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-app-label font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(43,36,32,0.6)" }}>
                  DAXI RESIDENT
                </div>
                <div className="font-serif text-app-title font-bold mt-1" style={{ color: "var(--block-fg)" }}>
                  大溪在地優惠卡
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-app-label font-bold"
                style={{ background: "rgba(255,255,255,0.35)", color: "var(--block-wood-deep)" }}
              >
                本機建立
              </span>
            </div>
            <div>
              <div className="text-app-heading font-bold" style={{ color: "var(--block-fg)" }}>
                {name}
              </div>
              <div className="text-app-label mt-1" style={{ color: "rgba(43,36,32,0.65)" }}>
                點卡片查看使用方式 →
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] p-5 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "var(--ink)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-[22px]" style={{ background: "rgba(255,255,255,0.14)" }} aria-hidden>
              🎟️
            </div>
            <div className="text-app-heading font-bold" style={{ color: "#fff" }}>
              到優惠頁開啟核銷碼
            </div>
            <div className="max-w-[240px] text-app-label leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
              選擇店家優惠後，才會產生一次性的現場核銷碼。
            </div>
          </div>
        </motion.button>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <Link href="/coupons" className="text-app-label font-semibold underline" style={{ color: "var(--river-teal)" }}>
          查看目前可用優惠 →
        </Link>
      </div>
    </div>
  );
}
