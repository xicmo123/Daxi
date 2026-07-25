"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { readResidentName, writeResidentName, residentToken } from "@/lib/residentCard";

function QrGrid({ token }: { token: string }) {
  const size = 9;
  let seed = 0;
  for (let i = 0; i < token.length; i++) seed = (seed * 31 + token.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    cells.push(((seed >> 16) & 1) === 1);
  }
  const finder = (r: number, c: number) => r < 3 && c < 3;
  return (
    <div
      className="grid gap-[2px] p-2.5 rounded-lg"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, background: "#fff", width: 140, height: 140 }}
    >
      {Array.from({ length: size }).map((_, r) =>
        Array.from({ length: size }).map((_, c) => {
          const isFinder = finder(r, c) || finder(r, size - 1 - c) || finder(size - 1 - r, c);
          const on = isFinder
            ? (r === 1 || c === 1 || r === 0 || c === 0 || r === 2 || c === 2) && !(r === 1 && c === 1)
            : cells[r * size + c];
          return <span key={`${r}-${c}`} style={{ background: on ? "#111" : "transparent" }} />;
        })
      )}
    </div>
  );
}

function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="rounded-2xl border px-4 py-5 text-center" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-[13.5px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
        建立你的數位鄉親證
      </div>
      <div className="text-[11.5px] mb-3" style={{ color: "var(--ink-soft)" }}>
        僅存在你的裝置上，用於到店出示享在地優惠
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="怎麼稱呼你？"
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-[13px] outline-none"
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
          className="shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70 disabled:opacity-40"
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

  const token = residentToken(name);

  return (
    <div>
      <div className="mx-auto" style={{ perspective: 1200 }}>
        <motion.div
          className="relative mx-auto h-[200px] w-full max-w-[340px] cursor-pointer"
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
              background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(43,36,32,0.6)" }}>
                  DAXI RESIDENT
                </div>
                <div className="font-serif text-[20px] font-bold mt-1" style={{ color: "var(--block-fg)" }}>
                  大溪鄉親證
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: "rgba(255,255,255,0.35)", color: "var(--block-wood-deep)" }}
              >
                已認證
              </span>
            </div>
            <div>
              <div className="text-[16px] font-bold" style={{ color: "var(--block-fg)" }}>
                {name}
              </div>
              <div className="text-[10.5px] mt-1" style={{ color: "rgba(43,36,32,0.65)" }}>
                點卡片查看核銷條碼 →
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] p-5"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "var(--ink)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <QrGrid token={token} />
            <div className="text-[10.5px] tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>
              到店出示享在地優惠
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <Link href="/coupons" className="text-[12.5px] font-semibold underline" style={{ color: "var(--river-teal)" }}>
          查看在地商戶優惠 →
        </Link>
      </div>
    </div>
  );
}
