// Client-safe slice of lib/bulletinData.ts — types and pure date-range
// logic only, no `fs` import, so client components (BulletinList,
// CommunityBulletin) can use isBulletinPostActive without pulling the
// server-only file-read/write code into the browser bundle.
import type { DaxiVillage } from "./daxiVillages";

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
  // Optional display window (YYYY-MM-DD, inclusive both ends) — e.g. a
  // festival notice that should stop showing on the homepage once the
  // event is over. Unset on either end means no bound on that side.
  startDate?: string;
  endDate?: string;
};

export type BulletinPostInput = {
  title: string;
  body: string;
  tags: BulletinTag[];
  village?: DaxiVillage;
  urgent?: boolean;
  startDate?: string;
  endDate?: string;
};

// Local (Taiwan) calendar date as YYYY-MM-DD, so a post set to end "today"
// still shows all day rather than cutting off at UTC midnight.
function todayDateString(at: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei" }).format(at);
}

export function isBulletinPostActive(post: BulletinPost, at: Date = new Date()): boolean {
  const today = todayDateString(at);
  if (post.startDate && today < post.startDate) return false;
  if (post.endDate && today > post.endDate) return false;
  return true;
}

export function activeBulletinPosts(posts: BulletinPost[], at?: Date): BulletinPost[] {
  return posts.filter((p) => isBulletinPostActive(p, at));
}
