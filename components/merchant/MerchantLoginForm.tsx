"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [placeId, setPlaceId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: placeId.trim(), passcode: passcode.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "登入失敗");
        return;
      }
      router.push(searchParams.get("next") || "/merchant");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--paper, #f4eee4)" }}>
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl card-shadow p-8" style={{ background: "#fffaf1" }}>
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: "#9c3b3b" }}>
          商家專區
        </div>
        <h1 className="font-serif text-xl font-bold mb-6" style={{ color: "#2f261f" }}>
          店家自助登入
        </h1>

        <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#5c5145" }}>
          商家代碼(Place ID)
        </label>
        <input
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          placeholder="開通時由區公所/客服提供"
          className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
          style={{ border: "1px solid #dfd1bf", background: "#fff" }}
        />

        <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#5c5145" }}>
          通行碼
        </label>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]"
          style={{ border: "1px solid #dfd1bf", background: "#fff" }}
        />

        {error ? (
          <div className="text-[12.5px] mb-4" style={{ color: "#9c3b3b" }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "#9c3b3b", color: "#fff", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "登入中…" : "登入"}
        </button>

        <p className="text-[11px] leading-relaxed mt-5" style={{ color: "#a89a89" }}>
          雛形版本：每個商家共用一組通行碼，僅供自助編輯營業時間與優惠內容，正式上線前需改為正式帳號機制。
        </p>
      </form>
    </div>
  );
}
