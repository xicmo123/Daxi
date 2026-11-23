import type { DaxiWeather } from "@/lib/cwa";

export default function WeatherOverview({ weather }: { weather: DaxiWeather | null }) {
  if (!weather) {
    return (
      <section className="safe-page-x page-after-header pb-5" aria-labelledby="weather-title">
        <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <h2 id="weather-title" className="text-app-heading font-bold" style={{ color: "var(--ink)" }}>大溪天氣</h2>
          <p className="mt-1 text-app-label" style={{ color: "var(--ink-soft)" }}>天氣資料來源暫時無回應，請稍後再試。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="safe-page-x page-after-header pb-5" aria-labelledby="weather-title">
      <div className="rounded-2xl p-4" style={{ background: "var(--rj-main, var(--block-river))", color: "var(--rj-on-main, var(--block-fg))", borderRadius: 20 }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-app-label font-bold" style={{ color: "var(--block-fg-soft)" }}>大溪天氣</div>
            <h2 id="weather-title" className="mt-1 text-app-display font-black leading-none">{weather.currentIcon} {weather.currentTemp}°</h2>
            <p className="mt-1 text-app-body font-medium">{weather.weatherText}</p>
          </div>
          <div className="text-right text-app-label" style={{ color: "var(--block-fg-soft)" }}>
            <div>體感 {weather.apparentTemp}°</div>
            <div>濕度 {weather.humidity}%</div>
          </div>
        </div>
        <p className="mt-3 text-app-label leading-relaxed" style={{ color: "var(--block-fg-soft)" }}>{weather.description}</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {weather.hourly.map((hour) => (
            <div key={hour.hour} className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(255,255,255,0.18)" }}>
              <div className="text-app-label font-bold">{hour.hour}</div>
              <div className="mt-1 text-app-body">{hour.icon} {hour.temp}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
