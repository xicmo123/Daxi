"use client";

import { useRouter } from "next/navigation";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/merchant/logout", { method: "POST" });
    router.push("/merchant/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen" style={{ background: "#f4eee4", color: "#2f261f" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: "#fffaf1", borderBottom: "1px solid #dfd1bf" }}
      >
        <div className="font-serif text-[17px] font-bold">商家自助專區</div>
        <button
          onClick={logout}
          className="text-[12.5px] font-medium rounded-lg px-3 py-1.5 transition-opacity active:opacity-70"
          style={{ border: 0, background: "#dfd1bf", color: "#2f261f" }}
        >
          登出
        </button>
      </header>
      <main className="max-w-lg mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
