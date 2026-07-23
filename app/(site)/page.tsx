import { Suspense } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import HomeExperience, { type FeedSpot } from "@/components/HomeExperience";
import type { CouponWithBusiness } from "@/components/CouponList";
import { isSlideInCarousel, readSlides } from "@/lib/carousel";
import { fetchDaxiParking } from "@/lib/tycgParking";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { fetchDaxiWeather } from "@/lib/cwa";
import { parkingSummary, walkTimeLabel } from "@/lib/experience";
import { fetchDaxiAnnouncements } from "@/lib/announcements";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";
import { categoryLabel } from "@/lib/placeDetails";
import { listActiveCoupons } from "@/lib/coupons";

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

const icon = {
  road: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.2 21c1.8-3.4 1.8-5.6.2-8.2-1.5-2.4-1.2-5.5 1.1-9.8" />
      <path d="M15.7 21c-1.6-3.2-1.5-5.6.3-8.3 1.6-2.5 1.2-5.6-1.4-9.7" />
      <path d="M12 4.8v2M12 10.1v2M12 15.4v2" />
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
  announcement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
      <path d="M4.8 20.2h14.4" />
      <path d="M9.2 8h5.6" />
      <path d="M9.2 11.2h5.6" />
      <path d="M9.2 14.4h3.4" />
      <path d="M17.5 8.2h1.1a1.4 1.4 0 0 1 1.4 1.4v7.2" />
      <path d="M4 16.8V9.6a1.4 1.4 0 0 1 1.4-1.4h1.1" />
    </svg>
  ),
};

// Only destinations that aren't already one tap away via BottomNav
// (活動/景點/商家/停車 are already bottom tabs — repeating them here just
// doubles the same targets on the first screen).
const stories = [
  { href: "/businesses?cat=美食", label: "老街美食", icon: icon.food },
  { href: "/weather", label: "路況", icon: icon.road },
  { href: "/announcements", label: "區公所公告", icon: icon.announcement },
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
    <div className="grid grid-cols-1 gap-2 safe-page-x pt-4 fade-in-delay-1 min-[380px]:grid-cols-3 sm:gap-3 lg:grid-cols-3">
      {[
        { href: "#event-carousel", label: "下一站", value: nextTitle },
        { href: "/parking", label: parkingHrefLabel, value: parkingLabel },
        { href: "/weather", label: "即時", value: weatherLabel },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="min-h-[70px] rounded-xl px-3 py-3 transition-opacity active:opacity-70 sm:min-h-[76px] lg:px-4"
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

async function HomeFeed() {
  const [rawPlaces, details, activeCoupons, photos] = await Promise.all([
    getAllPlaces(),
    readDetails(),
    listActiveCoupons(),
    readPhotos(),
  ]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));

  const spotPlaces = places.filter((p) => p.tag === "景點");
  const spots: FeedSpot[] = spotPlaces.map((p) => ({
    placeId: p.placeId,
    name: p.name,
    category: categoryLabel(details[p.placeId]?.category, p.googleType, "景點"),
    walkTime: walkTimeLabel(p.distanceMeters),
    distanceMeters: p.distanceMeters,
    featured: Boolean(details[p.placeId]?.featured),
    photoSrc: photos[p.placeId]?.src,
  }));

  const coupons: CouponWithBusiness[] = activeCoupons
    .map((c): CouponWithBusiness | null => {
      const place = byId.get(c.placeId);
      if (!place) return null;
      return { ...c, businessName: place.name, distanceLabel: place.distanceLabel };
    })
    .filter((c): c is CouponWithBusiness => c !== null);

  let hasRecentAnnouncement = false;
  try {
    const [latest] = await fetchDaxiAnnouncements(1);
    hasRecentAnnouncement = Boolean(latest && new Date().getTime() - latest.publishedAt < 7 * 24 * 60 * 60 * 1000);
  } catch {
    hasRecentAnnouncement = false;
  }

  return <HomeExperience townName="大溪 Daxi" hasRecentAnnouncement={hasRecentAnnouncement} spots={spots} coupons={coupons} />;
}

function HomeFeedSkeleton() {
  return (
    <div className="safe-page-x pt-6">
      <div className="h-9 w-40 rounded-full skeleton mb-4" style={{ background: "var(--line)" }} />
      <div className="h-11 rounded-full skeleton mb-3" style={{ background: "var(--line)" }} />
      <div className="h-16 rounded-2xl skeleton" style={{ background: "var(--line)" }} />
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
      {/* Greeting + town name + notification bell, mode switch, search,
          map card, spot/coupon feed — reorders itself client-side by
          explore/local mode. Data is fetched here on the server. */}
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed />
      </Suspense>

      <div className="flex items-center justify-between safe-page-x pt-6 pb-1 fade-in">
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--daxi-red)" }}>
          Daxi Today · {todayLabel}
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

      <div className="safe-page-x pt-1 fade-in">
        <h1 className="font-serif text-[22px] font-bold leading-tight sm:text-[26px] lg:text-[32px]" style={{ color: "var(--ink)" }}>
          臺灣十大觀光小城 - 大溪
        </h1>
      </div>

      <Suspense fallback={<TodayStatusSkeleton />}>
        <TodayStatusCards nextTitle={nextMilestone?.title ?? "大溪大禧活動"} />
      </Suspense>

      {/* Hero carousel: swipeable highlights from the festival timeline */}
      {heroSlides.length > 0 ? (
        <div id="event-carousel" className="pt-5 fade-in scroll-mt-6">
          <HeroCarousel slides={heroSlides} initialIndex={initialSlideIndex} />
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 safe-page-x pt-5 pb-2 fade-in-delay-1 sm:gap-x-6 lg:max-w-2xl">
        {stories.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="flex min-w-0 flex-col items-center gap-2 transition-opacity active:opacity-60"
          >
            <span
              className="w-13 h-13 rounded-full flex items-center justify-center card-shadow sm:h-14 sm:w-14"
              style={{ background: "var(--card)", color: "var(--ink)" }}
            >
              {s.icon}
            </span>
            <span className="text-center text-[11px] font-medium leading-tight tracking-wide" style={{ color: "var(--ink-soft)" }}>
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Live cams teaser — only surfaced while the festival is actually on */}
      {isFestivalMode ? (
        <div className="safe-page-x pt-4 fade-in-delay-1">
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
