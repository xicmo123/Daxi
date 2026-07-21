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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--paper-2)" }}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl card-shadow p-8"
        style={{ background: "var(--paper)" }}
      >
        <h1 className="font-serif text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
          後台登入
        </h1>
        <p className="text-[12.5px] mb-6" style={{ color: "var(--ink-soft)" }}>
          大溪通商家／景點管理
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="w-full rounded-xl px-4 py-3 text-[14px] mb-3 outline-none"
          style={{ background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
        />
        {error ? (
          <div className="text-[12.5px] mb-3" style={{ color: "var(--status-warn)" }}>
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl py-3 text-[14px] font-medium transition-opacity active:opacity-80 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
