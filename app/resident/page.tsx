import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { readSource } from "@/lib/fetchWithTimeout";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrappers are immune to it. See lib/cachedSources.ts.
import { getCachedAnnouncements, getCachedEvents, getCachedWeather } from "@/lib/cachedSources";
import { isEventExpired } from "@/lib/eventsFeed";
import { listUpcomingOutages } from "@/lib/outages";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { activeBulletinPosts, readBulletinPosts, sortedBulletinPosts } from "@/lib/bulletinData";
import { listActiveResidentSlides } from "@/lib/residentCarousel";
import { GARBAGE_SHEET_HREF, RESIDENT_NAV } from "@/lib/residentNav";
import ResidentHero, { type ResidentHeroSlide } from "@/components/resident/ResidentHero";
import ResidentFinder from "@/components/resident/ResidentFinder";
import ResidentBulletin from "@/components/resident/ResidentBulletin";
import ResidentLifeGuide from "@/components/resident/ResidentLifeGuide";
import ResidentRail from "@/components/resident/ResidentRail";
import ResidentIcon from "@/components/resident/ResidentIcon";
import styles from "@/components/resident/ResidentSkin.module.css";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/resident",
  title: "我是大溪人：大溪居民生活資訊",
  description: "大溪居民每天要用的資訊一次看：停水停電、垃圾車即時位置、道路施工、區公所公告、診所輪值、AED 位置與陳情報修管道。",
});

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Taipei" });

// Hero photos, assigned by slide position — admins edit slide text in the
// resident-carousel admin, not imagery.
const HERO_PHOTOS = [
  RESIDENT_NAV[0].photo,
  {
    src: "/images/old-street-crowd.jpg",
    author: "Andrewhaimerl",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Old_Street_Crowd.jpg",
  },
  RESIDENT_NAV[3].photo,
  RESIDENT_NAV[1].photo,
  RESIDENT_NAV[2].photo,
];

const FALLBACK_SLIDES = [
  { id: "f-outages", tag: "緊急", title: "停水停電通知", subtitle: "預告中的停水停電整理", href: "/resident/outages" },
  { id: "f-garbage", tag: "一般", title: "垃圾車即時地圖", subtitle: "查看附近的清運車", href: GARBAGE_SHEET_HREF },
  { id: "f-roadworks", tag: "一般", title: "道路施工地圖", subtitle: "查看今日道路申挖與施工位置", href: "/resident/roadworks" },
];

async function Hero() {
  const [slides, weather] = await Promise.all([
    listActiveResidentSlides().catch(() => []),
    getCachedWeather().catch(() => null),
  ]);
  const source = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const heroSlides: ResidentHeroSlide[] = source.slice(0, 5).map((s, i) => ({
    id: s.id,
    tag: s.tag,
    title: s.title,
    subtitle: s.subtitle,
    // The garbage map has no route of its own — point it at the home sheet.
    href: "featureKey" in s && s.featureKey === "garbage" ? GARBAGE_SHEET_HREF : s.href,
    photo: HERO_PHOTOS[i % HERO_PHOTOS.length],
  }));
  return (
    <ResidentHero
      slides={heroSlides}
      todayLabel={dateFormatter.format(new Date())}
      weather={weather ? { temp: weather.currentTemp, icon: weather.currentIcon, text: weather.weatherText } : null}
    />
  );
}

function HeroSkeleton() {
  return (
    <div className={styles.heroWrap}>
      <div className={`${styles.hero} skeleton`} />
    </div>
  );
}

