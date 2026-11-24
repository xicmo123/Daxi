import { Suspense, cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { CouponWithBusiness } from "@/components/CouponList";
import TouristWelcome from "@/components/TouristWelcome";
import SkinHero, { type SkinHeroSlide } from "@/components/skin/SkinHero";
import SkinFinder from "@/components/skin/SkinFinder";
import SkinGuide from "@/components/skin/SkinGuide";
import SkinEventsRail from "@/components/skin/SkinEventsRail";
import SkinWeatherCard from "@/components/skin/SkinWeatherCard";
import styles from "@/components/skin/Skin.module.css";
import { CouponRail, SpotRail, type HomeSpot } from "@/components/tourist/TouristHomeRails";
import { daxiWalkHref, daxiWalkVisitTime, oldStreetPhoto } from "@/lib/daxiWalk";
import { TOURIST_GUIDE_GROUPS, TOURIST_HASHTAGS, allTouristItems } from "@/lib/touristNav";
import { getCachedEvents, getCachedWeather } from "@/lib/cachedSources";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { isEventExpired } from "@/lib/eventsFeed";
import { weatherMood, type DaxiWeather } from "@/lib/cwa";
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
  // Overrides the layout's "%s ｜ 嗨大溪" template — the home page shouldn't
  // read "嗨大溪 ｜ 嗨大溪".
  title: { absolute: "嗨大溪 — 桃園大溪在地生活與旅遊資訊" },
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

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Taipei" });
const phaseTag = { ongoing: "進行中", upcoming: "即將登場", past: "已結束" } as const;

// Scenic backgrounds for the event slides of the hero, in order.
const FALLBACK_PHOTOS = [
  { src: "/images/puji-temple.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Puji_Temple.jpg" },
  { src: "/images/daxi-bridge.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg" },
  { src: "/images/tea-factory.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Tea_Factory_i.jpg" },
];

function SectionHead({ id, eyebrow, title, lead, more }: { id: string; eyebrow: string; title: string; lead?: string; more?: string }) {
  return (
    <div className={styles.sectionHead}>
      <div className="min-w-0">
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        {lead ? <p className={styles.sectionLead}>{lead}</p> : null}
      </div>
      {more ? (
        <Link href={more} className={styles.more}>
          more <span aria-hidden>+</span>
        </Link>
      ) : null}
    </div>
  );
}

function BlockSkeleton({ height = 220 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 20, background: "var(--rj-surface)" }} />;
}

async function Hero() {
  const [hero, weather] = await Promise.all([
    pickInitialSlide().catch(() => ({ slides: [], initialSlideIndex: 0 })),
    getCachedWeather().catch(() => null),
  ]);
  // The old-street walk always leads: it is what a first-time visitor came
  // for. Live festival milestones follow, then the next events.
  const slides: SkinHeroSlide[] = [
    {
      id: "walk",
      tag: "推薦路線",
      title: "走進大溪老街",
      subtitle: `從和平路的老牌樓，走到普濟堂、公園和武德殿。4 站步行導覽，${daxiWalkVisitTime}。`,
      href: daxiWalkHref,
      ctaLabel: "開始老街散步",
      photo: { src: oldStreetPhoto.src, author: oldStreetPhoto.author, sourceUrl: oldStreetPhoto.sourceUrl },
    },
    ...hero.slides.slice(0, MAX_HERO_SLIDES - 1).map((s, i): SkinHeroSlide => ({
      id: s.id,
      tag: phaseTag[s.phase],
      title: s.title,
      subtitle: s.time ? `${s.date} · ${s.time}` : s.date,
      href: "/events",
      ctaLabel: "看活動資訊",
      // Event posters are full of their own lettering, which fights the
      // hero title; the hero uses scenery and the posters stay in the rail.
      photo: FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length],
    })),
  ];
  // During the festival, open on today's milestone (shifted by the walk slide).
  const initialIndex = hero.initialSlideIndex > 0 && hero.initialSlideIndex < MAX_HERO_SLIDES - 1 ? hero.initialSlideIndex + 1 : 0;
  return (
    <SkinHero
      slides={slides}
      initialIndex={initialIndex}
      label="大溪旅遊重點"
      todayLabel={dateFormatter.format(new Date())}
      weather={weather ? { temp: weather.currentTemp, icon: weather.currentIcon, text: weather.weatherText } : null}
    />
  );
}

