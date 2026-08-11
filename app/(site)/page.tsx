import { Suspense } from "react";
import type { Metadata } from "next";
import HomeExperience, { type FeedSpot } from "@/components/HomeExperience";
import type { CouponWithBusiness } from "@/components/CouponList";
import { getCachedAnnouncements, getCachedBuses, getCachedEvents, getCachedParking, getCachedWeather } from "@/lib/cachedSources";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { weatherMood } from "@/lib/cwa";
import { walkTimeLabel, isIndoorSpot } from "@/lib/experience";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";
import { categoryLabel } from "@/lib/placeDetails";
import { listActiveCoupons } from "@/lib/coupons";
import { readHomeSpotOrder, sortByHomeSpotOrder } from "@/lib/homeSpotOrder";
import type { TodayStat } from "@/components/TodayPanel";

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Overrides the layout's "%s ｜ 大溪通" template — the home page shouldn't
  // read "大溪通 ｜ 大溪通".
  title: { absolute: "大溪通 — 桃園大溪在地生活與旅遊資訊" },
  alternates: { canonical: "/" },
};

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

// The home carousel is prime real estate — one slide is visible at a time and
// it is the second thing on the page. Two rules keep it that way:
//
//   1. Nothing already over. The carousel was opening on 「7/18（六）· 已結束」
//      because past milestones stayed in the list; a finished event is the
//      worst possible first impression for a visitor deciding what to do today.
//   2. At most five. It was rendering eleven dots, which stop working as a
//      position indicator long before that and just read as clutter.
const MAX_HERO_SLIDES = 5;

// During the festival, prefer today's or the ongoing milestone over always
// the first slide.
async function pickInitialSlide() {
  const upcoming = (await getCachedEvents()).filter((s) => s.showInCarousel && s.phase !== "past");
  // Ongoing first, then upcoming — both already in date order from the feed.
  const slides = [
    ...upcoming.filter((s) => s.phase === "ongoing"),
    ...upcoming.filter((s) => s.phase !== "ongoing"),
  ].slice(0, MAX_HERO_SLIDES);
  const isFestivalMode = getFestivalTiming().phase === "during";
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
  return { slides, initialSlideIndex, nextMilestone };
}

/**
 * The four live readings behind 「今天的大溪」.
 *
 * Each source is wrapped on its own: these are third-party feeds (中央氣象署,
 * 桃園市停車場, TDX) that fail independently and regularly, and one of them
 * being down must degrade a single tile rather than empty the panel or, worse,
 * take out the home page. A tile with no data says so instead of showing a
 * stale or invented number — for parking in particular, "剩 40 位" when the
 * feed is down would send someone driving to a full car park.
 */
async function buildTodayStats(weather: { icon: string; temp: number; text: string } | null): Promise<TodayStat[]> {
  const [parking, buses, events] = await Promise.all([
    getCachedParking().catch(() => null),
    getCachedBuses().catch(() => null),
    getCachedEvents().catch(() => null),
  ]);

  const stats: TodayStat[] = [];

  stats.push(
    weather
      ? { key: "weather", href: "/weather", label: "天氣", value: `${weather.temp}°`, hint: weather.text, tone: "river" }
      : { key: "weather", href: "/weather", label: "天氣", value: "—", hint: "暫時取得不到", tone: "muted" },
  );

  const ongoing = events?.filter((e) => e.phase === "ongoing").length ?? 0;
  stats.push(
    events
      ? {
          key: "events",
          href: "/events",
          label: "今日活動",
          value: ongoing > 0 ? `${ongoing} 場` : "沒有活動",
          hint: ongoing > 0 ? "正在進行中" : "看看即將登場的",
          tone: ongoing > 0 ? "wood" : "muted",
        }
      : { key: "events", href: "/events", label: "今日活動", value: "—", hint: "暫時取得不到", tone: "muted" },
  );

  if (parking && parking.length > 0) {
    // Open-access lots report no surplus figure, so they are counted as lots
    // rather than folded into the space count as a zero.
    const counted = parking.filter((lot) => typeof lot.surplus === "number" && lot.status !== "full");
    const free = counted.reduce((sum, lot) => sum + (lot.surplus ?? 0), 0);
    stats.push({
      key: "parking",
      href: "/parking",
      label: "停車位",
      value: free > 0 ? `${free} 位` : "幾乎滿了",
      hint: free > 0 ? `${counted.length} 座停車場有空位` : "建議改搭公車前往",
      tone: free > 0 ? "moss" : "muted",
    });
  } else {
    stats.push({ key: "parking", href: "/parking", label: "停車位", value: "—", hint: "暫時取得不到", tone: "muted" });
  }

  // fetchNearbyBuses returns every vehicle in 桃園市 — the map wants them all
  // (see lib/busPositions.ts) but a home-page tile reading 「542 台正在大溪行駛」
  // would be plainly false, so the count is bounded to the area a resident
  // would call 大溪.
  const nearbyBuses = buses?.filter((bus) => bus.distanceMeters <= 5000).length ?? 0;
  stats.push(
    buses
      ? {
          key: "bus",
          href: "/bus",
          label: "公車",
          value: nearbyBuses > 0 ? `${nearbyBuses} 台` : "目前無車",
          hint: nearbyBuses > 0 ? "在大溪周邊行駛" : "查看路線與時刻",
          tone: nearbyBuses > 0 ? "wood" : "muted",
        }
      : { key: "bus", href: "/bus", label: "公車", value: "—", hint: "暫時取得不到", tone: "muted" },
  );

  return stats;
}

