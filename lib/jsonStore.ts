// Shared JSON-on-disk primitives for the data/ store.
//
// The app runs as a single Node process on one Mac, so a database would be
// overkill — but "single process" is not the same as "no concurrency". Two
// admin requests overlapping in the event loop both did
// read → JSON.parse → mutate → writeFile, and the second write clobbered the
// first one's change. Worse, a plain fs.writeFile is not atomic: a crash or a
// power cut mid-write leaves a truncated file that fails JSON.parse forever.
//
// Two fixes, both in here so no call site has to remember them:
//   1. Every write goes to `<file>.tmp` and is renamed over the target.
//      rename(2) within a directory is atomic, so readers only ever observe
//      the complete old file or the complete new one.
//   2. Writes are serialised per path through a promise chain, and
//      `updateJsonFile` runs the whole read-modify-write inside that chain,
//      which is what actually closes the lost-update window.
import { promises as fs } from "fs";
import path from "path";

export const DATA_DIR = path.join(process.cwd(), "data");

export function dataPath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

// One tail promise per absolute path. Every queued operation chains onto it,
// so operations on the same file run strictly in order while different files
// stay fully parallel.
const writeChains = new Map<string, Promise<unknown>>();

function enqueue<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = writeChains.get(filePath) ?? Promise.resolve();
  // `.catch` keeps one failed operation from poisoning every later one on the
  // same file — the rejection is still delivered to that operation's caller
  // via `result` below.
  const result = previous.then(task, task);
  writeChains.set(
    filePath,
    result.catch(() => undefined),
  );
  return result;
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeAtomic(filePath: string, contents: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tmpPath, contents, "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    await fs.rm(tmpPath, { force: true }).catch(() => {});
    throw error;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const contents = JSON.stringify(data, null, 2) + "\n";
  return enqueue(filePath, () => writeAtomic(filePath, contents));
}

/**
 * Read, transform and write a JSON file as one indivisible step.
 *
 * Prefer this over `readJsonFile` + `writeJsonFile` for anything that derives
 * the new contents from the old — a separate read and write can interleave
 * with another request and silently lose an edit.
 */
export async function updateJsonFile<T>(
  filePath: string,
  fallback: T,
  update: (current: T) => T | Promise<T>,
): Promise<T> {
  return enqueue(filePath, async () => {
    const current = await readJsonFile<T>(filePath, fallback);
    const next = await update(current);
    await writeAtomic(filePath, JSON.stringify(next, null, 2) + "\n");
    return next;
  });
}

/**
 * The shape almost every store in data/ actually has: a JSON array of records
 * that gets read, changed, and written back. Runs the whole thing inside the
 * per-file lock and lets the caller return a value alongside the new list, so
 * a mutator stays as short as the un-locked version it replaces.
 */
export async function mutateJsonList<T, R>(
  filePath: string,
  change: (records: T[]) => { next: T[]; result: R },
): Promise<R> {
  let result!: R;
  await updateJsonFile<T[]>(filePath, [], (current) => {
    const records = Array.isArray(current) ? current : [];
    const changed = change(records);
    result = changed.result;
    return changed.next;
  });
  return result;
}

/**
 * Append one record to a newline-delimited JSON log.
 *
 * Used for the high-frequency logs (click events, client errors) that used to
 * rewrite an entire capped array on every single hit — O(n) disk writes per
 * event, and a lost-update race on every concurrent tap. An append is O(1)
 * and, for writes under PIPE_BUF, atomic at the OS level.
 */
export async function appendJsonLine(filePath: string, entry: unknown): Promise<void> {
  const line = JSON.stringify(entry) + "\n";
  return enqueue(filePath, async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, line, "utf-8");
  });
}

/** Read an NDJSON log, skipping any line a crash left half-written. */
export async function readJsonLines<T>(filePath: string): Promise<T[]> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return [];
  }
  const out: T[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as T);
    } catch {
      // Torn final line from an interrupted append — ignore it.
    }
  }
  return out;
}

/**
 * Cap an NDJSON log by rewriting it with only the most recent `keep` records.
 * Called opportunistically rather than on every append, so the O(n) cost is
 * amortised instead of paid per event.
 */
export async function trimJsonLines<T>(filePath: string, keep: number): Promise<void> {
  return enqueue(filePath, async () => {
    const all = await readJsonLinesUnlocked<T>(filePath);
    if (all.length <= keep) return;
    const kept = all.slice(all.length - keep);
    await writeAtomic(filePath, kept.map((entry) => JSON.stringify(entry)).join("\n") + "\n");
  });
}

async function readJsonLinesUnlocked<T>(filePath: string): Promise<T[]> {
  return readJsonLines<T>(filePath);
}
