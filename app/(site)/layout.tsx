import Image from "next/image";
import BottomNav from "@/components/BottomNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed wallpaper — stays put behind scrolling content, faded so it
          never competes with foreground text/cards. Aligned to the same
          max-w-md column as the app itself, not the full browser viewport. */}
      <div className="fixed inset-0 flex justify-center pointer-events-none" aria-hidden>
        <div className="relative w-full max-w-md overflow-hidden md:border-x" style={{ borderColor: "var(--line)" }}>
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
        <div className="mx-auto w-full max-w-md md:border-x" style={{ borderColor: "var(--line)" }}>
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
