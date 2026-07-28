// Append-only admin operation log — same JSON-on-disk pattern as
// lib/tracking.ts. Records sensitive admin actions (merchant account
// create/update/disable/delete, admin login attempts) so there is a trail
// to check after an incident. Not a replacement for a real audit system —
// single instance, no tamper protection — but enough for the MVP scale
// documented in README.
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_PATH = path.join(DATA_DIR, "admin-audit-log.json");
const MAX_ENTRIES = 2000;

export type AuditAction =
  | "admin.login.success"
  | "admin.login.failure"
  | "merchant.create"
  | "merchant.update"
  | "merchant.disable"
  | "merchant.enable"
  | "merchant.delete";

export type AuditEntry = {
  at: string;
  action: AuditAction;
  target?: string;
  detail?: string;
  ip?: string;
};

async function readLog(): Promise<AuditEntry[]> {
  try {
    const raw = await fs.readFile(LOG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export async function appendAuditLog(entry: Omit<AuditEntry, "at">): Promise<void> {
  const log = await readLog();
  log.push({ ...entry, at: new Date().toISOString() });
  const trimmed = log.length > MAX_ENTRIES ? log.slice(log.length - MAX_ENTRIES) : log;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOG_PATH, JSON.stringify(trimmed, null, 2) + "\n", "utf-8");
}

export async function readAuditLog(limit = 300): Promise<AuditEntry[]> {
  const log = await readLog();
  return log.slice(-limit).reverse();
}
