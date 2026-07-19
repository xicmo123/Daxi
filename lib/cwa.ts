// 中央氣象署(CWA)開放資料平台 — F-D0047-005「桃園市未來3天天氣預報」，
// 逐鄉鎮區 3 小時/逐小時預報。需要 CWA_API_KEY (格式 CWA-XXXXXXXX-...)。
const DATASET_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-005";

type ElementValue = Record<string, string>;
type TimePoint = {
  DataTime?: string;
  StartTime?: string;
  EndTime?: string;
  ElementValue: ElementValue[];
};
type WeatherElement = { ElementName: string; Time: TimePoint[] };
type Location = { LocationName: string; WeatherElement: WeatherElement[] };

export type HourCard = { hour: string; temp: string; icon: string };

export type DaxiWeather = {
  currentTemp: number;
  apparentTemp: number;
  humidity: number;
  weatherText: string;
  currentIcon: string;
  description: string;
  hourly: HourCard[];
};

// CWA's forecast text doesn't distinguish day/night, so pass the target hour
// to swap the sun for a moon after dark.
function weatherEmoji(text: string, hour: number): string {
  const isNight = hour < 6 || hour >= 18;
  if (text.includes("雷")) return "⛈️";
  if (text.includes("雨")) return "🌦️";
  if (text.includes("陰")) return "☁️";
  if (text.includes("多雲")) return isNight ? "🌙" : "⛅";
  if (text.includes("晴")) return isNight ? "🌙" : "☀️";
  return "🌤️";
}

function findElement(loc: Location, name: string) {
  const el = loc.WeatherElement.find((e) => e.ElementName === name);
  if (!el) throw new Error(`CWA element missing: ${name}`);
  return el;
}

function valueAt(el: WeatherElement, index: number, key: string): string {
  const point = el.Time[index];
  const value = point?.ElementValue?.[0]?.[key];
  if (value === undefined) throw new Error(`CWA value missing at index ${index} for ${key}`);
  return value;
}

function blockCovering(el: WeatherElement, date: Date) {
  return el.Time.find((t) => {
    if (!t.StartTime || !t.EndTime) return false;
    return new Date(t.StartTime) <= date && date < new Date(t.EndTime);
  });
}

export async function fetchDaxiWeather(): Promise<DaxiWeather> {
  const apiKey = process.env.CWA_API_KEY;
  if (!apiKey) throw new Error("CWA_API_KEY is not set");

  const url = `${DATASET_URL}?Authorization=${apiKey}&LocationName=${encodeURIComponent("大溪區")}&format=JSON`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CWA API responded ${res.status}`);

  const json = await res.json();
  const loc: Location | undefined = json?.records?.Locations?.[0]?.Location?.[0];
  if (!loc) throw new Error("CWA response missing location data");

  const temperature = findElement(loc, "溫度");
  const apparent = findElement(loc, "體感溫度");
  const humidity = findElement(loc, "相對濕度");
  const weatherPhenom = findElement(loc, "天氣現象");
  const summary = findElement(loc, "天氣預報綜合描述");

  const now = new Date();
  const currentBlock = blockCovering(weatherPhenom, now);
  const summaryBlock = blockCovering(summary, now);

  const hourly: HourCard[] = [3, 6, 9].map((offset) => {
    const target = new Date(now.getTime() + offset * 60 * 60 * 1000);
    const idx = temperature.Time.findIndex((t) => t.DataTime && new Date(t.DataTime) >= target);
    const safeIdx = idx === -1 ? temperature.Time.length - 1 : idx;
    const temp = valueAt(temperature, safeIdx, "Temperature");
    const block = blockCovering(weatherPhenom, target) ?? weatherPhenom.Time[weatherPhenom.Time.length - 1];
    const weatherText = block?.ElementValue?.[0]?.Weather ?? "";
    return {
      hour: `${target.getHours()}時`,
      temp: `${temp}°`,
      icon: weatherEmoji(weatherText, target.getHours()),
    };
  });

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowTemps = temperature.Time.filter((t) => {
    if (!t.DataTime) return false;
    const d = new Date(t.DataTime);
    return d >= now && d.getTime() <= tomorrow.getTime() + 12 * 60 * 60 * 1000;
  })
    .map((t) => Number(t.ElementValue[0].Temperature))
    .filter((n) => !Number.isNaN(n));
  const tomorrowBlock = blockCovering(weatherPhenom, tomorrow) ?? weatherPhenom.Time[weatherPhenom.Time.length - 1];
  hourly.push({
    hour: "明日",
    temp: tomorrowTemps.length ? `${Math.min(...tomorrowTemps)}–${Math.max(...tomorrowTemps)}°` : "—",
    icon: weatherEmoji(tomorrowBlock?.ElementValue?.[0]?.Weather ?? "", 12),
  });

  const currentWeatherText = currentBlock?.ElementValue?.[0]?.Weather ?? "";

  return {
    currentTemp: Number(valueAt(temperature, 0, "Temperature")),
    apparentTemp: Number(valueAt(apparent, 0, "ApparentTemperature")),
    humidity: Number(valueAt(humidity, 0, "RelativeHumidity")),
    weatherText: currentWeatherText,
    currentIcon: weatherEmoji(currentWeatherText, now.getHours()),
    description: summaryBlock?.ElementValue?.[0]?.WeatherDescription ?? "",
    hourly,
  };
}