// Three sections read the same places/coupons; cache() makes that one read per request.
const loadHomeData = cache(async () => {
  const [rawPlaces, details, activeCoupons, photos, homeSpotOrder, weather] = await Promise.all([
    getAllPlaces(),
    readDetails(),
    listActiveCoupons(),
    readPhotos(),
    readHomeSpotOrder(),
    getCachedWeather().catch((): DaxiWeather | null => null),
  ]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));
  const themes = HOME_TRIP_THEMES.flatMap((theme) => {
    const photo = photos[theme.placeId];
    return photo && byId.has(theme.placeId) ? [{ ...theme, photo }] : [];
  });
  const spots: HomeSpot[] = sortByHomeSpotOrder(
    places
      .filter((p) => p.tag === "景點")
      .map((p) => ({
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
    .slice(0, 8);
  return { themes, spots, coupons, weather };
});

async function Spots() {
  const { spots, weather } = await loadHomeData();
  if (spots.length === 0) return null;
  return <SpotRail spots={spots} preferIndoor={weather ? weatherMood(weather) !== "normal" : false} />;
}

async function Themes() {
  const { themes } = await loadHomeData();
  if (themes.length === 0) return null;
  return (
    <div className={styles.themeGrid}>
      {themes.map((theme) => (
        <div key={theme.placeId} className={`${styles.guideFeature} ${styles.themeCard}`}>
          <Image src={theme.photo.src} alt="" fill sizes="(max-width: 767px) 100vw, 380px" unoptimized={theme.photo.src.startsWith("http")} />
          <h3>
            <Link href={`/spots/${encodeURIComponent(theme.placeId)}`} className={styles.stretchedLink}>
              {theme.title}
            </Link>
          </h3>
          <p>{theme.description}</p>
          {theme.photo.author && theme.photo.sourceUrl ? (
            <a className={styles.guideCredit} href={theme.photo.sourceUrl} target="_blank" rel="noreferrer">
              攝影 {theme.photo.author}
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

async function Coupons() {
  const { coupons } = await loadHomeData();
  if (coupons.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="coupons-title">
      <SectionHead id="coupons-title" eyebrow="DEALS" title="店家優惠" lead="到店出示核銷碼，店員掃碼即可使用" more="/coupons" />
      <CouponRail coupons={coupons} />
    </section>
  );
}

async function Essentials() {
  const weather = await getCachedWeather().catch(() => null);
  return (
    <div className={styles.essentials}>
      <SkinWeatherCard weather={weather} />

      <div className={styles.essCard}>
        <h3>第一次來大溪？</h3>
        <p>先認識老街的故事，再照著路線走一圈。</p>
        <div className={styles.essLinks}>
          <TouristWelcome className={styles.essLink} label={<>讀大溪的故事 <span aria-hidden>→</span></>} />
          <Link href={daxiWalkHref} className={styles.essLink}>
            老街散步路線 <span aria-hidden>→</span>
          </Link>
          <Link href="/businesses?cat=美食" className={styles.essLink}>
            找在地美食 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className={styles.essCard}>
        <h3>交通與停車</h3>
        <p>假日老街周邊車多，出發前先看空位。</p>
        <div className={styles.essLinks}>
          <Link href="/parking" className={styles.essLink}>
            周邊停車與即時空位 <span aria-hidden>→</span>
          </Link>
          <Link href="/bus" className={styles.essLink}>
            大溪公車路線 <span aria-hidden>→</span>
          </Link>
          <Link href="/weather" className={styles.essLink}>
            路況即時影像 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className={styles.heroWrap}>
      <div className={`${styles.hero} skeleton`} />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(DESTINATION_JSON_LD) }} />
      <h1 className="sr-only">嗨大溪：桃園大溪旅遊指南（老街散步、景點、美食、活動與停車）</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <SkinFinder
        items={allTouristItems()}
        hashtags={TOURIST_HASHTAGS}
        placeholder="想去哪裡？例如：大溪橋、豆干、停車"
        searchHref="/search"
        label="搜尋大溪景點與店家"
      />

      <section className={styles.section} aria-labelledby="guide-title">
        <SectionHead id="guide-title" eyebrow="TRAVEL GUIDE" title="大溪怎麼玩" more="/spots" />
        <SkinGuide groups={TOURIST_GUIDE_GROUPS} label="旅遊指南分類" />
      </section>

      <section className={styles.section} aria-labelledby="spots-title">
        <SectionHead id="spots-title" eyebrow="MUST SEE" title="熱門景點" lead="大溪人推薦的必去地點" more="/spots" />
        <Suspense fallback={<BlockSkeleton height={300} />}>
          <Spots />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="themes-title">
        <SectionHead id="themes-title" eyebrow="THEMES" title="主題旅遊" lead="挑一個主題，慢慢走" />
        <Suspense fallback={<BlockSkeleton height={260} />}>
          <Themes />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="events-title">
        <SectionHead id="events-title" eyebrow="EVENTS" title="近期活動" more="/events" />
        <Suspense fallback={<BlockSkeleton height={300} />}>
          <SkinEventsRail href="/events" />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <Coupons />
      </Suspense>

      <section className={styles.section} aria-labelledby="essentials-title">
        <SectionHead id="essentials-title" eyebrow="ESSENTIALS" title="旅遊必備資訊" />
        <Suspense fallback={<BlockSkeleton height={210} />}>
          <Essentials />
        </Suspense>
      </section>
    </main>
  );
}
