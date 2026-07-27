// 社區佈告欄 (community bulletin) — short里長-style broadcasts, distinct from
// the official 區公所公告 feed already covered by lib/announcements.ts. This
// is meant for quick, informal notices (noise/spraying schedules, water
// outages, festival reminders) that a neighborhood lead would want to push
// without going through the formal announcement channel.
//
// File-backed (data/bulletin-posts.json), same pattern as
// lib/residentCarousel.ts, so it's editable from /admin/resident-bulletin
// instead of only through code edits.
import { promises as fs } from "fs";
import path from "path";
import type { DaxiVillage } from "./daxiVillages";

const DATA_PATH = path.join(process.cwd(), "data", "bulletin-posts.json");

export type BulletinTag = "疫苗" | "停水" | "噴藥" | "颱風" | "活動" | "一般";

export type BulletinPost = {
  id: string;
  title: string;
  body: string;
  tags: BulletinTag[];
  postedAt: number; // epoch ms
  // Which 里 this notice applies to — optional, since some posts (a
  // district-wide typhoon notice) aren't specific to one village.
  village?: DaxiVillage;
  // Pinned + shown with red emphasis regardless of tag — for genuinely
  // urgent notices (typhoon, water outage) rather than every post claiming
  // urgency.
  urgent?: boolean;
};

export type BulletinPostInput = {
  title: string;
  body: string;
  tags: BulletinTag[];
  village?: DaxiVillage;
  urgent?: boolean;
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

export async function readBulletinPosts(): Promise<BulletinPost[]> {
  const data = await readJson<unknown>([]);
  return Array.isArray(data) ? (data as BulletinPost[]) : [];
}

export async function getBulletinPost(id: string): Promise<BulletinPost | null> {
  const posts = await readBulletinPosts();
  return posts.find((p) => p.id === id) ?? null;
}

export async function createBulletinPost(input: BulletinPostInput): Promise<BulletinPost> {
  const posts = await readBulletinPosts();
  const post: BulletinPost = {
    ...input,
    id: `bulletin-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    postedAt: Date.now(),
  };
  posts.push(post);
  await writeJson(posts);
  return post;
}

export async function updateBulletinPost(id: string, input: Partial<BulletinPostInput>): Promise<BulletinPost | null> {
  const posts = await readBulletinPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...input };
  await writeJson(posts);
  return posts[idx];
}

export async function deleteBulletinPost(id: string): Promise<boolean> {
  const posts = await readBulletinPosts();
  const next = posts.filter((p) => p.id !== id);
  if (next.length === posts.length) return false;
  await writeJson(next);
  return true;
}

export function sortedBulletinPosts(posts: BulletinPost[]): BulletinPost[] {
  return [...posts].sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return b.postedAt - a.postedAt;
  });
}
