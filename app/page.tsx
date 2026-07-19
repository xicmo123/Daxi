import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { discoverItems, discoverTagTone, type DiscoverTag } from "@/lib/data";
import { fetchDaxiParking } from "@/lib/tycgParking";
import { getFestivalTiming, findTodaysMilestone } from "@/lib/festivalTiming";
import { fetchDaxiWeather } from "@/lib/cwa";

export const revalidate = 60;

const icon = {
  mask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
    </svg>
  ),
  road: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 21 10.5 3M15 21 13.5 3" />
      <path d="M12 5.5v2.5M12 11v2.5M12 16.5V19" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />
    </svg>
  ),
};

const stories = [
  { href: "/events", label: "大禧活動", tone: "bordeaux" as const, icon: icon.mask },
  { href: "/parking", label: "停車導航", tone: "cognac" as const, icon: icon.parking },
  { href: "/weather", label: "路況", tone: "bordeaux" as const, icon: icon.road },
  { href: "/?cat=景點", label: "老街景點", tone: "cognac" as const, icon: icon.pin },
  { href: "/?cat=美食", label: "老街美食", tone: "bordeaux" as const, icon: icon.food },
];

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const activeCat = cat as DiscoverTag | undefined;
  const filteredDiscover = activeCat ? discoverItems.filter((d) => d.tag === activeCat) : discoverItems;

  const timing = getFestivalTiming();
  const todaysMilestone = findTodaysMilestone();
  const todayLabel = dateFormatter.format(new Date());

  let parkingSummary = "資料載入中";
  try {
    const lots = await fetchDaxiParking();
    const available = lots.filter((l) => l.status !== "full").length;
    parkingSummary = `${available}/${lots.length} 處尚可`;
  } catch {
    parkingSummary = "暫無法取得";
  }

  let weatherChip: { icon: string; temp: number } | null = null;
  try {
    const weather = await fetchDaxiWeather();
    weatherChip = { icon: weather.currentIcon, temp: weather.currentTemp };
  } catch {
    weatherChip = null;
  }

  return (
    <div>
      <PageHeader
        title="大溪通"
        subtitle="📍 桃園市大溪區・老街周邊"
        right={
          <Link
            href="/weather"
            className="flex flex-col items-end gap-0.5 rounded-xl px-2.5 py-1.5"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <span className="text-[11px] font-medium" style={{ color: "var(--ink-soft)" }}>
              {todayLabel}
            </span>
            <span className="text-[13px] font-semibold flex items-center gap-1">
              {weatherChip ? (
                <>
                  <span>{weatherChip.icon}</span>
                  <span className="tabular-nums">{weatherChip.temp}°</span>
                </>
              ) : (
                <span style={{ color: "var(--ink-soft)" }}>—</span>
              )}
            </span>
          </Link>
        }
      />

      {/* Story chips */}
      <div className="flex gap-4 px-5 pt-1 pb-2 overflow-x-auto no-scrollbar">
        {stories.map((s, i) => (
          <Link key={i} href={s.href} className="flex flex-col items-center gap-1.5 w-14 shrink-0">
            <span
              className="w-12 h-12 rounded-full border-[1.5px] flex items-center justify-center p-3"
              style={{
                borderColor: s.tone === "bordeaux" ? "var(--bordeaux)" : "var(--cognac)",
                color: s.tone === "bordeaux" ? "var(--bordeaux)" : "var(--cognac-deep)",
                background: "var(--card)",
              }}
            >
              {s.icon}
            </span>
            <span className="text-[10px] text-center" style={{ color: "var(--ink-soft)" }}>
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Hero card */}
      <div className="px-5 pt-3">
        <div
          className="rounded-[22px] card-shadow overflow-hidden p-5"
          style={{
            background:
              "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 60%, #241010 100%)",
            color: "#f4ece2",
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 mb-3"
            style={{ background: "rgba(244,236,226,0.14)", border: "1px solid rgba(244,236,226,0.3)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={
                todaysMilestone
                  ? { background: "var(--cognac-tint)", boxShadow: "0 0 0 3px rgba(241,228,211,0.25)" }
                  : { background: "rgba(241,228,211,0.5)" }
              }
            />
            {todaysMilestone ? `今日登場・${todaysMilestone.title}` : `活動期間・第 ${timing.dayIndex}/${timing.totalDays} 天`}
          </div>
          <div className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "#d8b98f" }}>
            2026 大溪大禧・聲聲不息
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">
            {todaysMilestone ? todaysMilestone.title : "北管、社頭文化系列展演"}
          </h3>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#e3d3c2" }}>
            {todaysMilestone
              ? todaysMilestone.desc
              : `距 8/6 遶境隨香「社頭隨香四部曲」還有 ${timing.daysToProcession} 天，期間系列展演陸續登場。`}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2"
            style={{ background: "var(--paper)", color: "var(--bordeaux)" }}
          >
            查看完整時程 →
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5 px-5 pt-4">
        <div
          className="rounded-2xl card-shadow p-3"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="text-[11px] mb-1" style={{ color: "var(--ink-soft)" }}>
            大溪區公有停車場
          </div>
          <div className="font-serif text-lg font-semibold">{parkingSummary}</div>
        </div>
        <div
          className="rounded-2xl card-shadow p-3"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="text-[11px] mb-1" style={{ color: "var(--ink-soft)" }}>
            距遶境隨香
          </div>
          <div className="font-serif text-lg font-semibold">
            {timing.daysToProcession}
            <span className="text-[11px] font-sans font-normal ml-0.5" style={{ color: "var(--ink-soft)" }}>
              天（8/6）
            </span>
          </div>
        </div>
      </div>

      {/* Discover */}
      <div id="discover" className="px-5 pt-6 pb-2 flex items-baseline justify-between scroll-mt-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
            Discover
          </div>
          <h2 className="font-serif text-[17px] font-semibold">順路走走</h2>
        </div>
        {activeCat ? (
          <Link href="/#discover" className="text-[12px] underline" style={{ color: "var(--ink-soft)" }}>
            顯示全部
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-3">
        {filteredDiscover.map((item) => (
          <div key={item.title} className="rounded-2xl card-shadow overflow-hidden" style={{ background: "var(--card)" }}>
            <div className="relative h-28">
              <Image
                src={item.photo.src}
                alt={item.title}
                fill
                sizes="(max-width: 448px) 50vw, 220px"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }}
              />
              <span
                className="absolute left-2.5 bottom-2.5 text-[10px] text-white rounded-full px-2 py-0.5"
                style={{
                  background:
                    discoverTagTone[item.tag] === "bordeaux" ? "var(--bordeaux)" : "var(--cognac-deep)",
                }}
              >
                {item.tag}
              </span>
            </div>
            <div className="p-3">
              <h4 className="font-serif text-[14px] font-semibold mb-1">{item.title}</h4>
              <p className="text-[11.5px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-8 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        景點圖片來源：Wikimedia Commons（CC BY-SA），攝影：
        {filteredDiscover.map((item, i) => (
          <span key={item.title}>
            {i > 0 ? "、" : " "}
            <a href={item.photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {item.title} - {item.photo.author}
            </a>
          </span>
        ))}
      </div>
    </div>
  );
}
