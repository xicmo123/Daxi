import type { DaxiWeather } from "@/lib/cwa";
import styles from "./Skin.module.css";

// The orange 大溪天氣 card from the essentials row (Jeju's weather tile).
export default function SkinWeatherCard({ weather }: { weather: DaxiWeather | null }) {
  return (
    <div className={styles.essCard} data-tone="main">
      <h3>大溪天氣</h3>
      <p>{weather ? weather.description || weather.weatherText : "氣象署資料暫時無法取得"}</p>
      {weather ? (
        <>
          <div className={styles.weatherNow}>
            <span aria-hidden>{weather.currentIcon}</span>
            <b>{Math.round(weather.currentTemp)}°</b>
            <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
              {weather.weatherText}
              <br />
              體感 {Math.round(weather.apparentTemp)}° · 濕度 {weather.humidity}%
            </span>
          </div>
          {weather.hourly.length > 0 ? (
            <div className={styles.weatherHours}>
              {weather.hourly.slice(0, 4).map((h) => (
                <div key={h.hour}>
                  {h.hour}
                  <br />
                  <span aria-hidden>{h.icon}</span> {h.temp}
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
