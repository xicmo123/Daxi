import PageHeader from "@/components/PageHeader";
import LiveCams from "@/components/LiveCams";
import { trafficAlerts } from "@/lib/data";
import { fetchDaxiWeather, type DaxiWeather } from "@/lib/cwa";

export const revalidate = 600;

const alertDot: Record<string, string> = {
  block: "var(--bordeaux)",
  warn: "var(--cognac-deep)",
  info: "var(--cognac)",
};

export default async function WeatherPage() {
  let weather: DaxiWeather | null = null;
  try {
    weather = await fetchDaxiWeather();
  } catch {
    weather = null;
  }

  return (
    <div className="pt-2">
      <PageHeader title="天氣路況" subtitle="大溪區" />

      {!weather ? (
        <div className="px-5 pb-3">
          <div
            className="rounded-2xl p-3.5 text-[12.5px] leading-relaxed"
            style={{ background: "var(--bordeaux-tint)", color: "var(--bordeaux)" }}
          >
            目前無法連線至中央氣象署資料，請稍後重新整理頁面。
          </div>
        </div>
      ) : null}

      <div className="px-5">
        <div
          className="rounded-2xl card-shadow p-5"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <div className="font-serif text-4xl font-semibold leading-none">
            {weather ? `${weather.currentTemp}°` : "—"}
          </div>
          <div className="text-[13px] mt-1.5" style={{ color: "var(--ink-soft)" }}>
            {weather
              ? `${weather.weatherText}・體感 ${weather.apparentTemp}°・濕度 ${weather.humidity}%`
              : "資料暫時無法取得"}
          </div>
          {weather?.description ? (
            <div className="text-[12px] mt-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {weather.description}
            </div>
          ) : null}
        </div>
      </div>

      {weather ? (
        <div className="grid grid-cols-4 gap-2.5 px-5 pt-3">
          {weather.hourly.map((h) => (
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
      ) : null}

      <div className="px-5 pt-6 pb-3">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--cognac-deep)" }}>
          Live
        </div>
        <h2 className="font-serif text-[17px] font-semibold">即時影像</h2>
      </div>
      <LiveCams />

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
        天氣資料來源：中央氣象署開放資料平台（F-D0047-005，每 10 分鐘更新）。逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。
      </div>
    </div>
  );
}
