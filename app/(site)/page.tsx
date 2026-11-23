import { Suspense } from "react";
import type { Metadata } from "next";
import HomeExperience, { type FeedSpot } from "@/components/HomeExperience";
import TouristHomeHeader from "@/components/TouristHomeHeader";
import type { CouponWithBusiness } from "@/components/CouponList";
import { getCachedEvents, getCachedWeather } from "@/lib/cachedSources";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { isEventExpired } from "@/lib/eventsFeed";
import { weatherMood } from "@/lib/cwa";
import { isIndoorSpot } from "@/lib/experience";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";
import { categoryLabel } from "@/lib/placeDetails";
import { listActiveCoupons } from "@/lib/coupons";
import { readHomeSpotOrder, sortByHomeSpotOrder } from "@/lib/homeSpotOrder";
import { jsonLdString } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";

// The place this site is about, so search engines can tie the home page to
// 大溪 (and 大溪老街) as a tourist destination. Coordinates: 和平老街.
const DESTINATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "桃園大溪",
  alternateName: ["大溪老街", "大溪區", "Daxi"],
  description: "桃園市大溪區，以和平老街的巴洛克立面、豆干、木藝與每年的大溪大禧（關聖帝君聖誕遶境）聞名。",
  url: `${SITE_URL}/`,
  geo: { "@type": "GeoCoordinates", latitude: 24.8847, longitude: 121.28867 },
  address: { "@type": "PostalAddress", addressLocality: "大溪區", addressRegion: "桃園市", addressCountry: "TW" },
  touristType: ["文化觀光", "美食"],
};

// Carousel content is now admin-editable — force-dynamic so edits show up
// immediately instead of waiting out a 60s ISR window (same as /businesses, /spots).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Overrides the layout's "%s ｜ 大溪通" template — the home page shouldn't
  // read "大溪通 ｜ 大溪通".
  title: { absolute: "大溪通 — 桃園大溪在地生活與旅遊資訊" },
  alternates: { canonical: "/" },
};

// The home carousel is prime real estate — one slide is visible at a time and
// it is the second thing on the page. Two rules keep it that way:
//
//   1. Nothing already over. The carousel was opening on 「7/18（六）· 已結束」
//      because past milestones stayed in the list; a finished event is the
//      worst possible first impression for a visitor deciding what to do today.
//   2. At most five. It was rendering eleven dots, which stop working as a
//      position indicator long before that and just read as clutter.
const MAX_HERO_SLIDES = 5;
const HOME_TRIP_THEMES = [
  { placeId: "custom-tycg-1003", title: "到大溪橋看河景", description: "走上橋面，望向大漢溪河谷。" },
  { placeId: "custom-tycg-392", title: "走進木藝老城", description: "從武德殿看大溪的歷史建築。" },
  { placeId: "custom-tycg-963", title: "老茶廠裡尋茶香", description: "順著製茶老屋，認識大溪的茶產業。" },
];

// During the festival, prefer today's or the ongoing milestone over always
// the first slide.
async function pickInitialSlide() {
  const upcoming = (await getCachedEvents()).filter((s) => s.showInCarousel && !isEventExpired(s));
  // Ongoing first, then upcoming — both already in date order from the feed.
  const slides = [
    ...upcoming.filter((s) => s.phase === "ongoing"),
    ...upcoming.filter((s) => s.phase !== "ongoing"),
  ].slice(0, MAX_HERO_SLIDES);
  const isFestivalMode = getFestivalTiming().phase === "during";
  const todaysMilestone = findTodaysMilestone(slides);
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
  return { slides, initialSlideIndex };
}

async function HomeFeed() {
  const [rawPlaces, details, activeCoupons, photos, homeSpotOrder, weather, hero] = await Promise.all([
    getAllPlaces(),
    readDetails(),
    listActiveCoupons(),
    readPhotos(),
    readHomeSpotOrder(),
    getCachedWeather().catch(() => null),
    pickInitialSlide().catch(() => ({ slides: [], initialSlideIndex: 0 })),
  ]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));
  const themes = HOME_TRIP_THEMES.flatMap((theme) => {
    const photo = photos[theme.placeId];
    return photo && byId.has(theme.placeId) ? [{ ...theme, photo }] : [];
  });

  const spotPlaces = places.filter((p) => p.tag === "景點");
  const spots: FeedSpot[] = sortByHomeSpotOrder(
    spotPlaces.map((p) => ({
      placeId: p.placeId,
      name: p.name,
      category: categoryLabel(details[p.placeId]?.category, p.googleType, "景點"),
      distanceLabel: p.distanceLabel,
      featured: Boolean(details[p.placeId]?.featured),
      photoSrc: photos[p.placeId]?.src,
      indoor: isIndoorSpot(p.name, details[p.placeId]?.category),
    })),
    homeSpotOrder,
  ).slice(0, 8);

  const coupons: CouponWithBusiness[] = activeCoupons
    .map((c): CouponWithBusiness | null => {
      const place = byId.get(c.placeId);
      if (!place) return null;
      return { ...c, businessName: place.name, distanceLabel: place.distanceLabel, lat: place.lat, lng: place.lng };
    })
    .filter((c): c is CouponWithBusiness => c !== null)
    .slice(0, 6);

  return (
    <HomeExperience
      spots={spots}
      themes={themes}
      coupons={coupons}
      weatherMood={weather ? weatherMood(weather) : "normal"}
      heroSlides={hero.slides.map((s) => ({
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
        source: s.source,
      }))}
      initialSlideIndex={hero.initialSlideIndex}
    />
  );
}

function HomeFeedSkeleton() {
  return (
    <div className="safe-page-x pb-8" aria-hidden>
      <div className="mb-4 h-7 w-32 rounded-lg skeleton" style={{ background: "var(--line)" }} />
      <div className="h-36 w-full rounded-2xl skeleton" style={{ background: "var(--line)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(DESTINATION_JSON_LD) }} />
      <TouristHomeHeader />
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed />
      </Suspense>
    </main>
  );
}
