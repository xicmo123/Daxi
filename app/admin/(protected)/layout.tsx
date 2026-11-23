"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const touristLinks = [
  { href: "/admin", label: "總覽", short: "總覽" }, { href: "/admin/home-spots", label: "首頁熱門景點", short: "熱門" }, { href: "/admin/events", label: "活動管理", short: "活動" }, { href: "/admin/carousel", label: "首頁輪播", short: "輪播" }, { href: "/admin/amenities", label: "友善設施", short: "設施" }, { href: "/admin/routes", label: "主題路線", short: "路線" }, { href: "/admin/traffic-alerts", label: "交通管制公告", short: "交通" }, { href: "/admin/coupons", label: "優惠券管理", short: "優惠" }, { href: "/admin/merchants", label: "商家帳號", short: "商家" }, { href: "/admin/audit-log", label: "操作紀錄", short: "紀錄" },
];

const residentLinks = [
  { href: "/admin/resident-carousel", label: "首頁輪播", short: "輪播" }, { href: "/admin/resident-bulletin", label: "社區佈告欄", short: "公告" }, { href: "/admin/resident-clinics", label: "醫療輪值地圖", short: "醫療" }, { href: "/admin/useful-links", label: "常用連結", short: "連結" }, { href: "/admin/push", label: "推播通知", short: "推播" },
];

const RESIDENT_PREFIXES = [
  "/admin/resident-carousel",
  "/admin/resident-bulletin",
  "/admin/resident-clinics",
  "/admin/useful-links",
  "/admin/push",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const scope: "tourist" | "resident" = RESIDENT_PREFIXES.some((p) => pathname.startsWith(p)) ? "resident" : "tourist";
  const links = scope === "resident" ? residentLinks : touristLinks;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Used when a device is lost or a passcode leaks: invalidates every session
  // in that scope at once (lib/sessionToken.ts). Merchant revocation logs the
  // shops out but leaves this admin session alone; admin revocation logs the
  // current user out too, hence the redirect.
  const revoke = async (scope: "admin" | "merchant") => {
    const label = scope === "admin" ? "所有管理員" : "所有商家";
    if (!window.confirm(`確定要把${label}從所有裝置登出嗎？他們需要重新登入。`)) return;

    const res = await fetch("/api/admin/revoke-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    });
    if (!res.ok) {
      window.alert("撤銷失敗，請稍後再試");
      return;
    }
    if (scope === "admin") {
      router.push("/admin/login");
      router.refresh();
      return;
    }
    window.alert("已將所有商家登出");
  };

  return <div className={`admin-shell admin-shell--${scope}`}><header className="admin-topbar"><Link href="/admin" className="admin-brand"><span className="admin-brand__mark">大</span><span><strong>大溪通</strong><small>內容管理中心</small></span></Link><div className="admin-scope"><button type="button" onClick={() => router.push("/admin")} aria-pressed={scope === "tourist"}>遊客版</button><button type="button" onClick={() => router.push("/admin/resident-carousel")} aria-pressed={scope === "resident"}>大溪人版</button></div><div className="admin-topbar__actions"><Link href={scope === "resident" ? "/resident" : "/"} target="_blank" className="admin-preview">預覽前台 ↗</Link><details className="admin-actions-menu"><summary aria-label="更多管理操作">•••</summary><div><button onClick={() => revoke("merchant")}>強制登出商家</button><button onClick={() => revoke("admin")}>強制登出管理員</button><button onClick={logout}>登出後台</button></div></details></div></header><div className="admin-workspace"><aside className="admin-sidebar"><p className="admin-sidebar__label">{scope === "resident" ? "大溪人服務" : "遊客體驗"}</p><nav>{links.map((link) => <Link key={link.href} href={link.href} data-active={pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`))}>{link.label}</Link>)}</nav><p className="admin-sidebar__hint">切換模式即可管理另一個前台體驗。</p></aside><nav className="admin-mobile-nav no-scrollbar">{links.map((link) => <Link key={link.href} href={link.href} data-active={pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`))}>{link.short}</Link>)}</nav><main className="admin-content">{children}</main></div></div>;
}
