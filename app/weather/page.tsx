import PageHeader from "@/components/PageHeader";
import { hourlyForecast, trafficAlerts, weatherIsMock } from "@/lib/data";

const alertDot: Record<string, string> = {
  block: "var(--bordeaux)",
  warn: "var(--cognac-deep)",
  info: "var(--cognac)",
};

export default function WeatherPage() {
  return (
    <div className="max-w-md mx-auto pt-2">
      <PageHeader title="天氣路況" subtitle="大溪區" />

      {weatherIsMock ? (
        <div className="px-5 pb-3">
          <div
            className="rounded-2xl p-3.5 text-[12.5px] leading-relaxed"
            style={{ background: "var(--cognac-tint)", color: "var(--cognac-deep)" }}
          >
            天氣數值為示意資料，尚未串接中央氣象署 API。
          </div>
        </div>
      ) : null}

      <div className="px-5">
        <div
          className="rounded-2xl card-shadow p-5"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="font-serif text-4xl font-semibold leading-none">32°</div>
          <div className="text-[13px] mt-1.5" style={{ color: "var(--ink-soft)" }}>
            午後雷陣雨・體感 35°・濕度 68%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 px-5 pt-3">
        {hourlyForecast.map((h) => (
          <div
            key={h.hour}
            className="rounded-2xl card-shadow text-center p-2.5"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              {h.hour}
            </div>
            <div className="text-[13px] font-semibold my-1">{h.temp}</div>
            <div className="text-base leading-none">{h.icon}</div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-6 pb-3">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
          Alerts
        </div>
        <h2 className="font-serif text-[17px] font-semibold">交通管制公告</h2>
      </div>
      <div className="px-5 flex flex-col gap-3">
        {trafficAlerts.map((a) => (
          <div
            key={a.title}
            className="rounded-2xl card-shadow p-4 flex gap-3"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: alertDot[a.level] }} />
            <div>
              <div className="text-[13.5px] font-semibold mb-0.5">{a.title}</div>
              <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                {a.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pt-3 pb-8 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。天氣資料串接中央氣象署開放資料平台需另申請 API 金鑰。
      </div>
    </div>
  );
}
