import Image from "next/image";
import Link from "next/link";
import ResidentBottomNav from "@/components/ResidentBottomNav";
import { getFestivalTiming } from "@/lib/festivalTiming";

// Separate layout/segment from app/(site) — residents get their own bottom
// nav and page set entirely, not just a reordered tourist home. Shares the
// wallpaper treatment for brand consistency but nothing else from SiteLayout.
export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  // 大溪大拜拜模式: during the festival window, residents get a persistent
  // shortcut to traffic-control info instead of the normal quiet nav.
  const isFestivalMode = getFestivalTiming().phase === "during";

  return (
    <>
      <div className="fixed inset-0 flex justify-center pointer-events-none" aria-hidden>
        <div className="relative w-full max-w-md overflow-hidden md:max-w-3xl md:border-x lg:max-w-6xl" style={{ borderColor: "var(--line)" }}>
          <Image
            src="/images/old-street-sketch-2.jpg"
            alt=""
            fill
            sizes="448px"
            className="object-cover"
            style={{ objectPosition: "center top", filter: "blur(7px)", transform: "scale(1.08)" }}
          />
          <div className="absolute inset-0" style={{ background: "var(--paper)", opacity: "var(--wallpaper-fade-opacity)" }} />
        </div>
      </div>

      <div className="relative z-10 flex-1 pb-20">
        <div className="mx-auto w-full max-w-md md:max-w-3xl md:border-x lg:max-w-6xl" style={{ borderColor: "var(--line)" }}>
          {isFestivalMode ? (
            <Link
              href="/resident/parade"
              className="sticky top-0 z-20 flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-semibold transition-opacity active:opacity-80"
              style={{ background: "var(--daxi-red)", color: "#fff" }}
            >
              🏮 大溪大拜拜期間・交通管制中，點我看範圍與陣頭動態
            </Link>
          ) : null}
          {children}
        </div>
      </div>
      <ResidentBottomNav />
    </>
  );
}
