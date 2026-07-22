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
    <div className="min-h-screen" style={{ minHeight: "100vh", background: "#f4eee4", color: "#2f261f" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 24px",
          background: "#fffaf1",
          borderBottom: "1px solid #dfd1bf",
        }}
      >
        <div className="flex items-center gap-5" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/admin" className="font-serif text-[17px] font-bold" style={{ color: "#2f261f", fontSize: 17, fontWeight: 700, textDecoration: "none" }}>
            大溪通後台
          </Link>
          <Link href="/admin/carousel" className="text-[12.5px] font-medium" style={{ color: "#766a5d", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            輪播管理
          </Link>
        </div>
        <div className="flex items-center gap-4" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" target="_blank" className="text-[12.5px] underline" style={{ color: "#766a5d", fontSize: 13 }}>
            查看網站
          </Link>
          <button
            onClick={logout}
            className="text-[12.5px] font-medium rounded-lg px-3 py-1.5 transition-opacity active:opacity-70"
            style={{
              border: 0,
              borderRadius: 8,
              padding: "6px 12px",
              background: "#dfd1bf",
              color: "#2f261f",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            登出
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8" style={{ width: "100%", maxWidth: 768, boxSizing: "border-box", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
