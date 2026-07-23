"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CarouselSlide } from "@/lib/carousel";

const phaseLabel: Record<CarouselSlide["phase"], string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export default function CarouselList({ slides }: { slides: CarouselSlide[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const move = async (id: string, direction: "up" | "down") => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/carousel/${id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`確定要刪除「${title}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>
            活動管理
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--ink-soft)" }}>
            管理前台活動頁內容；勾選後才會顯示在首頁輪播
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          + 新增活動
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--line)" }}>
              {s.photo ? <Image src={s.photo.src} alt={s.title} fill sizes="56px" className="object-cover" /> : null}
            </div>
            <Link href={`/admin/events/${s.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "var(--ink)" }}>
                {s.title}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                {s.date} ・ {phaseLabel[s.phase]}
                {s.showInCarousel === false ? " ・ 不在首頁輪播" : " ・ 首頁輪播"}
                {!s.photo ? " ・ 無照片" : ""}
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => move(s.id, "up")}
                disabled={busyId === s.id || i === 0}
                aria-label="上移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
              >
                ↑
              </button>
              <button
                onClick={() => move(s.id, "down")}
                disabled={busyId === s.id || i === slides.length - 1}
                aria-label="下移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
              >
                ↓
              </button>
              <button
                onClick={() => remove(s.id, s.title)}
                disabled={busyId === s.id}
                aria-label="刪除"
                className="text-[11.5px] font-medium underline ml-1.5 disabled:opacity-50"
                style={{ color: "var(--status-warn)" }}
              >
                刪除
              </button>
            </div>
          </div>
        ))}
        {slides.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "var(--ink-soft)" }}>
            尚未新增任何活動
          </p>
        ) : null}
      </div>
    </div>
  );
}
