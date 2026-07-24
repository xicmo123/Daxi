import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchDaxiAnnouncements } from "@/lib/announcements";
import { listUpcomingOutages, type Outage } from "@/lib/outages";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { listActiveResidentSlides } from "@/lib/residentCarousel";
import ResidentCarousel from "@/components/ResidentCarousel";
import ResidentLinksCard from "@/components/ResidentLinksCard";
import ResidentAnnouncementPreview from "@/components/ResidentAnnouncementPreview";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short" });

type Block = "wood" | "moss" | "river" | "red";

const blockColor: Record<Block, string> = {
  wood: "var(--block-wood)",
  moss: "var(--block-moss)",
  river: "var(--block-river)",
  red: "var(--daxi-red)",
};

// Vivid gradient card treatment — the same "135deg light→deep" pairing
// used by the tourist/resident identity-gate cards — plus the text color
// that reads best on each (the pastel wood/moss/river tones need dark
// ink; the darker daxi-red gradient needs white).
const gradientCard: Record<Block, { background: string; fg: string; fgSoft: string }> = {
  wood: {
    background: "linear-gradient(135deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  moss: {
    background: "linear-gradient(135deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  river: {
    background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
    fg: "var(--block-fg)",
    fgSoft: "rgba(43,36,32,0.72)",
  },
  red: {
    background: "linear-gradient(135deg, var(--daxi-red) 0%, color-mix(in srgb, var(--daxi-red) 100%, black 28%) 100%)",
    fg: "#fff",
    fgSoft: "rgba(255,255,255,0.82)",
  },
};

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
    desc: "今日施工與申挖位置",
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
];

const linksIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.2 13.8a3.4 3.4 0 0 0 4.8 0l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8l-1.3 1.3" />
    <path d="M13.8 10.2a3.4 3.4 0 0 0-4.8 0l-2.6 2.6a3.4 3.4 0 0 0 4.8 4.8l1.3-1.3" />
  </svg>
);

const outageTypeLabel: Record<Outage["type"], string> = { water: "停水", power: "停電" };

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
    announcementCount = items.filter((item) => Date.now() - item.publishedAt < 7 * 24 * 60 * 60 * 1000).length;
  } catch {
    announcementCount = 0;
  }

  const items: Array<{ href: string; label: string; value: string; block: Block }> = [
    {
      href: "/resident/outages",
      label: "停水停電",
      value: outageCount > 0 ? `${outageCount} 筆預告` : "目前正常",
      block: "red",
    },
    {
      href: "/resident/roadworks",
      label: "道路施工",
      value: roadworkCount > 0 ? `${roadworkCount} 處管制` : "今日暢通",
      block: "river",
    },
    {
      href: "/resident/announcements",
      label: "區公所公告",
      value: announcementCount > 0 ? `${announcementCount} 則新公告` : "本週無新公告",
      block: "moss",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 safe-page-x pt-4 fade-in-delay-1">
      {items.map((item) => {
        const card = gradientCard[item.block];
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative overflow-hidden rounded-xl px-3 py-3 transition-transform active:scale-[0.97]"
            style={{ background: card.background, boxShadow: "var(--shadow-card)" }}
          >
            <div className="text-[10.5px] font-bold mb-1" style={{ color: card.fgSoft }}>
              {item.label}
            </div>
            <div className="text-[12px] leading-snug line-clamp-2 font-bold" style={{ color: card.fg }}>
              {item.value}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function TodayStatusSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 safe-page-x pt-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[62px] rounded-xl skeleton" style={{ background: "var(--line)" }} />
      ))}
    </div>
  );
}

