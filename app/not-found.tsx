import Link from "next/link";
import { buttonRecipe } from "@/components/ui/styles";

// Root 404. Deliberately a Server Component with no data fetching, so it can
// still render when the data sources behind the rest of the app are down.
export default function NotFound() {
  const primary = buttonRecipe("primary", "md", true);
  const secondary = buttonRecipe("secondary", "md", true);

  return (
    <div className="safe-page-x flex min-h-[70dvh] flex-col items-center justify-center py-12 text-center">
      <div className="text-[40px]" aria-hidden>
        🗺️
      </div>
      <h1 className="mt-2 text-[17px] font-bold" style={{ color: "var(--ink)" }}>
        找不到這個頁面
      </h1>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        這個連結可能已經失效，或是活動、優惠券已經結束了。
      </p>
      <div className="mt-5 flex w-full max-w-[280px] flex-col gap-2">
        <Link href="/" className={primary.className} style={primary.style}>
          回遊客首頁
        </Link>
        <Link href="/resident" className={secondary.className} style={secondary.style}>
          回大溪人首頁
        </Link>
      </div>
    </div>
  );
}
