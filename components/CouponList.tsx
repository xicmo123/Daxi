"use client";

import { useState } from "react";
import type { Coupon } from "@/lib/coupons";
import CouponRedeemModal from "./CouponRedeemModal";
import { trackClick } from "@/lib/trackClient";

export type CouponWithBusiness = Coupon & { businessName: string; distanceLabel?: string };

export default function CouponList({ coupons }: { coupons: CouponWithBusiness[] }) {
  const [open, setOpen] = useState<CouponWithBusiness | null>(null);

  if (coupons.length === 0) {
    return (
      <div className="safe-page-x py-6 text-center text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
        目前沒有進行中的優惠
      </div>
    );
  }

  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {coupons.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => {
            trackClick("coupon", c.id, c.title);
            setOpen(c);
          }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 card-shadow text-left transition-opacity active:opacity-70"
          style={{ background: "var(--card)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
              {c.title}
            </div>
            <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
              {c.businessName}
              {c.distanceLabel ? ` · ${c.distanceLabel}` : ""}
            </div>
          </div>
          <span
            className="shrink-0 text-[10px] font-medium rounded-full px-2.5 py-1"
            style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
          >
            到店掃碼核銷
          </span>
        </button>
      ))}

      {open ? <CouponRedeemModal coupon={open} businessName={open.businessName} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
