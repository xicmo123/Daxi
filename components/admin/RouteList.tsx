"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WalkingRoute } from "@/lib/routesData";

export default function RouteList({ routes }: { routes: WalkingRoute[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/routes/${id}`, { method: "DELETE" });
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
            主題路線
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理景點地圖上的「無障礙路線」；勾選無障礙才會出現在該篩選中
          </p>
        </div>
        <Link
          href="/admin/routes/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#a06a3a", color: "#fff" }}
        >
          + 新增路線
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {routes.map((route) => (
          <div key={route.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            {route.isWheelchairFriendly ? (
              <span className="shrink-0 text-[10.5px] font-bold rounded-full px-2 py-1" style={{ background: "#4a7594", color: "#fff" }}>
                ♿
              </span>
            ) : null}
            <Link href={`/admin/routes/${route.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {route.name}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {(route.totalDistanceMeters / 1000).toFixed(1)} 公里 ・ {route.estimatedMinutes} 分鐘 ・ {route.stops.length} 站
              </div>
            </Link>
            <button
              onClick={() => remove(route.id, route.name)}
              disabled={busyId === route.id}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {routes.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何路線
          </p>
        ) : null}
      </div>
    </div>
  );
}
