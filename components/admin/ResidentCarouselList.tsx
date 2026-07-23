"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ResidentCarouselSlide } from "@/lib/residentCarousel";

const tagColor: Record<ResidentCarouselSlide["tag"], string> = {
  一般: "#766a5d",
  緊急: "#b0503f",
  活動: "#4a7594",
};

export default function ResidentCarouselList({ slides }: { slides: ResidentCarouselSlide[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const move = async (id: string, direction: "up" | "down") => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/resident-carousel/${id}/move`, {
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
      await fetch(`/api/admin/resident-carousel/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
            大溪人首頁輪播
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理大溪人首頁上方的長條輪播公告；勾選「上架」才會顯示
          </p>
        </div>
        <Link
          href="/admin/resident-carousel/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#4a7594", color: "#fff" }}
        >
          + 新增輪播項目
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {slides.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <span
              className="shrink-0 text-[10.5px] font-semibold rounded-full px-2 py-1"
              style={{ background: "#f4eee4", color: tagColor[s.tag] }}
            >
              {s.tag}
            </span>
            <Link href={`/admin/resident-carousel/${s.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {s.title}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {s.active ? "上架中" : "未上架"}
                {s.href ? ` ・ ${s.href}` : ""}
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => move(s.id, "up")}
                disabled={busyId === s.id || i === 0}
                aria-label="上移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "#f4eee4", color: "#2f261f" }}
              >
                ↑
              </button>
              <button
                onClick={() => move(s.id, "down")}
                disabled={busyId === s.id || i === slides.length - 1}
                aria-label="下移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "#f4eee4", color: "#2f261f" }}
              >
                ↓
              </button>
              <button
                onClick={() => remove(s.id, s.title)}
                disabled={busyId === s.id}
                aria-label="刪除"
                className="text-[11.5px] font-medium underline ml-1.5 disabled:opacity-50"
                style={{ color: "#b0503f" }}
              >
                刪除
              </button>
            </div>
          </div>
        ))}
        {slides.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何輪播項目
          </p>
        ) : null}
      </div>
    </div>
  );
}
