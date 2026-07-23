// Mock data — 台灣自來水公司/台電目前沒有整合進來的公開 API，這裡先用手動維護
// 的 JSON 頂著，讓「停水停電通知」的介面/資訊架構先能用。要接上真實資料，
// 换掉這個檔案改成打對應機關的開放資料 API 即可，下面的型別/讀取介面不用動。
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "outages.json");

export type OutageType = "water" | "power";

export type Outage = {
  id: string;
  type: OutageType;
  areas: string[];
  date: string; // YYYY-MM-DD
  timeRange: string;
  reason: string;
  source: string;
};

export async function listUpcomingOutages(): Promise<Outage[]> {
  let all: Outage[] = [];
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    all = Array.isArray(parsed) ? (parsed as Outage[]) : [];
  } catch {
    all = [];
  }
  const todayKey = new Date().toISOString().slice(0, 10);
  return all.filter((o) => o.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date));
}
