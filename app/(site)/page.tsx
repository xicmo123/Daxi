import { Suspense } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import { readSlides } from "@/lib/carousel";
import { fetchDaxiParking } from "@/lib/tycgParking";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { fetchDaxiWeather } from "@/lib/cwa";
import { parkingSummary } from "@/lib/experience";

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

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

async function ParkingStat() {
  let summary = "資料整理中";
  try {
    const lots = await fetchDaxiParking();
    const availability = parkingSummary(lots);
    summary = availability.availableStalls > 0 ? `剩 ${availability.availableStalls} 格` : `${availability.openLots.length}/${lots.length} 處尚可`;
  } catch {
    summary = "資料整理中";
  }
  return <>{summary}</>;
}

function ParkingStatSkeleton() {
  return <span className="inline-block h-[22px] w-16 rounded skeleton" style={{ background: "rgba(255,255,255,0.2)" }} />;
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
  const slides = await readSlides();
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
          今日大溪，先掌握即時動態
        </h1>
      </div>

      <Suspense fallback={<TodayStatusSkeleton />}>
        <TodayStatusCards nextTitle={nextMilestone?.title ?? "大溪大禧活動"} />
      </Suspense>

      {/* Hero carousel: swipeable highlights from the festival timeline — now the first real content on the page */}
      <div id="event-carousel" className="pt-5 fade-in scroll-mt-6">
        <HeroCarousel slides={heroSlides} initialIndex={initialSlideIndex} />
      </div>

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