async function OutagePreview() {
  const outages = await listUpcomingOutages();
  if (outages.length === 0) {
    return (
      <div className="safe-page-x">
        <div
          className="rounded-2xl px-4 py-4 flex items-center justify-between gap-3"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
        >
          <span className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            目前沒有預告中的停水停電公告
          </span>
          <Link
            href="/resident/services#emergency"
            className="shrink-0 text-[11.5px] font-semibold whitespace-nowrap transition-opacity active:opacity-70"
            style={{ color: "var(--daxi-red)" }}
          >
            緊急聯絡 →
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {outages.slice(0, 3).map((o) => {
        const accent = o.type === "water" ? "var(--river-teal)" : "var(--daxi-red)";
        return (
          <div
            key={o.id}
            className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
            style={{
              background: "var(--card)",
              boxShadow: "var(--shadow-card)",
              borderLeft: `4px solid ${accent}`,
            }}
          >
            <span
              className="shrink-0 text-[10.5px] font-semibold rounded-full px-2.5 py-1"
              style={{
                background: o.type === "water" ? "var(--river-teal-soft)" : "var(--daxi-red-soft)",
                color: accent,
              }}
            >
              {outageTypeLabel[o.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                {o.areas.join("、")}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {o.date}・{o.timeRange}
              </div>
            </div>
          </div>
        );
      })}
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

async function AnnouncementPreview() {
  let items: Awaited<ReturnType<typeof fetchDaxiAnnouncements>> = [];
  try {
    items = await fetchDaxiAnnouncements(3);
  } catch {
    items = [];
  }
  if (items.length === 0) {
    return (
      <div className="safe-page-x">
        <div
          className="rounded-2xl px-4 py-4 flex items-center justify-between gap-3"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
        >
          <span className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            公告整理中，稍後再回來看看
          </span>
          <Link
            href="/resident/services#report"
            className="shrink-0 text-[11.5px] font-semibold whitespace-nowrap transition-opacity active:opacity-70"
            style={{ color: "var(--block-wood-deep)" }}
          >
            我要陳情 →
          </Link>
        </div>
      </div>
    );
  }
  return <ResidentAnnouncementPreview items={items} />;
}

async function AnnouncementCarousel() {
  const slides = await listActiveResidentSlides();
  return <ResidentCarousel slides={slides} />;
}

export default function ResidentHome() {
  const todayLabel = dateFormatter.format(new Date());

  return (
    <div>
      <div
        className="relative safe-page-x pt-6 pb-6 fade-in overflow-hidden"
        style={{
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          boxShadow: "var(--shadow-float)",
        }}
      >
        <Image
          src="/images/daxi-bridge.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ zIndex: 0 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(93,134,167,0.5) 0%, rgba(35,45,56,0.85) 100%)",
            zIndex: 1,
          }}
          aria-hidden
        />
        <div className="relative" style={{ zIndex: 2 }}>
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wide"
              style={{ background: "var(--block-wood)", color: "var(--block-fg)" }}
            >
              大溪人限定
            </span>
            <Link
              href="/resident/profile"
              aria-label="我的"
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
              style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8.3" r="3.3" />
                <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
              </svg>
            </Link>
          </div>
          <div className="text-[13px] mt-3" style={{ color: "rgba(255,255,255,0.8)" }}>
            {todayLabel}
          </div>
          <div className="font-serif text-[24px] font-bold leading-tight" style={{ color: "#fff" }}>
            大溪居民您好 👋
          </div>
          <p className="text-[12.5px] mt-2" style={{ color: "rgba(255,255,255,0.88)" }}>
            里民服務、區公所公告、停水停電通知，一站看完
          </p>
        </div>
      </div>

      <Suspense fallback={<TodayStatusSkeleton />}>
        <TodayStatusRow />
      </Suspense>

      <AnnouncementCarousel />

      <div className="grid grid-cols-2 gap-3 safe-page-x pt-5 fade-in-delay-1">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="relative overflow-hidden rounded-2xl px-4 py-4 transition-opacity active:opacity-70"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
          >
            <span className="absolute inset-x-4 top-0 h-1 rounded-b-full" style={{ background: blockColor[q.block] }} aria-hidden />
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-2.5"
              style={{ background: blockColor[q.block], color: "#fff" }}
            >
              <span className="w-[19px] h-[19px] block">{q.icon}</span>
            </span>
            <div className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
              {q.label}
            </div>
            <div className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "var(--ink-soft)" }}>
              {q.desc}
            </div>
          </Link>
        ))}
        <ResidentLinksCard icon={linksIcon} block={blockColor.wood} />
      </div>

      <div className="pt-7">
        <div className="flex items-center justify-between safe-page-x mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--daxi-red)" }} aria-hidden />
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--daxi-red)" }}>
              停水停電通知
            </div>
          </div>
          <Link href="/resident/outages" className="text-[11.5px] font-medium" style={{ color: "var(--ink-soft)" }}>
            查看全部
          </Link>
        </div>
        <Suspense fallback={<ListSkeleton />}>
          <OutagePreview />
        </Suspense>
      </div>

      <div className="pt-7 pb-10">
        <div className="flex items-center justify-between safe-page-x mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--block-wood-deep)" }} aria-hidden />
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
              區公所公告
            </div>
          </div>
          <Link href="/resident/announcements" className="text-[11.5px] font-medium" style={{ color: "var(--ink-soft)" }}>
            查看全部
          </Link>
        </div>
        <Suspense fallback={<ListSkeleton />}>
          <AnnouncementPreview />
        </Suspense>
      </div>
    </div>
  );
}
