// 常用連結 (useful links) — shown on both the resident home page's
// "常用連結" quick-link tile (components/ResidentLinksCard.tsx) and the
// 里民服務 page's 常用連結 section. Was two separately hardcoded copies of
// the same 4-item array; now a single file-backed source of truth
// (data/useful-links.json), editable from /admin/useful-links.
//
// Mutations go through mutateJsonList so the read-modify-write happens as one
// locked step — two admins saving at once used to silently drop one edit.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";

const DATA_PATH = dataPath("useful-links.json");

export type UsefulLink = {
  id: string;
  label: string;
  note: string;
  href: string;
  order: number;
};

export type UsefulLinkInput = {
  label: string;
  note: string;
  href: string;
};

function sorted(links: UsefulLink[]): UsefulLink[] {
  return [...links].sort((a, b) => a.order - b.order);
}

export async function readUsefulLinks(): Promise<UsefulLink[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return sorted(Array.isArray(data) ? (data as UsefulLink[]) : []);
}

export async function getUsefulLink(id: string): Promise<UsefulLink | null> {
  const links = await readUsefulLinks();
  return links.find((l) => l.id === id) ?? null;
}

export async function createUsefulLink(input: UsefulLinkInput): Promise<UsefulLink> {
  return mutateJsonList<UsefulLink, UsefulLink>(DATA_PATH, (records) => {
    const links = sorted(records);
    const link: UsefulLink = {
      ...input,
      id: `link-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      order: links.length > 0 ? Math.max(...links.map((l) => l.order)) + 1 : 0,
    };
    return { next: [...links, link], result: link };
  });
}

export async function updateUsefulLink(id: string, input: UsefulLinkInput): Promise<UsefulLink | null> {
  return mutateJsonList<UsefulLink, UsefulLink | null>(DATA_PATH, (records) => {
    const links = sorted(records);
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return { next: links, result: null };
    const updated = { ...links[idx], ...input };
    const next = [...links];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteUsefulLink(id: string): Promise<boolean> {
  return mutateJsonList<UsefulLink, boolean>(DATA_PATH, (records) => {
    const next = records.filter((l) => l.id !== id);
    return { next, result: next.length !== records.length };
  });
}

export async function moveUsefulLink(id: string, direction: "up" | "down"): Promise<boolean> {
  return mutateJsonList<UsefulLink, boolean>(DATA_PATH, (records) => {
    const links = sorted(records).map((l) => ({ ...l }));
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return { next: links, result: false };
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= links.length) return { next: links, result: false };
    const a = links[idx];
    const b = links[swapWith];
    [a.order, b.order] = [b.order, a.order];
    return { next: links, result: true };
  });
}
