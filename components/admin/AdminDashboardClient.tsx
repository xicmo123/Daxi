"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";
import AdminList from "./AdminList";

type DashboardRow = {
  place: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  isCustom: boolean;
};

type DashboardData = {
  rows: DashboardRow[];
  pendingBookings: number;
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json) throw new Error(json?.error ?? "後台資料載入失敗");
        if (!cancelled) setData(json as DashboardData);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "後台資料載入失敗");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl px-4 py-5 text-[13px]" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl px-4 py-5 text-[13px]" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
        後台資料載入中…
      </div>
    );
  }

  return <AdminList rows={data.rows} pendingBookings={data.pendingBookings} />;
}
