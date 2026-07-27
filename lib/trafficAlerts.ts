// 交通管制公告 (traffic-control alerts) shown on /weather — was a single
// hardcoded entry in lib/data.ts describing only the festival's opening day.
// File-backed (data/traffic-alerts.json) so new control windows announced
// during the festival can be posted from /admin/traffic-alerts instead of a
// code deploy.
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "traffic-alerts.json");

export type AlertLevel = "block" | "warn" | "info";

export type TrafficAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  desc: string;
  createdAt: string;
};

export type TrafficAlertInput = {
  level: AlertLevel;
  title: string;
  desc: string;
};

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

export async function readTrafficAlerts(): Promise<TrafficAlert[]> {
  const data = await readJson<unknown>([]);
  const alerts = Array.isArray(data) ? (data as TrafficAlert[]) : [];
  return [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTrafficAlert(id: string): Promise<TrafficAlert | null> {
  const alerts = await readTrafficAlerts();
  return alerts.find((a) => a.id === id) ?? null;
}

export async function createTrafficAlert(input: TrafficAlertInput): Promise<TrafficAlert> {
  const alerts = await readTrafficAlerts();
  const alert: TrafficAlert = {
    ...input,
    id: `alert-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  await writeJson(alerts);
  return alert;
}

export async function updateTrafficAlert(id: string, input: TrafficAlertInput): Promise<TrafficAlert | null> {
  const alerts = await readTrafficAlerts();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  alerts[idx] = { ...alerts[idx], ...input };
  await writeJson(alerts);
  return alerts[idx];
}

export async function deleteTrafficAlert(id: string): Promise<boolean> {
  const alerts = await readTrafficAlerts();
  const next = alerts.filter((a) => a.id !== id);
  if (next.length === alerts.length) return false;
  await writeJson(next);
  return true;
}
