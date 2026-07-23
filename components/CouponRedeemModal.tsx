"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Coupon } from "@/lib/coupons";

// Deterministic pixel grid from the current rotating token — reads as a QR
// code without a scanning library; the value itself rotates server-side
// every 90s (see lib/coupons.ts) so a screenshot goes stale fast.
function TokenGrid({ token }: { token: string }) {
  const size = 11;
  let seed = 0;
  for (let i = 0; i < token.length; i++) seed = (seed * 31 + token.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    cells.push(((seed >> 16) & 1) === 1);
  }
  // Force the three QR-style corner finder squares on so it still reads
  // visually as "a QR code" at a glance.
  const finder = (r: number, c: number) => r < 3 && c < 3;
  return (
    <div
      className="grid gap-[2px] p-3 rounded-xl"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, background: "#fff", width: 176, height: 176 }}
    >
      {Array.from({ length: size }).map((_, r) =>
        Array.from({ length: size }).map((_, c) => {
          const isFinder = finder(r, c) || finder(r, size - 1 - c) || finder(size - 1 - r, c);
          const on = isFinder ? (r === 1 || c === 1 || r === 0 || c === 0 || r === 2 || c === 2) && !(r === 1 && c === 1) : cells[r * size + c];
          return <span key={`${r}-${c}`} style={{ background: on ? "#111" : "transparent" }} />;
        })
      )}
    </div>
  );
}

export default function CouponRedeemModal({ coupon, businessName, onClose }: { coupon: Coupon; businessName: string; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");

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
      setStatus("idle");
    } catch {
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
      <div
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
          {token ? (
            <TokenGrid token={token} />
          ) : (
            <div className="w-[176px] h-[176px] rounded-xl skeleton" style={{ background: "var(--line)" }} />
          )}
        </div>

        <div className="text-[12px] font-medium mb-1" style={{ color: status === "error" ? "var(--daxi-red)" : "var(--ink)" }}>
          {status === "error" ? "核銷碼取得失敗，請重新整理" : `請於 ${remaining} 秒內請店員掃描`}
        </div>
        <div className="text-[10.5px] leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
          此碼每 90 秒自動更新，僅限現場出示，請勿截圖轉發。
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full py-2.5 text-[13px] font-medium transition-opacity active:opacity-70"
          style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
        >
          關閉
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
