"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Amenity } from "@/lib/amenities";

export default function AmenityList({ amenities }: { amenities: Amenity[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/amenities/${id}`, { method: "DELETE" });
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
            友善設施（公廁／飲水機）
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理景點地圖上的「找廁所」「飲水機」篩選標記
          </p>
        </div>
        <Link
          href="/admin/amenities/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#a06a3a", color: "#fff" }}
        >
          + 新增設施
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <span className="shrink-0 text-[16px]" aria-hidden="true">
              {amenity.category === "公廁" ? "🚻" : "🚰"}
            </span>
            <Link href={`/admin/amenities/${amenity.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {amenity.name}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {amenity.category} ・ {amenity.lat.toFixed(5)}, {amenity.lng.toFixed(5)}
                {amenity.note ? ` ・ ${amenity.note}` : ""}
              </div>
            </Link>
            <button
              onClick={() => remove(amenity.id, amenity.name)}
              disabled={busyId === amenity.id}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {amenities.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何友善設施
          </p>
        ) : null}
      </div>
    </div>
  );
}
