import Link from "next/link";
import { fetchDaxiAnnouncements } from "@/lib/announcements";
import { listUpcomingOutages, type Outage } from "@/lib/outages";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short" });

const quickLinks = [
  {
    href: "/resident/services#report",
    label: "陳情 / 報修",
    desc: "路燈壞了、道路坑洞怎麼通報",
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
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7.5h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.4h-7a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" />
        <path d="M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
        <path d="M4.5 7.5h15" />
      </svg>
    ),
  },
  {
    href: "/resident/services#links",
    label: "常用連結",
    desc: "戶政／地政／區公所服務",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.2 13.8a3.4 3.4 0 0 0 4.8 0l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8l-1.3 1.3" />
        <path d="M13.8 10.2a3.4 3.4 0 0 0-4.8 0l-2.6 2.6a3.4 3.4 0 0 0 4.8 4.8l1.3-1.3" />
      </svg>
    ),
  },
];

const outageTypeLabel: Record<Outage["type"], string> = { water: "停水", power: "停電" };

async function OutagePreview() {
  const outages = await listUpcomingOutages();
  if (outages.length === 0) {
    return (
      <div className="safe-page-x">
        <div className="rounded-2xl px-4 py-4 border text-[12.5px]" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          目前沒有預告中的停水停電公告
        </div>
      </div>
    );
  }
  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {outages.slice(0, 3).map((o) => (
        <div key={o.id} className="rounded-2xl px-4 py-3.5 border flex items-center gap-3" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <span
            className="shrink-0 text-[10.5px] font-semibold rounded-full px-2.5 py-1"
            style={{
              background: o.type === "water" ? "var(--river-teal-soft)" : "var(--daxi-red-soft)",
              color: o.type === "water" ? "var(--river-teal)" : "var(--daxi-red)",
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
        <div className="rounded-2xl px-4 py-4 border text-[12.5px]" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          公告整理中，稍後再回來看看
        </div>
      </div>
    );
  }
  return (
    <div className="safe-page-x flex flex-col gap-2.5">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl px-4 py-3.5 border transition-opacity active:opacity-70"
          style={{ background: "var(--card)", borderColor: "var(--line)" }}
        >
          <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
            {item.title}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {item.date}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function ResidentHome() {
  const todayLabel = dateFormatter.format(new Date());

  return (
    <div>
      <div
        className="safe-page-x pt-6 pb-5 fade-in"
        style={{
          background: "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: "var(--shadow-float)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px]" style={{ color: "rgba(43,36,32,0.7)" }}>
              {todayLabel}
            </div>
            <div className="text-[18px] font-bold" style={{ color: "var(--block-fg)" }}>
              大溪居民您好
            </div>
          </div>
          <Link
            href="/resident/profile"
            aria-label="我的"
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "rgba(255,255,255,0.2)", color: "var(--block-fg)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8.3" r="3.3" />
              <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
            </svg>
          </Link>
        </div>
        <p className="text-[12px] mt-3" style={{ color: "rgba(43,36,32,0.75)" }}>
          里民服務、區公所公告、停水停電通知，一站看完
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 safe-page-x pt-4 fade-in-delay-1">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-2xl border px-4 py-3.5 transition-opacity active:opacity-70"
            style={{ background: "var(--card)", borderColor: "var(--line)" }}
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
              <span className="w-[18px] h-[18px] block">{q.icon}</span>
            </span>
            <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
              {q.label}
            </div>
            <div className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "var(--ink-soft)" }}>
              {q.desc}
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between safe-page-x mb-2">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--river-teal)" }}>
            停水停電通知
          </div>
          <Link href="/resident/outages" className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
            查看全部
          </Link>
        </div>
        <OutagePreview />
      </div>

      <div className="pt-6 pb-10">
        <div className="flex items-center justify-between safe-page-x mb-2">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--river-teal)" }}>
            區公所公告
          </div>
          <Link href="/resident/announcements" className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
            查看全部
          </Link>
        </div>
        <AnnouncementPreview />
      </div>
    </div>
  );
}
