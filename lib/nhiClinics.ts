// 大溪區 clinics and pharmacies from the National Health Insurance
// Administration's open data (健保署「健保特約醫事機構」, updated daily).
// Each listing carries the weekly 固定看診時段 as text — 「星期一上午看診、
// 星期一下午休診、…」 — in three sessions a day, not clock times, so "open now"
// is worked out against typical session hours and the page says so.
//
// Sources (data.gov.tw datasets 39283, 39284, 39291):
//   D21004-009 健保特約醫事機構-診所
//   D21005-001 健保特約醫事機構-藥局
//   D21006-001 特約院所固定服務時段 — only its free-text 看診備註 is used here
import { parseCsv } from "./csv";
import { fetchWithTimeout } from "./fetchWithTimeout";

const NHI_DATASET = "https://info.nhi.gov.tw/api/iode0000s01/Dataset?rId=";
const CLINICS_RID = "A21030000I-D21004-009";
const PHARMACIES_RID = "A21030000I-D21005-001";
const SERVICE_HOURS_RID = "A21030000I-D21006-001";
const DAXI = "桃園市大溪區";
// The clinic file is ~16MB; the government server takes a few seconds.
const DOWNLOAD_TIMEOUT_MS = 60_000;

export type ClinicCategory = "西醫" | "牙醫" | "中醫" | "藥局";
export const CLINIC_CATEGORIES: ClinicCategory[] = ["西醫", "牙醫", "中醫", "藥局"];

export type Session = "上午" | "下午" | "晚上";
export const SESSIONS: Session[] = ["上午", "下午", "晚上"];

export type NhiClinic = {
  code: string;
  name: string;
  category: ClinicCategory;
  kind: string; // 醫事機構種類 as published, e.g. 牙醫一般診所
  phone: string | null;
  address: string;
  departments: string[];
  /** schedule[day][session] — day 0 = Sunday, matching Date#getDay(). */
  schedule: boolean[][];
  remark: string | null;
};

const DAY_INDEX: Record<string, number> = { 日: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };

function toHalfWidth(value: string): string {
  return value.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/　/g, " ");
}

export function parseSchedule(text: string): boolean[][] {
  const schedule = Array.from({ length: 7 }, () => [false, false, false]);
  for (const m of text.matchAll(/星期([日一二三四五六])(上午|下午|晚上)(看診|休診)/g)) {
    schedule[DAY_INDEX[m[1]]][SESSIONS.indexOf(m[2] as Session)] = m[3] === "看診";
  }
  return schedule;
}

// Pharmacies come from their own file, where 種類 is 藥師自營/藥劑生自營.
function categoryOf(kind: string, name: string): ClinicCategory {
  if (kind.includes("牙醫") || name.includes("牙醫")) return "牙醫";
  if (kind.includes("中醫")) return "中醫";
  return "西醫";
}

async function downloadCsv(rid: string): Promise<Record<string, string>[]> {
  const res = await fetchWithTimeout(`${NHI_DATASET}${rid}`, { cache: "no-store" }, DOWNLOAD_TIMEOUT_MS);
  if (!res.ok) throw new Error(`NHI dataset ${rid} failed: ${res.status}`);
  const text = (await res.text()).replace(/^﻿/, "");
  // Keep the header plus rows mentioning 大溪 before the full parse: the
  // clinic file is national and only ~0.3% of it is ours. No field in these
  // files spans lines, so a line filter is safe.
  const lines = text.split(/\r?\n/);
  const header = lines[0] ?? "";
  const kept = [header, ...lines.slice(1).filter((l) => l.includes("大溪"))].join("\n");
  const [headers = [], ...rows] = parseCsv(kept);
  return rows.map((row) => Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] ?? "").trim()])));
}

function todayStamp(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(now).replaceAll("-", "");
}

export async function fetchDaxiClinics(): Promise<NhiClinic[]> {
  const [clinics, pharmacies, hours] = await Promise.all([
    downloadCsv(CLINICS_RID),
    downloadCsv(PHARMACIES_RID),
    // Remarks are a nice-to-have; the list still works without them.
    downloadCsv(SERVICE_HOURS_RID).catch(() => []),
  ]);
  const remarks = new Map(hours.map((r) => [r["醫事機構代碼"], r["看診備註"]]));
  const today = todayStamp();

  const list = [...clinics, ...pharmacies.map((r): Record<string, string> => ({ ...r, pharmacy: "1" }))]
    .filter((r) => toHalfWidth(r["地址"] ?? "").includes(DAXI))
    // 終止合約或歇業日期 is the contract end date; a past one means closed.
    .filter((r) => !/^\d{8}$/.test(r["終止合約或歇業日期"] ?? "") || r["終止合約或歇業日期"] >= today)
    .map((r): NhiClinic => {
      const remark = remarks.get(r["醫事機構代碼"])?.trim();
      return {
        code: r["醫事機構代碼"],
        name: r["醫事機構名稱"],
        category: "pharmacy" in r ? "藥局" : categoryOf(r["醫事機構種類"] ?? "", r["醫事機構名稱"] ?? ""),
        kind: r["醫事機構種類"] ?? "",
        phone: r["電話"] || null,
        address: toHalfWidth(r["地址"]).replace(/^桃園市/, ""),
        departments: (r["診療科別"] ?? "")
          .split(/[,，、]/)
          .map((d) => d.trim())
          .filter((d) => d && d !== "不分科"),
        schedule: parseSchedule(r["固定看診時段"] ?? ""),
        remark: remark && remark !== "-" ? toHalfWidth(remark) : null,
      };
    });

  if (list.length === 0) throw new Error("NHI datasets returned no 大溪區 listings");
  return list.sort((a, b) => CLINIC_CATEGORIES.indexOf(a.category) - CLINIC_CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name, "zh-Hant"));
}

// Typical session hours for 基層診所. The NHI data only says 上午/下午/晚上,
// so "open now" is an estimate within these windows (minutes since midnight).
export const SESSION_WINDOWS: Record<Session, [number, number]> = {
  上午: [8 * 60, 12 * 60],
  下午: [14 * 60, 17 * 60 + 30],
  晚上: [18 * 60, 21 * 60 + 30],
};

function taipeiNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

export function currentSession(now = new Date()): { day: number; session: Session | null } {
  const { day, minutes } = taipeiNow(now);
  const session = SESSIONS.find((s) => minutes >= SESSION_WINDOWS[s][0] && minutes < SESSION_WINDOWS[s][1]) ?? null;
  return { day, session };
}

const DAY_LABEL = ["日", "一", "二", "三", "四", "五", "六"];

/** 「週一至週五 上午・下午・晚上；週六 上午；週日 休診」 */
export function summarizeSchedule(schedule: boolean[][]): string {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const label = (day: number) => {
    const open = SESSIONS.filter((_, i) => schedule[day]?.[i]);
    return open.length ? open.join("・") : "休診";
  };
  const groups: { days: number[]; text: string }[] = [];
  for (const day of order) {
    const text = label(day);
    const last = groups.at(-1);
    if (last && last.text === text) last.days.push(day);
    else groups.push({ days: [day], text });
  }
  return groups
    .map(({ days, text }) => {
      const span = days.length === 1 ? `週${DAY_LABEL[days[0]]}` : `週${DAY_LABEL[days[0]]}至週${DAY_LABEL[days.at(-1)!]}`;
      return `${span} ${text}`;
    })
    .join("；");
}
