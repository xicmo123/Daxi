import Link from "next/link";
import { discoverItems } from "@/lib/data";

const stories = [
  { href: "/events", label: "大禧活動", tone: "bordeaux" as const },
  { href: "/parking", label: "停車導航", tone: "cognac" as const },
  { href: "/weather", label: "天氣路況", tone: "bordeaux" as const },
  { href: "/", label: "老街景點", tone: "cognac" as const },
  { href: "/", label: "老街美食", tone: "bordeaux" as const },
];

const stats = [
  { label: "氣溫", value: "32°", unit: "C" },
  { label: "周邊車位", value: "3", unit: "/6 處尚可" },
  { label: "交通管制", value: "2", unit: "則" },
];

export default function Home() {
  return (
    <div className="max-w-md mx-auto">
      <div className="px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <div className="font-serif text-2xl font-semibold tracking-wide">大溪通</div>
          <div className="text-[13px] mt-1" style={{ color: "var(--ink-soft)" }}>
            📍 桃園市大溪區・老街周邊
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-full border flex items-center justify-center"
          style={{ borderColor: "var(--line)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </div>
      </div>

      {/* Story chips */}
      <div className="flex gap-4 px-5 pt-1 pb-2 overflow-x-auto no-scrollbar">
        {stories.map((s, i) => (
          <Link key={i} href={s.href} className="flex flex-col items-center gap-1.5 w-14 shrink-0">
            <span
              className="w-12 h-12 rounded-full border-[1.5px] flex items-center justify-center text-sm"
              style={{
                borderColor: s.tone === "bordeaux" ? "var(--bordeaux)" : "var(--cognac)",
                color: s.tone === "bordeaux" ? "var(--bordeaux)" : "var(--cognac-deep)",
                background: "var(--card)",
              }}
            >
              {s.label.slice(0, 1)}
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
              style={{ background: "var(--cognac-tint)", boxShadow: "0 0 0 3px rgba(241,228,211,0.25)" }}
            />
            遶境進行中
          </div>
          <div className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "#d8b98f" }}>
            2026 大溪大禧
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">關聖帝君聖誕遶境</h3>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#e3d3c2" }}>
            14:00 出巡，路線行經老街全區，沿線交通管制至 21:00。
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2"
            style={{ background: "var(--paper)", color: "var(--bordeaux)" }}
          >
            查看今日時程 →
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2.5 px-5 pt-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl card-shadow p-3"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <div className="text-[11px] mb-1" style={{ color: "var(--ink-soft)" }}>
              {s.label}
            </div>
            <div className="font-serif text-lg font-semibold">
              {s.value}
              <span className="text-[11px] font-sans font-normal ml-0.5" style={{ color: "var(--ink-soft)" }}>
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Discover */}
      <div className="px-5 pt-6 pb-2 flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
            Discover
          </div>
          <h2 className="font-serif text-[17px] font-semibold">順路走走</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-8">
        {discoverItems.map((item) => (
          <div key={item.title} className="rounded-2xl card-shadow overflow-hidden" style={{ background: "var(--card)" }}>
            <div
              className="h-20 flex items-end p-2.5"
              style={{
                background:
                  item.tone === "bordeaux"
                    ? "linear-gradient(150deg, var(--bordeaux-surface), var(--bordeaux-surface-deep))"
                    : "linear-gradient(150deg, var(--cognac-surface), var(--cognac-surface-deep))",
              }}
            >
              <span
                className="text-[10px] text-white rounded-full px-2 py-0.5"
                style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}
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
    </div>
  );
}
