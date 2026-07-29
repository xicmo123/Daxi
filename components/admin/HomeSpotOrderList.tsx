"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";

type HomeSpotRow = {
  place: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
};

export default function HomeSpotOrderList({ rows }: { rows: HomeSpotRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const move = async (placeId: string, direction: "up" | "down") => {
    setBusyId(placeId);
    try {
      await fetch(`/api/admin/home-spots/${encodeURIComponent(placeId)}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>
            首頁熱門景點
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: "var(--ink-soft)" }}>
            調整遊客首頁下方「熱門景點」的顯示前後順序，前 8 筆會出現在首頁
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="shrink-0 rounded-lg px-4 py-2 text-[13px] font-medium transition-opacity active:opacity-80"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          查看首頁
        </Link>
      </div>

      <div className="mb-3 text-[12px]" style={{ color: "var(--ink-soft)" }}>
        共 {rows.length} 筆景點
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ place, photo, detail }, index) => (
          <div
            key={place.placeId}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="w-8 shrink-0 text-center text-[12px] font-bold tabular-nums" style={{ color: index < 8 ? "var(--daxi-red)" : "var(--ink-soft)" }}>
              {index + 1}
            </div>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--line)" }}>
              {photo ? <Image src={photo.src} alt={place.name} fill sizes="48px" className="object-cover" /> : null}
            </div>
            <Link href={`/admin/${place.placeId}`} className="min-w-0 flex-1 transition-opacity active:opacity-70">
              <div className="truncate text-[13.5px] font-medium" style={{ color: "var(--ink)" }}>
                {place.name}
              </div>
              <div className="truncate text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                {detail?.category ? detail.category : "景點"}
                {detail?.featured ? " ・ 精選" : ""}
                {index < 8 ? " ・ 首頁顯示" : ""}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(place.placeId, "up")}
                disabled={busyId === place.placeId || index === 0}
                aria-label="上移"
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(place.placeId, "down")}
                disabled={busyId === place.placeId || index === rows.length - 1}
                aria-label="下移"
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-[13px]" style={{ color: "var(--ink-soft)" }}>
            目前沒有可顯示的景點
          </p>
        ) : null}
      </div>
    </div>
  );
}
