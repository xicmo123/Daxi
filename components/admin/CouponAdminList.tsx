"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "@/lib/coupons";

type CouponRow = Coupon & { businessName: string };

export default function CouponAdminList() {
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? "載入失敗");
      setCoupons(data.coupons);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗");
    }
  };

  // Self-contained initial fetch (distinct from `load` below, which is
  // reused by the toggle/delete handlers) so the effect body doesn't call
  // an outer-scope function the linter can't verify is effect-safe.
  useEffect(() => {
    let cancelled = false;
    async function fetchInitial() {
      try {
        const res = await fetch("/api/admin/coupons", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) throw new Error(data?.error ?? "載入失敗");
        if (!cancelled) setCoupons(data.coupons);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "載入失敗");
      }
    }
    fetchInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleActive = async (coupon: CouponRow) => {
    setBusyId(coupon.id);
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (coupon: CouponRow) => {
    if (!confirm(`確定要刪除「${coupon.businessName} — ${coupon.title}」嗎？此動作無法復原。`)) return;
    setBusyId(coupon.id);
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl px-4 py-5 text-[13px]" style={{ background: "#fffaf1", border: "1px solid #dfd1bf", color: "#b0503f" }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          優惠券管理
        </h1>
        <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
          所有商家自行發布的優惠券在此統一檢視，可下架或刪除不合適的內容
        </p>
      </div>

      {!coupons ? (
        <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
          載入中…
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((c) => {
            const expired = c.validUntil < new Date().toISOString().slice(0, 10);
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                    {c.businessName} — {c.title}
                  </div>
                  <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                    {c.desc}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: expired ? "#b0503f" : "#a89a89" }}>
                    到期日 {c.validUntil}
                    {expired ? "（已過期）" : ""}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(c)}
                  disabled={busyId === c.id}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold disabled:opacity-50"
                  style={c.active ? { background: "#4a7594", color: "#fff" } : { background: "#f4eee4", color: "#2f261f", border: "1px solid #dfd1bf" }}
                >
                  {c.active ? "上架中" : "已下架"}
                </button>
                <button
                  onClick={() => remove(c)}
                  disabled={busyId === c.id}
                  aria-label="刪除"
                  className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
                  style={{ color: "#b0503f" }}
                >
                  刪除
                </button>
              </div>
            );
          })}
          {coupons.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
              目前沒有任何商家發布優惠券
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
