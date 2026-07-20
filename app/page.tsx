import { Suspense } from "react";
import Link from "next/link";
import ParallaxHero from "@/components/ParallaxHero";
import HeroCarousel from "@/components/HeroCarousel";
import { eventMilestones } from "@/lib/data";
import { fetchDaxiParking } from "@/lib/tycgParking";
import { getFestivalTiming } from "@/lib/festivalTiming";
import { fetchDaxiWeather } from "@/lib/cwa";

export const revalidate = 60;

const icon = {
  mask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
    </svg>
  ),
  road: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M9 21 10.5 3M15 21 13.5 3" />
      <path d="M12 5.5v2.5M12 11v2.5M12 16.5V19" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />
    </svg>
  ),
};

const stories = [
  { href: "#event-carousel", label: "大禧活動", icon: icon.mask },
  { href: "/parking", label: "停車導航", icon: icon.parking },
  { href: "/weather", label: "路況", icon: icon.road },
  { href: "/spots", label: "老街景點", icon: icon.pin },
  { href: "/businesses?cat=美食", label: "老街美食", icon: icon.food },
];

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

async function WeatherChip() {
  let weatherChip: { icon: string; temp: number } | null = null;
  try {
    const weather = await fetchDaxiWeather();
    weatherChip = { icon: weather.currentIcon, temp: weather.currentTemp };
  } catch {
    weatherChip = null;
  }

  return weatherChip ? (
    <>
      <span>{weatherChip.icon}</span>
      <span className="tabular-nums">{weatherChip.temp}°</span>
    </>
  ) : (
    <span style={{ color: "var(--ink-soft)" }}>—</span>
  );
}

function WeatherChipSkeleton() {
  return <span className="inline-block h-[15px] w-10 rounded skeleton" style={{ background: "var(--line)" }} />;
}

function WeatherChipSkeletonOnDark() {
  return <span className="inline-block h-[15px] w-10 rounded skeleton" style={{ background: "rgba(255,255,255,0.3)" }} />;
}

async function ParkingStat() {
  let parkingSummary = "資料整理中";
  try {
    const lots = await fetchDaxiParking();
    const available = lots.filter((l) => l.status !== "full").length;
    parkingSummary = `${available}/${lots.length} 處尚可`;
  } catch {
    parkingSummary = "資料整理中";
  }
  return <>{parkingSummary}</>;
}

function ParkingStatSkeleton() {
  return <span className="inline-block h-[22px] w-16 rounded skeleton" style={{ background: "rgba(255,255,255,0.2)" }} />;
}

export default async function Home() {
  const timing = getFestivalTiming();
  const todayLabel = dateFormatter.format(new Date());
  const heroSlides = eventMilestones.map((m) => ({
    key: m.date,
    phase: m.phase,
    date: m.date,
    time: m.time,
    title: m.title,
    desc: m.desc,
    history: m.history,
    theme: m.theme,
    badges: m.badges,
    ctaLabel: m.ctaLabel,
    ctaUrl: m.ctaUrl,
    photoSrc: m.photo?.src,
    photoHistorical: m.photo?.historical,
  }));

  return (
    <div>
      {/* Full-bleed hero: atmosphere before information */}
      <ParallaxHero src="/images/daxi-bridge.jpg" alt="大溪橋夜間點燈">
        <div className="absolute top-6 right-6">
          <Link
            href="/weather"
            className="flex flex-col items-end gap-0.5 rounded-xl px-3 py-1.5 transition-opacity active:opacity-70"
            style={{ background: "rgba(15,13,10,0.35)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
              {todayLabel}
            </span>
            <span className="text-[13px] font-semibold flex items-center gap-1 text-white">
              <Suspense fallback={<WeatherChipSkeletonOnDark />}>
                <WeatherChip />
              </Suspense>
            </span>
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-9 text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.72)" }}>
            📍 桃園市大溪區・老街周邊
          </div>
          <h1 className="font-serif text-[42px] leading-tight font-semibold text-white mb-5">溪遊指南</h1>
          <div className="flex flex-col items-center gap-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
            <span className="text-[10.5px] tracking-[0.15em]">向下滑動，探索大溪</span>
            <svg
              className="scroll-cue"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </ParallaxHero>

      {/* Quick actions — one calm row instead of a busy icon grid */}
      <div className="flex justify-between px-6 pt-6 pb-2 fade-in">
        {stories.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="flex flex-col items-center gap-2 transition-opacity active:opacity-60"
          >
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center card-shadow"
              style={{ background: "var(--card)", color: "var(--ink)" }}
            >
              {s.icon}
            </span>
            <span className="text-[11px] font-medium tracking-wide text-center" style={{ color: "var(--ink-soft)" }}>
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Hero carousel: swipeable highlights from the festival timeline */}
      <div id="event-carousel" className="pt-3 fade-in-delay-1 scroll-mt-6">
        <HeroCarousel slides={heroSlides} />
      </div>

      {/* Stat banner — one moment of visual weight against the quiet cards around it */}
      <div className="px-6 pt-6 fade-in-delay-2">
        <div
          className="rounded-2xl card-shadow px-6 py-5 flex items-center justify-between"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          <div>
            <div className="text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              大溪區公有停車場
            </div>
            <div className="font-serif text-[26px] font-light leading-none">
              <Suspense fallback={<ParkingStatSkeleton />}>
                <ParkingStat />
              </Suspense>
            </div>
          </div>
          <div className="w-px self-stretch mx-5" style={{ background: "rgba(255,255,255,0.16)" }} />
          <div className="text-right">
            <div className="text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              距遶境隨香
            </div>
            <div className="font-serif text-[26px] font-light leading-none">
              {timing.daysToProcession}
              <span className="text-[11px] font-sans font-normal ml-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                天（8/6）
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-10" />
    </div>
  );
}
