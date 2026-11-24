import { cache, Suspense } from "react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { readSource } from "@/lib/fetchWithTimeout";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrappers are immune to it. See lib/cachedSources.ts.
import { getCachedAnnouncements, getCachedClinics, getCachedWeather } from "@/lib/cachedSources";
import { loadHomeStops } from "@/lib/homeStops";
import { currentSession, SESSIONS } from "@/lib/nhiClinics";
import { listUpcomingOutages } from "@/lib/outages";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { activeBulletinPosts, readBulletinPosts, sortedBulletinPosts } from "@/lib/bulletinData";
import { listActiveResidentSlides } from "@/lib/residentCarousel";
import { GARBAGE_HREF } from "@/lib/residentNav";
import { photoForResidentSlide } from "@/lib/heroPhotos";
import SkinHero, { type SkinHeroSlide } from "@/components/skin/SkinHero";
import ResidentFinder from "@/components/resident/ResidentFinder";
import ResidentBulletin from "@/components/resident/ResidentBulletin";
import ResidentLifeGuide from "@/components/resident/ResidentLifeGuide";
import MyHomeBoard, { type BoardClinics, type BoardOutage, type BoardRoadwork } from "@/components/resident/MyHomeBoard";
import SkinEventsRail from "@/components/skin/SkinEventsRail";
import SkinWeatherCard from "@/components/skin/SkinWeatherCard";
import SkinIcon from "@/components/skin/SkinIcon";
import styles from "@/components/skin/Skin.module.css";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/resident",
  title: "我是大溪人：大溪居民生活資訊",
  description: "大溪居民每天要用的資訊一次看：停水停電、垃圾車即時位置、道路施工、區公所公告、診所輪值、AED 位置與陳情報修管道。",
});

// TodayStats and 我家 both need these; one upstream call per request.
const loadOutages = cache(() => readSource(() => listUpcomingOutages()));
const loadRoadworks = cache(() => readSource(() => fetchDaxiRoadworks()));

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Taipei" });

const FALLBACK_SLIDES = [
  { id: "f-outages", tag: "緊急", title: "停水停電通知", subtitle: "預告中的停水停電整理", href: "/resident/outages" },
  { id: "f-garbage", tag: "一般", title: "垃圾車即時地圖", subtitle: "查看附近的清運車", href: GARBAGE_HREF },
  { id: "f-roadworks", tag: "一般", title: "道路施工地圖", subtitle: "查看今日道路申挖與施工位置", href: "/resident/roadworks" },
];

async function Hero() {
  const [slides, weather] = await Promise.all([
    listActiveResidentSlides().catch(() => []),
    getCachedWeather().catch(() => null),
  ]);
  const source = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const heroSlides: SkinHeroSlide[] = source.slice(0, 5).map((s, i) => ({
    id: s.id,
    tag: s.tag,
    title: s.title,
    subtitle: s.subtitle,
    // Slides saved before the garbage page existed still point at /resident.
    href: "featureKey" in s && s.featureKey === "garbage" ? GARBAGE_HREF : s.href,
    // Chosen by topic (garbage truck for 垃圾車, …), not slide position.
    photo: photoForResidentSlide({ featureKey: "featureKey" in s ? s.featureKey : undefined, href: s.href, title: s.title, subtitle: s.subtitle }, i),
  }));
  return (
    <SkinHero
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
    loadOutages(),
    loadRoadworks(),
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
            <SkinIcon name={item.icon} size={18} />
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

// 我家: everything the board might need, trimmed; the browser picks out the
// resident's own stop, 里 and nearby works from localStorage.
async function MyHome() {
  const [stops, outages, roadworks, clinics] = await Promise.all([
    loadHomeStops(),
    loadOutages(),
    loadRoadworks(),
    getCachedClinics().catch(() => null),
  ]);
  const boardOutages: BoardOutage[] | null = outages.ok
    ? outages.data.map((o) => ({ id: o.id, type: o.type, lowPressure: o.severity === "lowPressure", areas: o.areas, date: o.date, timeRange: o.timeRange }))
    : null;
  const boardWorks: BoardRoadwork[] | null = roadworks.ok
    ? roadworks.data.map((w) => ({ id: w.id, name: w.name, location: w.location, points: w.points.filter((_, i) => i % Math.ceil(w.points.length / 24 || 1) === 0) }))
    : null;
  let boardClinics: BoardClinics | null = null;
  if (clinics && clinics.length > 0) {
    const { day, session } = currentSession();
    const idx = session ? SESSIONS.indexOf(session) : -1;
    const open = idx >= 0 ? clinics.filter((c) => c.schedule[day]?.[idx]) : [];
    boardClinics = {
      session,
      clinics: open.filter((c) => c.category !== "藥局").length,
      pharmacies: open.filter((c) => c.category === "藥局").length,
    };
  }
  return <MyHomeBoard stops={stops} outages={boardOutages} roadworks={boardWorks} clinics={boardClinics} />;
}

async function Bulletin() {
  const posts = await readBulletinPosts().catch(() => []);
  return <ResidentBulletin posts={sortedBulletinPosts(activeBulletinPosts(posts))} />;
}

async function Essentials() {
  const weather = await getCachedWeather().catch(() => null);
  return (
    <div className={styles.essentials}>
      <SkinWeatherCard weather={weather} />

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

export default async function ResidentHome({ searchParams }: PageProps<"/resident">) {
  // Old links (menu bookmarks, app pushes) opened the garbage map as a sheet here.
  if ((await searchParams).open === "garbage") permanentRedirect(GARBAGE_HREF);
  return (
    <main>
      <h1 className="sr-only">我是大溪人：大溪居民生活資訊（停水停電、垃圾車、道路施工、公告、診所與 AED）</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <ResidentFinder />

      <section className={styles.section} aria-label="我家" style={{ paddingTop: 8 }}>
        <Suspense fallback={<BlockSkeleton height={120} />}>
          <MyHome />
        </Suspense>
      </section>

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
          <SkinEventsRail href="/resident/events" />
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