async function HomeFeed() {
  const [rawPlaces, details, activeCoupons, photos, homeSpotOrder] = await Promise.all([
    getAllPlaces(),
    readDetails(),
    listActiveCoupons(),
    readPhotos(),
    readHomeSpotOrder(),
  ]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));

  const spotPlaces = places.filter((p) => p.tag === "景點");
  const spots: FeedSpot[] = sortByHomeSpotOrder(
    spotPlaces.map((p) => ({
      placeId: p.placeId,
      name: p.name,
      category: categoryLabel(details[p.placeId]?.category, p.googleType, "景點"),
      walkTime: walkTimeLabel(p.distanceMeters),
      distanceMeters: p.distanceMeters,
      lat: p.lat,
      lng: p.lng,
      featured: Boolean(details[p.placeId]?.featured),
      photoSrc: photos[p.placeId]?.src,
      indoor: isIndoorSpot(p.name, details[p.placeId]?.category),
    })),
    homeSpotOrder,
  );

  let mood: "hot" | "rain" | "normal" = "normal";
  let weatherSummary: { icon: string; temp: number; text: string } | null = null;
  try {
    const weather = await getCachedWeather();
    mood = weatherMood(weather);
    weatherSummary = { icon: weather.currentIcon, temp: weather.currentTemp, text: weather.weatherText };
  } catch {
    mood = "normal";
    weatherSummary = null;
  }

  const coupons: CouponWithBusiness[] = activeCoupons
    .map((c): CouponWithBusiness | null => {
      const place = byId.get(c.placeId);
      if (!place) return null;
      return { ...c, businessName: place.name, distanceLabel: place.distanceLabel, lat: place.lat, lng: place.lng };
    })
    .filter((c): c is CouponWithBusiness => c !== null);

  let hasRecentAnnouncement = false;
  try {
    const [latest] = await getCachedAnnouncements(1);
    hasRecentAnnouncement = Boolean(latest && new Date().getTime() - latest.publishedAt < 7 * 24 * 60 * 60 * 1000);
  } catch {
    hasRecentAnnouncement = false;
  }

  let heroSlides: Awaited<ReturnType<typeof pickInitialSlide>>["slides"] = [];
  let initialSlideIndex = 0;
  try {
    const picked = await pickInitialSlide();
    heroSlides = picked.slides;
    initialSlideIndex = picked.initialSlideIndex;
  } catch {
    heroSlides = [];
  }

  const todayLabel = dateFormatter.format(new Date());
  const todayStats = await buildTodayStats(weatherSummary);

  return (
    <HomeExperience
      todayLabel={todayLabel}
      todayStats={todayStats}
      hasRecentAnnouncement={hasRecentAnnouncement}
      spots={spots}
      coupons={coupons}
      weatherMood={mood}
      weatherSummary={weatherSummary}
      heroSlides={heroSlides.map((s) => ({
        key: s.id,
        phase: s.phase,
        date: s.date,
        time: s.time,
        title: s.title,
        desc: s.desc,
        history: s.history,
        theme: s.theme,
        badges: s.badges,
        ctaLabel: s.ctaLabel,
        ctaUrl: s.ctaUrl,
        photoSrc: s.photoSrc,
        photoHistorical: s.photoHistorical,
      }))}
      initialSlideIndex={initialSlideIndex}
    />
  );
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

export default function Home() {
  return (
    <div>
      {/* Hero (town headline, weather, search), event carousel, and quick
          actions all live inside HomeExperience now — reorders itself
          client-side by explore/local mode. Data is fetched here on the
          server. */}
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed />
      </Suspense>

      <div className="pb-8" />
    </div>
  );
}
