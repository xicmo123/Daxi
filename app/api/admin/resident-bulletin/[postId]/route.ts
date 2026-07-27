import { NextRequest, NextResponse } from "next/server";
import { deleteBulletinPost, updateBulletinPost, type BulletinTag } from "@/lib/bulletinData";
import { DAXI_VILLAGES } from "@/lib/daxiVillages";

const VALID_TAGS: BulletinTag[] = ["疫苗", "停水", "噴藥", "颱風", "活動", "一般"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { title, body: postBody, tags, village, urgent, startDate, endDate } = body;
  const update: Record<string, unknown> = {};
  if (typeof title === "string" && title.trim()) update.title = title.trim();
  if (typeof postBody === "string" && postBody.trim()) update.body = postBody.trim();
  if (Array.isArray(tags)) update.tags = tags.filter((t): t is BulletinTag => VALID_TAGS.includes(t));
  if (typeof village === "string") {
    update.village = (DAXI_VILLAGES as readonly string[]).includes(village) ? village : undefined;
  }
  if (typeof urgent === "boolean") update.urgent = urgent;
  if (typeof startDate === "string") update.startDate = DATE_RE.test(startDate) ? startDate : undefined;
  if (typeof endDate === "string") update.endDate = DATE_RE.test(endDate) ? endDate : undefined;

  const nextStart = (update.startDate as string | undefined) ?? undefined;
  const nextEnd = (update.endDate as string | undefined) ?? undefined;
  if (nextStart && nextEnd && nextEnd < nextStart) {
    return NextResponse.json({ error: "結束日期不能早於開始日期" }, { status: 400 });
  }

  const post = await updateBulletinPost(postId, update);
  if (!post) return NextResponse.json({ error: "找不到這則公告" }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ok = await deleteBulletinPost(postId);
  if (!ok) return NextResponse.json({ error: "找不到這則公告" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
