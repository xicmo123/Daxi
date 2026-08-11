// Append-only admin operation log. Records sensitive admin actions (merchant
// account create/update/disable/delete, admin login attempts) so there is a
// trail to check after an incident. Not a replacement for a real audit system
// — single instance, no tamper protection — but enough for the MVP scale
// documented in README.
//
// Kept as a JSON array rather than the NDJSON used for click events: entries
// are rare (admin actions only) so rewriting 2000 of them costs nothing, and
// it avoids migrating the existing data/admin-audit-log.json. The append runs
// inside updateJsonFile, so two concurrent admin actions can no longer
// overwrite each other's entry — which for an audit log would be the one
// failure mode that matters.
import { dataPath, readJsonFile, updateJsonFile } from "./jsonStore";

const LOG_PATH = dataPath("admin-audit-log.json");
const MAX_ENTRIES = 2000;

export type AuditAction =
  | "admin.login.success"
  | "admin.login.failure"
  | "admin.sessions.revoke"
  | "merchant.sessions.revoke"
  | "push.broadcast"
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

export async function appendAuditLog(entry: Omit<AuditEntry, "at">): Promise<void> {
  await updateJsonFile<AuditEntry[]>(LOG_PATH, [], (current) => {
    const log = Array.isArray(current) ? current : [];
    const next = [...log, { ...entry, at: new Date().toISOString() }];
    return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
  });
}

export async function readAuditLog(limit = 300): Promise<AuditEntry[]> {
  const log = await readJsonFile<AuditEntry[]>(LOG_PATH, []);
  return (Array.isArray(log) ? log : []).slice(-limit).reverse();
}
