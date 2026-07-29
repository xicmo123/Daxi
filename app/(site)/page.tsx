import { Suspense } from "react";
import HomeExperience, { type FeedSpot } from "@/components/HomeExperience";
import type { CouponWithBusiness } from "@/components/CouponList";
import { getMergedEvents } from "@/lib/eventsFeed";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { fetchDaxiWeather, weatherMood } from "@/lib/cwa";
import { walkTimeLabel, isIndoorSpot } from "@/lib/experience";
import { fetchDaxiAnnouncements } from "@/lib/announcements";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";
import { categoryLabel } from "@/lib/placeDetails";
import { listActiveCoupons } from "@/lib/coupons";
import { readHomeSpotOrder, sortByHomeSpotOrder } from "@/lib/homeSpotOrder";

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

// During the festival, prefer today's or the ongoing milestone over always
// the first (often already-past) slide.
async function pickInitialSlide() {
  const slides = (await getMergedEvents()).filter((s) => s.showInCarousel);
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
      featured: Boolean(details[p.placeId]?.featured),
      photoSrc: photos[p.placeId]?.src,
      indoor: isIndoorSpot(p.name, details[p.placeId]?.category),
    })),
    homeSpotOrder,
  );

  let mood: "hot" | "rain" | "normal" = "normal";
  let weatherSummary: { icon: string; temp: number; text: string } | null = null;
  try {
    const weather = await fetchDaxiWeather();
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

  return (
    <HomeExperience
      todayLabel={todayLabel}
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
