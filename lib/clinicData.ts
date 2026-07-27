// 醫療輪值地圖 (clinic/pharmacy duty roster) for /resident/clinics. Filtering
// logic (is this place open right now / is it on holiday-emergency duty
// today) is real and fully implemented. Data is file-backed
// (data/clinics.json) and editable from /admin/resident-clinics — no more
// invented hours, only whatever an admin actually enters.
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "clinics.json");

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, matches Date#getDay()

export type ClinicHoursWindow = {
  day: Weekday;
  openMinutes: number; // minutes since midnight
  closeMinutes: number; // minutes since midnight; crossing midnight not supported (use 1440)
};

export type Clinic = {
  id: string;
  name: string;
  type: "診所" | "藥局" | "醫院";
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  hours: ClinicHoursWindow[];
  // Rotating holiday/emergency duty dates (YYYY-MM-DD), e.g. 農曆新年 or a
  // weekend 輪值診所 rotation — distinct from the regular weekly `hours`.
  holidayDutyDates?: string[];
};

// Simplified admin input: a single weekday window (applied Mon–Fri) plus
// optional Saturday/Sunday windows — covers the overwhelming majority of
// real clinic schedules without needing a full 7-day custom-hours editor.
export type ClinicInput = {
  name: string;
  type: Clinic["type"];
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  weekdayOpen?: string; // "HH:MM"
  weekdayClose?: string;
  saturdayOpen?: string;
  saturdayClose?: string;
  sundayOpen?: string;
  sundayClose?: string;
  holidayDutyDates?: string[];
};

function toMinutesFromClock(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 24 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function windowsFor(days: Weekday[], open?: string, close?: string): ClinicHoursWindow[] {
  if (!open || !close) return [];
  const openMinutes = toMinutesFromClock(open);
  const closeMinutes = toMinutesFromClock(close);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) return [];
  return days.map((day) => ({ day, openMinutes, closeMinutes }));
}

export function buildHours(input: ClinicInput): ClinicHoursWindow[] {
  return [
    ...windowsFor([1, 2, 3, 4, 5], input.weekdayOpen, input.weekdayClose),
    ...windowsFor([6], input.saturdayOpen, input.saturdayClose),
    ...windowsFor([0], input.sundayOpen, input.sundayClose),
  ];
}

const VALID_CLINIC_TYPES: Clinic["type"][] = ["診所", "藥局", "醫院"];

// Shared by the create/update admin API routes — validates the raw request
// body into a well-typed ClinicInput, or returns a user-facing error string.
export function parseClinicInput(body: unknown): { input: ClinicInput } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const type = typeof b.type === "string" && VALID_CLINIC_TYPES.includes(b.type as Clinic["type"]) ? (b.type as Clinic["type"]) : null;
  const address = typeof b.address === "string" ? b.address.trim() : "";
  const lat = Number(b.lat);
  const lng = Number(b.lng);

  if (!name) return { error: "name 為必填" };
  if (!type) return { error: "type 須為 診所/藥局/醫院" };
  if (!address) return { error: "address 為必填" };
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: "lat/lng 需為數字" };

  const holidayDutyDates = Array.isArray(b.holidayDutyDates)
    ? b.holidayDutyDates.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
    : undefined;

  return {
    input: {
      name,
      type,
      address,
      phone: typeof b.phone === "string" && b.phone.trim() ? b.phone.trim() : undefined,
      lat,
      lng,
      weekdayOpen: typeof b.weekdayOpen === "string" ? b.weekdayOpen : undefined,
      weekdayClose: typeof b.weekdayClose === "string" ? b.weekdayClose : undefined,
      saturdayOpen: typeof b.saturdayOpen === "string" ? b.saturdayOpen : undefined,
      saturdayClose: typeof b.saturdayClose === "string" ? b.saturdayClose : undefined,
      sundayOpen: typeof b.sundayOpen === "string" ? b.sundayOpen : undefined,
      sundayClose: typeof b.sundayClose === "string" ? b.sundayClose : undefined,
      holidayDutyDates,
    },
  };
}

async function readJson<T>(fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(data: unknown) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readClinics(): Promise<Clinic[]> {
  const data = await readJson<unknown>([]);
  return Array.isArray(data) ? (data as Clinic[]) : [];
}

export async function getClinic(id: string): Promise<Clinic | null> {
  const clinics = await readClinics();
  return clinics.find((c) => c.id === id) ?? null;
}

export async function createClinic(input: ClinicInput): Promise<Clinic> {
  const clinics = await readClinics();
  const clinic: Clinic = {
    id: `clinic-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    type: input.type,
    address: input.address,
    phone: input.phone,
    lat: input.lat,
    lng: input.lng,
    hours: buildHours(input),
    holidayDutyDates: input.holidayDutyDates,
  };
  clinics.push(clinic);
  await writeJson(clinics);
  return clinic;
}

export async function updateClinic(id: string, input: ClinicInput): Promise<Clinic | null> {
  const clinics = await readClinics();
  const idx = clinics.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clinics[idx] = {
    ...clinics[idx],
    name: input.name,
    type: input.type,
    address: input.address,
    phone: input.phone,
    lat: input.lat,
    lng: input.lng,
    hours: buildHours(input),
    holidayDutyDates: input.holidayDutyDates,
  };
  await writeJson(clinics);
  return clinics[idx];
}

export async function deleteClinic(id: string): Promise<boolean> {
  const clinics = await readClinics();
  const next = clinics.filter((c) => c.id !== id);
  if (next.length === clinics.length) return false;
  await writeJson(next);
  return true;
}

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isClinicOpenNow(clinic: Clinic, now: Date = new Date()): boolean {
  const day = now.getDay() as Weekday;
  const minutes = toMinutes(now);
  return clinic.hours.some((w) => w.day === day && minutes >= w.openMinutes && minutes < w.closeMinutes);
}

export function isOnHolidayDutyToday(clinic: Clinic, now: Date = new Date()): boolean {
  if (!clinic.holidayDutyDates?.length) return false;
  const iso = now.toISOString().slice(0, 10);
  return clinic.holidayDutyDates.includes(iso);
}

export type ClinicWithStatus = Clinic & { isOpenNow: boolean; isHolidayDuty: boolean };

// Splits + sorts a clinic list into "open right now" first, so the busy
// "I need this now" case doesn't have to scroll past closed listings.
export function withOpenStatus(list: Clinic[], now: Date = new Date()): ClinicWithStatus[] {
  return list
    .map((c) => ({ ...c, isOpenNow: isClinicOpenNow(c, now), isHolidayDuty: isOnHolidayDutyToday(c, now) }))
    .sort((a, b) => Number(b.isOpenNow) - Number(a.isOpenNow));
}
