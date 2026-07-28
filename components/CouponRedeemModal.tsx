"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import type { Coupon } from "@/lib/coupons";
import { fireConfetti } from "@/lib/confetti";

export default function CouponRedeemModal({ coupon, businessName, onClose }: { coupon: Coupon; businessName: string; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const celebratedRef = useRef(false);

  async function fetchToken() {
    setStatus("loading");
    try {
      const res = await fetch("/api/coupons/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setToken(data.token);
      setExpiresAt(data.expiresAt);
      const redeemUrl = new URL("/merchant/redeem", window.location.origin);
      redeemUrl.searchParams.set("couponId", coupon.id);
      redeemUrl.searchParams.set("token", data.token);
      const dataUrl = await QRCode.toDataURL(redeemUrl.toString(), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 176,
        color: {
          dark: "#111111",
          light: "#ffffff",
        },
      });
      setQrSrc(dataUrl);
      setStatus("idle");
      // Celebrate the moment the redemption code is ready, not on the
      // silent 90s auto-refresh that follows.
      if (!celebratedRef.current) {
        celebratedRef.current = true;
        fireConfetti();
      }
    } catch {
      setQrSrc(null);
      setStatus("error");
    }
  }

  useEffect(() => {
    // Legitimate fetch-on-mount: the redemption token can only be minted
    // server-side (it's HMAC-signed there), so there's no synchronous way
    // to derive it during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon.id]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (expiresAt && remaining === 0) fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={coupon.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 fade-in sm:p-5"
      style={{ background: "rgba(15,17,22,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
        className="w-full max-w-sm rounded-[22px] card-shadow p-5 text-center"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: "var(--daxi-red)" }}>
          到店掃碼核銷
        </div>
        <div className="font-serif text-lg font-bold mb-0.5" style={{ color: "var(--ink)" }}>
          {coupon.title}
        </div>
        <div className="text-[12px] mb-4" style={{ color: "var(--ink-soft)" }}>
          {businessName}
        </div>

        <div className="flex items-center justify-center mb-3">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrSrc}
              alt="優惠券核銷 QR Code"
              width={176}
              height={176}
              className="rounded-xl"
              style={{ background: "#fff" }}
            />
          ) : (
            <div className="w-[176px] h-[176px] rounded-xl skeleton" style={{ background: "var(--line)" }} />
          )}
        </div>

        <div className="text-[12px] font-medium mb-1" style={{ color: status === "error" ? "var(--daxi-red)" : "var(--ink)" }}>
          {status === "error" ? "核銷碼取得失敗，請重新整理" : `請於 ${remaining} 秒內請店員掃描`}
        </div>
        {token ? (
          <div className="font-mono text-[11px] tracking-[0.08em] mb-2" style={{ color: "var(--ink-soft)" }}>
            {token}
          </div>
        ) : null}
        <div className="text-[10.5px] leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
          此 QR Code 每 90 秒自動更新，僅限現場出示，請勿截圖轉發。
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full py-2.5 text-[13px] font-medium transition-opacity active:opacity-70"
          style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
        >
          關閉
        </button>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}