async function TodayStats() {
  // A failed source is null, not 0 — "—" means "we don't know", never "none".
  const [outages, roadworks, announcements] = await Promise.all([
    readSource(() => listUpcomingOutages()),
    readSource(() => fetchDaxiRoadworks()),
    readSource(() => getCachedAnnouncements(10)),
  ]);
  const items = [
    { href: "/resident/outages", label: "停水停電預告", icon: "outage" as const, count: outages.ok ? outages.data.length : null, unit: "則", alertWhenAny: true },
    { href: "/resident/roadworks", label: "道路施工中", icon: "roadworks" as const, count: roadworks.ok ? roadworks.data.length : null, unit: "處", alertWhenAny: false },
    { href: "/resident/announcements", label: "區公所公告", icon: "announcement" as const, count: announcements.ok ? announcements.data.length : null, unit: "則", alertWhenAny: false },
  ];
  return (
    <div className={styles.stats}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={styles.stat} data-alert={item.alertWhenAny && (item.count ?? 0) > 0 ? "true" : undefined}>
          <span className={styles.statIcon}>
            <ResidentIcon name={item.icon} size={18} />
          </span>
          <span>
            <span className={styles.statLabel}>{item.label}</span>
            <span className={styles.statValue} style={{ display: "block" }}>
              {item.count ?? "—"}
              {item.count !== null ? <small>{item.unit}</small> : null}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className={styles.stats}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${styles.stat} skeleton`} />
      ))}
    </div>
  );
}

async function Bulletin() {
  const posts = await readBulletinPosts().catch(() => []);
  return <ResidentBulletin posts={sortedBulletinPosts(activeBulletinPosts(posts))} />;
}

const phaseLabel = { ongoing: "進行中", upcoming: "即將登場", past: "已結束" } as const;

async function Events() {
  const events = (await getCachedEvents().catch(() => [])).filter((e) => !isEventExpired(e) && e.phase !== "past").slice(0, 8);
  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>近期沒有活動</strong>
        新活動公布後會出現在這裡
      </div>
    );
  }
  return (
    <ResidentRail label="近期活動">
      {events.map((e) => (
        <Link key={e.id} href="/resident/events" className={styles.eventCard} role="listitem">
          <div className={styles.eventPhoto}>
            <Image
              src={e.photoSrc ?? "/images/puji-temple.jpg"}
              alt=""
              fill
              sizes="(max-width: 767px) 82vw, (max-width: 1023px) 340px, 340px"
              unoptimized={Boolean(e.photoSrc?.startsWith("http"))}
            />
            <span className={`${styles.badge} ${styles.eventPhase}`} data-tone={e.phase === "ongoing" ? "ok" : "main"} style={{ background: e.phase === "ongoing" ? undefined : "var(--rj-bg)" }}>
              {phaseLabel[e.phase]}
            </span>
          </div>
          <h3>{e.title}</h3>
          <p>
            {e.date}
            {e.time ? ` · ${e.time}` : ""}
          </p>
        </Link>
      ))}
    </ResidentRail>
  );
}

async function Essentials() {
  const weather = await getCachedWeather().catch(() => null);
  return (
    <div className={styles.essentials}>
      <div className={styles.essCard} data-tone="main">
        <h3>大溪天氣</h3>
        <p>{weather ? weather.description || weather.weatherText : "氣象署資料暫時無法取得"}</p>
        {weather ? (
          <>
            <div className={styles.weatherNow}>
              <span aria-hidden>{weather.currentIcon}</span>
              <b>{Math.round(weather.currentTemp)}°</b>
              <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
                {weather.weatherText}
                <br />
                體感 {Math.round(weather.apparentTemp)}° · 濕度 {weather.humidity}%
              </span>
            </div>
            {weather.hourly.length > 0 ? (
              <div className={styles.weatherHours}>
                {weather.hourly.slice(0, 4).map((h) => (
                  <div key={h.hour}>
                    {h.hour}
                    <br />
                    <span aria-hidden>{h.icon}</span> {h.temp}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className={styles.essCard}>
        <h3>緊急聯絡</h3>
        <p>點一下直接撥號</p>
        <div className={styles.callList}>
          <a className={styles.call} href="tel:110">
            <b>110</b>
            <small>警察</small>
          </a>
          <a className={styles.call} href="tel:119">
            <b>119</b>
            <small>消防救護</small>
          </a>
          <a className={styles.call} href="tel:165">
            <b>165</b>
            <small>反詐騙</small>
          </a>
        </div>
        <Link href="/resident/aed" className={styles.essLink} style={{ marginTop: 8 }}>
          尋找最近的 AED <span aria-hidden>→</span>
        </Link>
      </div>

      <div className={styles.essCard}>
        <h3>陳情與服務</h3>
        <p>路燈、坑洞、路樹，這樣通報最快</p>
        <div className={styles.essLinks}>
          <a href="tel:1999" className={styles.essLink}>
            撥打市民專線 1999 <span aria-hidden>☎</span>
          </a>
          <Link href="/resident/services#report" className={styles.essLink}>
            線上陳情 / 報修 <span aria-hidden>→</span>
          </Link>
          <Link href="/resident/services#links" className={styles.essLink}>
            戶政・地政・稅務連結 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlockSkeleton({ height = 196 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 20, background: "var(--rj-surface)" }} />;
}

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

export default function ResidentHome() {
  return (
    <main>
      <h1 className="sr-only">我是大溪人：大溪居民生活資訊（停水停電、垃圾車、道路施工、公告、診所與 AED）</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <ResidentFinder />

      <section className={styles.section} aria-labelledby="today-title">
        <SectionHead id="today-title" eyebrow="TODAY" title="今日大溪快報" lead="即時串接官方資料，數字點進去看細節" />
        <Suspense fallback={<StatsSkeleton />}>
          <TodayStats />
        </Suspense>
      </section>

      <section id="bulletin" className={styles.section} aria-labelledby="bulletin-title">
        <SectionHead id="bulletin-title" eyebrow="COMMUNITY" title="社區佈告欄" lead="里長發布的里內消息" />
        <Suspense fallback={<BlockSkeleton />}>
          <Bulletin />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="guide-title">
        <SectionHead id="guide-title" eyebrow="LIFE GUIDE" title="大溪生活指南" more="/resident/services" />
        <Suspense fallback={<BlockSkeleton height={320} />}>
          <ResidentLifeGuide />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="events-title">
        <SectionHead id="events-title" eyebrow="EVENTS" title="近期在地活動" more="/resident/events" />
        <Suspense fallback={<BlockSkeleton height={280} />}>
          <Events />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="essentials-title">
        <SectionHead id="essentials-title" eyebrow="ESSENTIALS" title="生活必備資訊" />
        <Suspense fallback={<BlockSkeleton height={210} />}>
          <Essentials />
        </Suspense>
      </section>
    </main>
  );
}
