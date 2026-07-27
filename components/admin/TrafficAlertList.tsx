"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TrafficAlert } from "@/lib/trafficAlerts";

const LEVEL_LABEL: Record<TrafficAlert["level"], string> = { block: "封閉", warn: "警示", info: "一般" };
const LEVEL_COLOR: Record<TrafficAlert["level"], string> = { block: "#b0503f", warn: "#a06a3a", info: "#4a7594" };

export default function TrafficAlertList({ alerts }: { alerts: TrafficAlert[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string, title: string) => {
    if (!confirm(`確定要刪除「${title}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/traffic-alerts/${id}`, { method: "DELETE" });
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
            交通管制公告
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理 /weather 頁面的交通管制公告列表
          </p>
        </div>
        <Link
          href="/admin/traffic-alerts/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#a06a3a", color: "#fff" }}
        >
          + 新增公告
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <span className="shrink-0 text-[10.5px] font-semibold rounded-full px-2 py-1" style={{ background: "#f4eee4", color: LEVEL_COLOR[alert.level] }}>
              {LEVEL_LABEL[alert.level]}
            </span>
            <Link href={`/admin/traffic-alerts/${alert.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {alert.title}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {alert.desc}
              </div>
            </Link>
            <button
              onClick={() => remove(alert.id, alert.title)}
              disabled={busyId === alert.id}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {alerts.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何交通管制公告
          </p>
        ) : null}
      </div>
    </div>
  );
}
