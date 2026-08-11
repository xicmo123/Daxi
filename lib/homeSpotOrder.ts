import { dataPath, readJsonFile, updateJsonFile } from "./jsonStore";

const ORDER_PATH = dataPath("home-spot-order.json");

export async function readHomeSpotOrder(): Promise<string[]> {
  const data = await readJsonFile<unknown>(ORDER_PATH, []);
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

// Reordering is the one admin screen where rapid successive clicks are normal
// ("move this up four places"), so the read-modify-write here is the most
// likely of all the stores to interleave — hence the locked update.
export async function moveHomeSpot(placeId: string, direction: "up" | "down", placeIds: string[]): Promise<boolean> {
  let moved = false;
  await updateJsonFile<string[]>(ORDER_PATH, [], (current) => {
    const order = normalizeHomeSpotOrder(placeIds, Array.isArray(current) ? current : []);
    const index = order.indexOf(placeId);
    if (index === -1) return order;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= order.length) return order;
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
    moved = true;
    return order;
  });
  return moved;
}

export async function setHomeSpotPosition(placeId: string, position: number, placeIds: string[]): Promise<boolean> {
  let moved = false;
  await updateJsonFile<string[]>(ORDER_PATH, [], (current) => {
    const order = normalizeHomeSpotOrder(placeIds, Array.isArray(current) ? current : []);
    const currentIndex = order.indexOf(placeId);
    if (currentIndex === -1 || !Number.isInteger(position) || position < 1 || position > order.length) return order;
    order.splice(currentIndex, 1);
    order.splice(position - 1, 0, placeId);
    moved = true;
    return order;
  });
  return moved;
}
