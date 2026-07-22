import { Suspense } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import { isSlideInCarousel, readSlides } from "@/lib/carousel";
import { fetchDaxiParking } from "@/lib/tycgParking";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { fetchDaxiWeather } from "@/lib/cwa";
import { parkingSummary } from "@/lib/experience";

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

const icon = {
  festival: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5.8h8" />
      <path d="M9 4.1h6" />
      <path d="M8.5 7.2c-1.2 1.3-1.8 3.1-1.8 5s.6 3.7 1.8 5" />
      <path d="M15.5 7.2c1.2 1.3 1.8 3.1 1.8 5s-.6 3.7-1.8 5" />
      <path d="M9 18.2h6" />
      <path d="M10 20h4" />
      <path d="M12 5.8v12.4" />
      <path d="M4.5 8.6l.7 1.4 1.4.7-1.4.7-.7 1.4-.7-1.4-1.4-.7 1.4-.7Z" />
      <path d="M19.3 12.8l.5 1 .9.5-.9.5-.5 1-.5-1-.9-.5.9-.5Z" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4" width="15" height="15" rx="4" />
      <path d="M10 15.8V8.2h3.1a2.45 2.45 0 1 1 0 4.9H10" />
      <path d="M17.5 18.7 19.3 21l1.8-2.3" />
      <circle cx="19.3" cy="17.4" r="1.1" />
    </svg>
  ),
  road: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.2 21c1.8-3.4 1.8-5.6.2-8.2-1.5-2.4-1.2-5.5 1.1-9.8" />
      <path d="M15.7 21c-1.6-3.2-1.5-5.6.3-8.3 1.6-2.5 1.2-5.6-1.4-9.7" />
      <path d="M12 4.8v2M12 10.1v2M12 15.4v2" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 7.2 9 5.3l6 2.4 4.5-1.9v12l-4.5 1.9-6-2.4-4.5 1.9Z" />
      <path d="M9 5.3v12" />
      <path d="M15 7.7v12" />
      <path d="M12 14s2.8-2.7 2.8-5a2.8 2.8 0 1 0-5.6 0c0 2.3 2.8 5 2.8 5Z" />
      <circle cx="12" cy="9" r="0.9" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 12.2h13a6.5 6.5 0 0 1-13 0Z" />
      <path d="M8.2 18.7h7.6" />
      <path d="M7.3 9.2 16.8 4" />
      <path d="M10.1 9.2 19.5 4" />
      <path d="M8 13.8h8" />
    </svg>
  ),
};

const stories = [
  { href: "/events", label: "大禧活動", icon: icon.festival },
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

async function TodayStatusCards({ nextTitle }: { nextTitle: string }) {
  let weatherLabel = "天氣整理中";
  let parkingLabel = "停車整理中";
  let parkingHrefLabel = "查看";

  try {
    const weather = await fetchDaxiWeather();
    weatherLabel = `${weather.currentIcon} ${weather.currentTemp}°・${weather.weatherText || "大溪區"}`;
  } catch {
    weatherLabel = "天氣整理中";
  }

  try {
    const lots = await fetchDaxiParking();
    const summary = parkingSummary(lots);
    parkingLabel = summary.recommended
      ? `建議 ${summary.recommended.name.replace(/\(桃交\)/g, "")}`
      : "公有停車場偏滿";
    parkingHrefLabel = summary.availableStalls > 0 ? `剩 ${summary.availableStalls} 格` : "看替代";
  } catch {
    parkingLabel = "停車整理中";
  }

  return (
    <div className="grid grid-cols-3 gap-2 px-6 pt-4 fade-in-delay-1">
      {[
        { href: "#event-carousel", label: "下一站", value: nextTitle },
        { href: "/parking", label: parkingHrefLabel, value: parkingLabel },
        { href: "/weather", label: "即時", value: weatherLabel },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="min-h-[76px] rounded-xl px-3 py-3 transition-opacity active:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="text-[10.5px] font-semibold mb-1" style={{ color: "var(--daxi-red)" }}>
            {item.label}
          </div>
          <div className="text-[12.5px] leading-snug line-clamp-2" style={{ color: "var(--ink)" }}>
            {item.value}
          </div>
        </Link>
      ))}
    </div>
  );
}

function TodayStatusSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 px-6 pt-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[76px] rounded-xl skeleton" style={{ background: "var(--line)" }} />
      ))}
    </div>
  );
}

export default async function Home() {
  const timing = getFestivalTiming();
  const isFestivalMode = timing.phase === "during";
  const todayLabel = dateFormatter.format(new Date());
  const allSlides = await readSlides();
  const slides = allSlides.filter(isSlideInCarousel);
  const heroSlides = slides.map((m) => ({
    key: m.id,
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

  // During the festival, open the carousel on today's milestone (or the
  // nearest ongoing/upcoming one) instead of always the first, often
  // already-past, slide.
  const todaysMilestone = findTodaysMilestone(slides);
  const nextMilestone = todaysMilestone ?? slides.find((m) => m.phase === "ongoing") ?? slides.find((m) => m.phase === "upcoming") ?? slides[0];
  const initialSlideIndex = isFestivalMode
    ? (() => {
        if (todaysMilestone) {
          const idx = slides.indexOf(todaysMilestone);
          if (idx >= 0) return idx;
        }
        const ongoingIdx = slides.findIndex((m) => m.phase === "ongoing");
        if (ongoingIdx >= 0) return ongoingIdx;
        const upcomingIdx = slides.findIndex((m) => m.phase === "upcoming");
        return upcomingIdx >= 0 ? upcomingIdx : 0;
      })()
    : 0;

  return (
    <div>
      {/* Date + weather, plain text — no card, no hero image */}
      <div className="flex items-center justify-between px-6 pt-6 pb-1 fade-in">
        <span className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
          {todayLabel}
        </span>
        <Link
          href="/weather"
          className="text-[13px] font-medium flex items-center gap-1 transition-opacity active:opacity-60"
          style={{ color: "var(--ink)" }}
        >
          <Suspense fallback={<WeatherChipSkeleton />}>
            <WeatherChip />
          </Suspense>
        </Link>
      </div>

      <div className="px-6 pt-2 fade-in">
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: "var(--daxi-red)" }}>
          Daxi Today
        </div>
        <h1 className="font-serif text-[25px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
          臺灣十大觀光小城 - 大溪
        </h1>
      </div>

      <Suspense fallback={<TodayStatusSkeleton />}>
        <TodayStatusCards nextTitle={nextMilestone?.title ?? "大溪大禧活動"} />
      </Suspense>

      {/* Hero carousel: swipeable highlights from the festival timeline — now the first real content on the page */}
      {heroSlides.length > 0 ? (
        <div id="event-carousel" className="pt-5 fade-in scroll-mt-6">
          <HeroCarousel slides={heroSlides} initialIndex={initialSlideIndex} />
        </div>
      ) : null}

      {/* Quick actions — one calm row instead of a busy icon grid */}
      <div className="flex justify-between px-6 pt-5 pb-2 fade-in-delay-1">
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

      {/* Live cams teaser — only surfaced while the festival is actually on */}
      {isFestivalMode ? (
        <div className="px-6 pt-4 fade-in-delay-1">
          <Link
            href="/weather"
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 card-shadow transition-opacity active:opacity-70"
            style={{ background: "var(--card)" }}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--paper-2)", color: "var(--ink)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
                <path d="M15.5 10.5 21 7.5v9l-5.5-3Z" />
              </svg>
            </span>
            <span className="flex-1 text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              現正登場・大溪老街即時影像
            </span>
            <span
              className="text-[10px] font-medium rounded-full px-2 py-0.5"
              style={{ background: "var(--festival-gold)", color: "#fff" }}
            >
              LIVE
            </span>
          </Link>
        </div>
      ) : null}

      <div className="pb-8" />
    </div>
  );
}
