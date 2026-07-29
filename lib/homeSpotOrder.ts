import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDER_PATH = path.join(DATA_DIR, "home-spot-order.json");

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readHomeSpotOrder(): Promise<string[]> {
  const data = await readJson<unknown>(ORDER_PATH, []);
  return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : [];
}

export function normalizeHomeSpotOrder(placeIds: string[], savedOrder: string[]): string[] {
  const validIds = new Set(placeIds);
  const ordered = savedOrder.filter((id, index) => validIds.has(id) && savedOrder.indexOf(id) === index);
  const orderedIds = new Set(ordered);
  return [...ordered, ...placeIds.filter((id) => !orderedIds.has(id))];
}

export function sortByHomeSpotOrder<T extends { placeId: string }>(items: T[], savedOrder: string[]): T[] {
  const normalized = normalizeHomeSpotOrder(
    items.map((item) => item.placeId),
    savedOrder,
  );
  const rank = new Map(normalized.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (rank.get(a.placeId) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.placeId) ?? Number.MAX_SAFE_INTEGER));
}

export async function moveHomeSpot(placeId: string, direction: "up" | "down", placeIds: string[]): Promise<boolean> {
  const order = normalizeHomeSpotOrder(placeIds, await readHomeSpotOrder());
  const index = order.indexOf(placeId);
  if (index === -1) return false;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= order.length) return false;
  [order[index], order[swapWith]] = [order[swapWith], order[index]];
  await writeJson(ORDER_PATH, order);
  return true;
}

export async function setHomeSpotPosition(placeId: string, position: number, placeIds: string[]): Promise<boolean> {
  const order = normalizeHomeSpotOrder(placeIds, await readHomeSpotOrder());
  const currentIndex = order.indexOf(placeId);
  if (currentIndex === -1 || !Number.isInteger(position) || position < 1 || position > order.length) return false;

  order.splice(currentIndex, 1);
  order.splice(position - 1, 0, placeId);
  await writeJson(ORDER_PATH, order);
  return true;
}
