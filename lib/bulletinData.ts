// 社區佈告欄 (community bulletin) — short里長-style broadcasts, distinct from
// the official 區公所公告 feed already covered by lib/announcements.ts. This
// is meant for quick, informal notices (noise/spraying schedules, water
// outages, festival reminders) that a neighborhood lead would want to push
// without going through the formal announcement channel.
//
// File-backed (data/bulletin-posts.json), same pattern as
// lib/residentCarousel.ts, so it's editable from /admin/resident-bulletin
// instead of only through code edits.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";
import { activeBulletinPosts, isBulletinPostActive, type BulletinPost, type BulletinPostInput, type BulletinTag } from "./bulletinActive";

export type { BulletinTag, BulletinPost, BulletinPostInput };
export { activeBulletinPosts, isBulletinPostActive };

const DATA_PATH = dataPath("bulletin-posts.json");

export async function readBulletinPosts(): Promise<BulletinPost[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return Array.isArray(data) ? (data as BulletinPost[]) : [];
}

export async function getBulletinPost(id: string): Promise<BulletinPost | null> {
  const posts = await readBulletinPosts();
  return posts.find((p) => p.id === id) ?? null;
}

export async function createBulletinPost(input: BulletinPostInput): Promise<BulletinPost> {
  return mutateJsonList<BulletinPost, BulletinPost>(DATA_PATH, (posts) => {
    const post: BulletinPost = {
      ...input,
      id: `bulletin-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      postedAt: Date.now(),
    };
    return { next: [...posts, post], result: post };
  });
}

export async function updateBulletinPost(id: string, input: Partial<BulletinPostInput>): Promise<BulletinPost | null> {
  return mutateJsonList<BulletinPost, BulletinPost | null>(DATA_PATH, (posts) => {
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) return { next: posts, result: null };
    const updated = { ...posts[idx], ...input };
    const next = [...posts];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteBulletinPost(id: string): Promise<boolean> {
  return mutateJsonList<BulletinPost, boolean>(DATA_PATH, (posts) => {
    const next = posts.filter((p) => p.id !== id);
    return { next, result: next.length !== posts.length };
  });
}

export function sortedBulletinPosts(posts: BulletinPost[]): BulletinPost[] {
  return [...posts].sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return b.postedAt - a.postedAt;
  });
}
