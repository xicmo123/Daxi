"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--paper-2)" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: "var(--paper)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-5">
          <Link href="/admin" className="font-serif text-[17px] font-bold" style={{ color: "var(--ink)" }}>
            大溪通後台
          </Link>
          <Link href="/admin/carousel" className="text-[12.5px] font-medium" style={{ color: "var(--ink-soft)" }}>
            輪播管理
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-[12.5px] underline" style={{ color: "var(--ink-soft)" }}>
            查看網站
          </Link>
          <button
            onClick={logout}
            className="text-[12.5px] font-medium rounded-lg px-3 py-1.5 transition-opacity active:opacity-70"
            style={{ background: "var(--line)", color: "var(--ink)" }}
          >
            登出
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
