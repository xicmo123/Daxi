"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UsefulLink } from "@/lib/usefulLinks";

export default function UsefulLinkList({ links }: { links: UsefulLink[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const move = async (id: string, direction: "up" | "down") => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/useful-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`確定要刪除「${label}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/useful-links/${id}`, { method: "DELETE" });
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
            常用連結
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理大溪人首頁與里民服務頁共用的「常用連結」清單
          </p>
        </div>
        <Link
          href="/admin/useful-links/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#4a7594", color: "#fff" }}
        >
          + 新增連結
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <div key={link.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <Link href={`/admin/useful-links/${link.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {link.label}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {link.note} ・ {link.href}
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => move(link.id, "up")}
                disabled={busyId === link.id || i === 0}
                aria-label="上移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "#f4eee4", color: "#2f261f" }}
              >
                ↑
              </button>
              <button
                onClick={() => move(link.id, "down")}
                disabled={busyId === link.id || i === links.length - 1}
                aria-label="下移"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-30"
                style={{ background: "#f4eee4", color: "#2f261f" }}
              >
                ↓
              </button>
              <button
                onClick={() => remove(link.id, link.label)}
                disabled={busyId === link.id}
                aria-label="刪除"
                className="text-[11.5px] font-medium underline ml-1.5 disabled:opacity-50"
                style={{ color: "#b0503f" }}
              >
                刪除
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何連結
          </p>
        ) : null}
      </div>
    </div>
  );
}
