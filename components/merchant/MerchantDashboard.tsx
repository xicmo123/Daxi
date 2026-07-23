"use client";

import { useState } from "react";
import type { Coupon } from "@/lib/coupons";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#5c5145" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = { border: "1px solid #dfd1bf", background: "#fff" } as const;

export default function MerchantDashboard({
  businessName,
  hours: initialHours,
  coupon: initialCoupon,
}: {
  businessName: string;
  hours: string;
  coupon: Coupon | null;
}) {
  const [hours, setHours] = useState(initialHours);
  const [hoursStatus, setHoursStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [title, setTitle] = useState(initialCoupon?.title ?? "");
  const [desc, setDesc] = useState(initialCoupon?.desc ?? "");
  const [validUntil, setValidUntil] = useState(initialCoupon?.validUntil ?? "");
  const [active, setActive] = useState(initialCoupon?.active ?? true);
  const [couponId, setCouponId] = useState(initialCoupon?.id ?? "");
  const [couponStatus, setCouponStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [couponError, setCouponError] = useState<string | null>(null);

  const saveHours = async () => {
    setHoursStatus("saving");
    try {
      const res = await fetch("/api/merchant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      setHoursStatus(res.ok ? "saved" : "error");
    } catch {
      setHoursStatus("error");
    }
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus("saving");
    setCouponError(null);
    try {
      const res = await fetch("/api/merchant/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId, title, desc, validUntil, active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCouponStatus("error");
        setCouponError(data.error ?? "儲存失敗");
        return;
      }
      setCouponId(data.coupon.id);
      setCouponStatus("saved");
    } catch {
      setCouponStatus("error");
    }
  };

  return (
    <div>
      <div className="text-[13px] mb-6" style={{ color: "#766a5d" }}>
        {businessName}
      </div>

      <section className="rounded-2xl p-5 mb-6" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
        <h2 className="font-serif text-[15px] font-bold mb-4">營業時間</h2>
        <Field label="營業時間說明">
          <textarea
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="例：週一至週五 10:00-19:00，週末 09:00-20:00"
            className="w-full rounded-lg px-3 py-2.5 text-[13px]"
            style={inputStyle}
          />
        </Field>
        <button
          onClick={saveHours}
          disabled={hoursStatus === "saving"}
          className="rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "#9c3b3b", color: "#fff", opacity: hoursStatus === "saving" ? 0.6 : 1 }}
        >
          {hoursStatus === "saving" ? "儲存中…" : "儲存營業時間"}
        </button>
        {hoursStatus === "saved" ? <span className="ml-3 text-[12px]" style={{ color: "#3a7d44" }}>已儲存</span> : null}
        {hoursStatus === "error" ? <span className="ml-3 text-[12px]" style={{ color: "#9c3b3b" }}>儲存失敗，請重試</span> : null}
      </section>

      <section className="rounded-2xl p-5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
        <h2 className="font-serif text-[15px] font-bold mb-4">優惠內容</h2>
        <form onSubmit={saveCoupon}>
          <Field label="優惠標題">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              required
              className="w-full rounded-lg px-3 py-2.5 text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="優惠內容">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              maxLength={200}
              required
              className="w-full rounded-lg px-3 py-2.5 text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="到期日">
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-[13px]"
              style={inputStyle}
            />
          </Field>
          <label className="flex items-center gap-2 mb-4 text-[13px]" style={{ color: "#5c5145" }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            上架中（顯示在 App 優惠券頁）
          </label>

          {couponError ? (
            <div className="text-[12.5px] mb-3" style={{ color: "#9c3b3b" }}>
              {couponError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={couponStatus === "saving"}
            className="rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
            style={{ background: "#9c3b3b", color: "#fff", opacity: couponStatus === "saving" ? 0.6 : 1 }}
          >
            {couponStatus === "saving" ? "儲存中…" : "儲存優惠券"}
          </button>
          {couponStatus === "saved" ? <span className="ml-3 text-[12px]" style={{ color: "#3a7d44" }}>已儲存</span> : null}
        </form>
        <p className="text-[11px] leading-relaxed mt-4" style={{ color: "#a89a89" }}>
          優惠券以「到店掃碼核銷」呈現給遊客，核銷碼由系統自動產生並每 90 秒更新，商家不需要另外設定折扣碼。
        </p>
      </section>
    </div>
  );
}
