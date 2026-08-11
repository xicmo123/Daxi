// 交通管制公告 (traffic-control alerts) shown on /weather — was a single
// hardcoded entry in lib/data.ts describing only the festival's opening day.
// File-backed (data/traffic-alerts.json) so new control windows announced
// during the festival can be posted from /admin/traffic-alerts instead of a
// code deploy.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";

const DATA_PATH = dataPath("traffic-alerts.json");

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

function sorted(alerts: TrafficAlert[]): TrafficAlert[] {
  return [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readTrafficAlerts(): Promise<TrafficAlert[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return sorted(Array.isArray(data) ? (data as TrafficAlert[]) : []);
}

export async function getTrafficAlert(id: string): Promise<TrafficAlert | null> {
  const alerts = await readTrafficAlerts();
  return alerts.find((a) => a.id === id) ?? null;
}

export async function createTrafficAlert(input: TrafficAlertInput): Promise<TrafficAlert> {
  return mutateJsonList<TrafficAlert, TrafficAlert>(DATA_PATH, (alerts) => {
    const alert: TrafficAlert = {
      ...input,
      id: `alert-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    return { next: [...alerts, alert], result: alert };
  });
}

export async function updateTrafficAlert(id: string, input: TrafficAlertInput): Promise<TrafficAlert | null> {
  return mutateJsonList<TrafficAlert, TrafficAlert | null>(DATA_PATH, (alerts) => {
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return { next: alerts, result: null };
    const updated = { ...alerts[idx], ...input };
    const next = [...alerts];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteTrafficAlert(id: string): Promise<boolean> {
  return mutateJsonList<TrafficAlert, boolean>(DATA_PATH, (alerts) => {
    const next = alerts.filter((a) => a.id !== id);
    return { next, result: next.length !== alerts.length };
  });
}
