// 常用連結 (useful links) — shown on both the resident home page's
// "常用連結" quick-link tile (components/ResidentLinksCard.tsx) and the
// 里民服務 page's 常用連結 section. Was two separately hardcoded copies of
// the same 4-item array; now a single file-backed source of truth
// (data/useful-links.json), editable from /admin/useful-links.
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "useful-links.json");

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

export async function readUsefulLinks(): Promise<UsefulLink[]> {
  const data = await readJson<unknown>([]);
  const links = Array.isArray(data) ? (data as UsefulLink[]) : [];
  return [...links].sort((a, b) => a.order - b.order);
}

export async function getUsefulLink(id: string): Promise<UsefulLink | null> {
  const links = await readUsefulLinks();
  return links.find((l) => l.id === id) ?? null;
}

export async function createUsefulLink(input: UsefulLinkInput): Promise<UsefulLink> {
  const links = await readUsefulLinks();
  const link: UsefulLink = {
    ...input,
    id: `link-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    order: links.length > 0 ? Math.max(...links.map((l) => l.order)) + 1 : 0,
  };
  links.push(link);
  await writeJson(links);
  return link;
}

export async function updateUsefulLink(id: string, input: UsefulLinkInput): Promise<UsefulLink | null> {
  const links = await readUsefulLinks();
  const idx = links.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  links[idx] = { ...links[idx], ...input };
  await writeJson(links);
  return links[idx];
}

export async function deleteUsefulLink(id: string): Promise<boolean> {
  const links = await readUsefulLinks();
  const next = links.filter((l) => l.id !== id);
  if (next.length === links.length) return false;
  await writeJson(next);
  return true;
}

export async function moveUsefulLink(id: string, direction: "up" | "down"): Promise<boolean> {
  const links = await readUsefulLinks();
  const idx = links.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= links.length) return false;
  const a = links[idx];
  const b = links[swapWith];
  [a.order, b.order] = [b.order, a.order];
  await writeJson(links);
  return true;
}
