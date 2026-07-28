"use client";

import { useEffect, useState } from "react";

export default function MerchantRedeemResult({ couponId, token }: { couponId: string; token: string }) {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("正在核銷優惠券…");

  useEffect(() => {
    let cancelled = false;

    async function redeem() {
      try {
        const res = await fetch("/api/coupons/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId, token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setState("error");
          setMessage(data.error ?? "核銷失敗，請確認 QR Code 是否仍有效");
          return;
        }
        setState("success");
        setMessage("核銷成功，可以提供優惠。");
      } catch {
        if (cancelled) return;
        setState("error");
        setMessage("核銷失敗，請檢查網路後再試一次");
      }
    }

    redeem();
    return () => {
      cancelled = true;
    };
  }, [couponId, token]);

  const success = state === "success";

  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ background: success ? "#dcebd7" : state === "error" ? "#f3d6d6" : "#efe4d2" }}
        aria-hidden="true"
      >
        {success ? "✓" : state === "error" ? "!" : "…"}
      </div>
      <h1 className="font-serif text-xl font-bold mb-2">優惠券核銷</h1>
      <p className="text-[13px] leading-relaxed" style={{ color: "#766a5d" }}>
        {message}
      </p>
      <a
        href="/merchant"
        className="mt-5 inline-flex rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
        style={{ background: "#9c3b3b", color: "#fff" }}
      >
        回商家後台
      </a>
    </div>
  );
}
