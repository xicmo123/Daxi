import { Suspense } from "react";
import { fetchDaxiAnnouncements } from "@/lib/announcements";
import { listUpcomingOutages } from "@/lib/outages";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { activeBulletinPosts, readBulletinPosts, sortedBulletinPosts } from "@/lib/bulletinData";
import CommunityBulletin from "@/components/CommunityBulletin";
import ResidentHomeHero from "@/components/ResidentHomeHero";
import ResidentQuickLinks from "@/components/ResidentQuickLinks";
import ResidentStatusButtons, { type StatusButton } from "@/components/ResidentStatusButtons";

export const dynamic = "force-dynamic";

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
    href: "/resident/services#garbage",
    label: "垃圾清運",
    desc: "清運時間與資源回收",
    block: "moss",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7.5h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.4h-7a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" />
        <path d="M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
        <path d="M4.5 7.5h15" />
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
    href: "/resident/bus",
    label: "客運資訊",
    desc: "周邊即時公車位置與時刻",
    block: "river",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="13" rx="3" />
        <path d="M5 13.5h14M8.5 17v2.2M15.5 17v2.2" />
        <circle cx="8.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
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
  let outageCount = 0;
  let roadworkCount = 0;
  let announcementCount = 0;

  try {
    outageCount = (await listUpcomingOutages()).length;
  } catch {
    outageCount = 0;
  }
  try {
    roadworkCount = (await fetchDaxiRoadworks()).length;
  } catch {
    roadworkCount = 0;
  }
  try {
    const items = await fetchDaxiAnnouncements(10);
    announcementCount = items.length;
  } catch {
    announcementCount = 0;
  }

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
      <div className="grid grid-cols-3 rounded-2xl overflow-hidden" style={{ background: "var(--card)", boxShadow: "var(--shadow-float)" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[78px] skeleton" style={i > 0 ? { background: "var(--line)", borderLeft: "1px solid var(--line)" } : { background: "var(--line)" }} />
        ))}
      </div>
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

      <div className="relative z-10 -mt-9">
        <Suspense fallback={<TodayStatusSkeleton />}>
          <TodayStatusRow />
        </Suspense>
      </div>

      <div className="pt-6 fade-in-delay-1">
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

      <ResidentQuickLinks links={quickLinks} />

      <div className="pb-10" />
    </div>
  );
}
