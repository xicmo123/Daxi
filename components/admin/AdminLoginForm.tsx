"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "登入失敗");
        return;
      }
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f4eee4",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl card-shadow p-8"
        style={{
          width: "100%",
          maxWidth: 384,
          borderRadius: 20,
          padding: 32,
          background: "#fffaf1",
          border: "1px solid #dfd1bf",
          boxShadow: "0 16px 42px rgba(88, 57, 37, 0.14)",
        }}
      >
        <h1 className="font-serif text-xl font-bold mb-1" style={{ margin: "0 0 4px", color: "#2f261f", fontSize: 24, fontWeight: 700 }}>
          後台登入
        </h1>
        <p className="text-[12.5px] mb-6" style={{ margin: "0 0 24px", color: "#766a5d", fontSize: 13 }}>
          大溪通商家／景點管理
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="w-full rounded-xl px-4 py-3 text-[14px] mb-3 outline-none"
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 12,
            fontSize: 14,
            outline: "none",
            background: "#f4eee4",
            color: "#2f261f",
            border: "1px solid #dfd1bf",
          }}
        />
        {error ? (
          <div className="text-[12.5px] mb-3" style={{ marginBottom: 12, color: "#b63a2a", fontSize: 13 }}>
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl py-3 text-[14px] font-medium transition-opacity active:opacity-80 disabled:opacity-50"
          style={{
            width: "100%",
            border: 0,
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 700,
            background: loading || !password ? "#c9b9a6" : "#923428",
            color: "#fffaf1",
            cursor: loading || !password ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
