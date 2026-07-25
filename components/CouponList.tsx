"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Coupon } from "@/lib/coupons";
import CouponRedeemModal from "./CouponRedeemModal";
import AboutModal from "./AboutModal";
import { trackClick } from "@/lib/trackClient";

export type CouponWithBusiness = Coupon & { businessName: string; distanceLabel?: string };

function AboutRow() {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setShowAbout(true)}
        className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-opacity active:opacity-70"
        style={{ background: "var(--card)", border: "1px solid var(--line)" }}
      >
        <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
          關於
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-soft)" }}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
      {showAbout ? <AboutModal onClose={() => setShowAbout(false)} /> : null}
    </>
  );
}

export default function CouponList({ coupons }: { coupons: CouponWithBusiness[] }) {
  const [open, setOpen] = useState<CouponWithBusiness | null>(null);

  if (coupons.length === 0) {
    return (
      <div className="safe-page-x flex flex-col gap-2.5">
        <div className="py-6 text-center text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
          暫時無資料
        </div>
        <AboutRow />
      </div>
    );
  }

  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {coupons.map((c) => (
        <motion.button
          key={c.id}
          type="button"
          onClick={() => {
            trackClick("coupon", c.id, c.title);
            setOpen(c);
          }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
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
        </motion.button>
      ))}

      <AboutRow />

      {open ? <CouponRedeemModal coupon={open} businessName={open.businessName} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
