"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const touristLinks = [
  { href: "/admin", label: "景點/商家管理" },
  { href: "/admin/events", label: "活動管理" },
  { href: "/admin/carousel", label: "首頁輪播" },
];

const residentLinks = [{ href: "/admin/resident-carousel", label: "首頁輪播" }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const scope: "tourist" | "resident" = pathname.startsWith("/admin/resident-carousel") ? "resident" : "tourist";
  const links = scope === "resident" ? residentLinks : touristLinks;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen" style={{ minHeight: "100vh", background: "#f4eee4", color: "#2f261f" }}>
      <header
        className="sticky top-0 z-10"
        style={{ position: "sticky", top: 0, zIndex: 10, background: "#fffaf1", borderBottom: "1px solid #dfd1bf" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 24px" }}
        >
          <div className="flex items-center gap-5" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/admin" className="text-[17px] font-bold" style={{ color: "#2f261f", fontSize: 17, fontWeight: 700, textDecoration: "none" }}>
              大溪通後台
            </Link>

            {/* 遊客/大溪人 scope switch — one admin session, two content
                zones. Switching just navigates to that zone's default page;
                nav links below re-render based on the resulting pathname. */}
            <div className="inline-flex p-1 rounded-full" style={{ background: "#f4eee4", border: "1px solid #dfd1bf" }}>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-opacity"
                style={{
                  background: scope === "tourist" ? "#a06a3a" : "transparent",
                  color: scope === "tourist" ? "#fff" : "#766a5d",
                }}
              >
                遊客管理
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/resident-carousel")}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-opacity"
                style={{
                  background: scope === "resident" ? "#4a7594" : "transparent",
                  color: scope === "resident" ? "#fff" : "#766a5d",
                }}
              >
                大溪人管理
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" target="_blank" className="text-[12.5px] underline" style={{ color: "#766a5d", fontSize: 13 }}>
              查看網站
            </Link>
            <button
              onClick={logout}
              className="text-[12.5px] font-medium rounded-lg px-3 py-1.5 transition-opacity active:opacity-70"
              style={{ border: 0, borderRadius: 8, padding: "6px 12px", background: "#dfd1bf", color: "#2f261f", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              登出
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5 px-6 pb-3" style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 24px 12px" }}>
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12.5px] font-medium"
                style={{ color: active ? "#2f261f" : "#766a5d", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8" style={{ width: "100%", maxWidth: 768, boxSizing: "border-box", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
