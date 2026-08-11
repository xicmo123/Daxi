import { Suspense } from "react";
import type { Metadata } from "next";
import { readSource } from "@/lib/fetchWithTimeout";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedAnnouncements } from "@/lib/cachedSources";
import { listUpcomingOutages } from "@/lib/outages";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { activeBulletinPosts, readBulletinPosts, sortedBulletinPosts } from "@/lib/bulletinData";
import CommunityBulletin from "@/components/CommunityBulletin";
import ResidentHomeHero from "@/components/ResidentHomeHero";
import ResidentPriorityActions from "@/components/ResidentPriorityActions";
import ResidentQuickLinks from "@/components/ResidentQuickLinks";
import ResidentStatusButtons, { type StatusButton } from "@/components/ResidentStatusButtons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "大溪人生活資訊",
  description: "大溪居民每天要用的資訊：停水停電、道路施工、區公所公告、垃圾清運、診所輪值、AED 位置與陳情報修管道。",
  alternates: { canonical: "/resident" },
  openGraph: {
    title: "大溪人生活資訊 ｜ 大溪通",
    description: "停水停電、道路施工、垃圾清運、診所輪值與陳情報修。",
    url: "/resident",
  },
};

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short" });

type Block = "wood" | "moss" | "river" | "red";

const quickLinks: Array<{ href: string; label: string; desc: string; block: Block; icon: React.ReactNode }> = [
  {
    href: "/resident/services#report",
    label: "陳情 / 報修",
    desc: "路燈壞了、道路坑洞怎麼通報",
    block: "wood",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 12c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5c-1.2 0-2.3-.3-3.3-.8L4.5 20l1.3-3.7C5 15.1 4.5 13.6 4.5 12Z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
  },
  {
    href: "/resident/services#emergency",
    label: "緊急聯絡",
    desc: "警消／衛生所／市民專線",
    block: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z" />
      </svg>
    ),
  },
  {
    href: "/resident/roadworks",
    label: "道路施工",
    desc: "目前施工與申挖位置",
    block: "river",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19h14" />
        <path d="M7.5 19 10 7h4l2.5 12" />
        <path d="M9 12h6" />
        <path d="M8.2 15.5h7.6" />
      </svg>
    ),
  },
  {
    href: "/resident/events",
    label: "在地活動",
    desc: "大溪大禧與老街周邊活動",
    block: "moss",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4.5h12v15H6z" />
        <path d="M9 3v3M15 3v3M6 9.5h12" />
      </svg>
    ),
  },
  {
    href: "/resident/clinics",
    label: "醫療輪值",
    desc: "現在有開的診所與藥局",
    block: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5v15M4.5 12h15" />
        <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      </svg>
    ),
  },
  {
    href: "/resident/aed",
    label: "尋找ＡＥＤ",
    desc: "找到最近的自動體外心臟電擊去顫器",
    block: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3 5.5 13.5h4.8L11 21l7.5-10.5h-4.8L13 3Z" />
      </svg>
    ),
  },
];

async function TodayStatusRow() {
  // Each source is read independently and a failure yields null, not 0 — the
  // row can then draw "—" for "we don't know" instead of claiming there are no
  // outages when 台水/台電 simply didn't answer. Run in parallel so one slow
  // upstream doesn't serialise behind the others.
  const [outages, roadworks, announcements] = await Promise.all([
    readSource(() => listUpcomingOutages()),
    readSource(() => fetchDaxiRoadworks()),
    readSource(() => getCachedAnnouncements(10)),
  ]);

  const outageCount = outages.ok ? outages.data.length : null;
  const roadworkCount = roadworks.ok ? roadworks.data.length : null;
  const announcementCount = announcements.ok ? announcements.data.length : null;

  const items: StatusButton[] = [
    {
      href: "/resident/outages",
      label: "停水停電",
      block: "red",
      count: outageCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 3 5.5 13.5h4.8L11 21l7.5-10.5h-4.8L13 3Z" />
        </svg>
      ),
    },
    {
      href: "/resident/roadworks",
      label: "道路施工",
      block: "river",
      count: roadworkCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19h14" />
          <path d="M7.5 19 10 7h4l2.5 12" />
          <path d="M9 12h6" />
          <path d="M8.2 15.5h7.6" />
        </svg>
      ),
    },
    {
      href: "/resident/announcements",
      label: "區公所公告",
      block: "moss",
      count: announcementCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4" />
          <path d="M4.8 20.2h14.4" />
          <path d="M9.2 8h5.6" />
          <path d="M9.2 11.2h5.6" />
          <path d="M9.2 14.4h3.4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fade-in-delay-1">
      <ResidentStatusButtons items={items} />
    </div>
  );
}

function TodayStatusSkeleton() {
  return (
    <div className="safe-page-x">
      <div className="h-[58px] rounded-2xl skeleton" style={{ background: "var(--line)", boxShadow: "var(--shadow-card)" }} />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {[0, 1].map((i) => (
        <div key={i} className="h-[64px] rounded-2xl skeleton" style={{ background: "var(--line)" }} />
      ))}
    </div>
  );
}

async function Bulletin() {
  const posts = await readBulletinPosts();
  return <CommunityBulletin posts={sortedBulletinPosts(activeBulletinPosts(posts))} />;
}

export default function ResidentHome() {
  const todayLabel = dateFormatter.format(new Date());

  return (
    <div>
      <ResidentHomeHero todayLabel={todayLabel} />

      <div className="pt-1 fade-in-delay-1">
        <div className="flex items-center gap-1.5 safe-page-x mb-2.5">
          <span aria-hidden>📋</span>
          <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
            社區佈告欄
          </div>
        </div>
        <Suspense fallback={<ListSkeleton />}>
          <Bulletin />
        </Suspense>
      </div>

      <div className="pt-3">
        <Suspense fallback={<TodayStatusSkeleton />}>
          <TodayStatusRow />
        </Suspense>
      </div>

      <ResidentPriorityActions />

      <ResidentQuickLinks links={quickLinks} />

      <div className="pb-10" />
    </div>
  );
}
