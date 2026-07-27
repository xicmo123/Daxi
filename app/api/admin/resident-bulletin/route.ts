import { NextRequest, NextResponse } from "next/server";
import { createBulletinPost, readBulletinPosts, type BulletinTag } from "@/lib/bulletinData";
import { DAXI_VILLAGES, type DaxiVillage } from "@/lib/daxiVillages";

const VALID_TAGS: BulletinTag[] = ["疫苗", "停水", "噴藥", "颱風", "活動", "一般"];

function isDaxiVillage(value: unknown): value is DaxiVillage {
  return typeof value === "string" && (DAXI_VILLAGES as readonly string[]).includes(value);
}

export async function GET() {
  const posts = await readBulletinPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { title, body: postBody, tags, village, urgent } = body;
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  }
  if (typeof postBody !== "string" || !postBody.trim()) {
    return NextResponse.json({ error: "body 為必填" }, { status: 400 });
  }
  const nextTags: BulletinTag[] = Array.isArray(tags) ? tags.filter((t): t is BulletinTag => VALID_TAGS.includes(t)) : [];

  const post = await createBulletinPost({
    title: title.trim(),
    body: postBody.trim(),
    tags: nextTags,
    village: isDaxiVillage(village) ? village : undefined,
    urgent: urgent === true,
  });

  return NextResponse.json({ ok: true, post });
}
