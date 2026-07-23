import { NextRequest, NextResponse } from "next/server";
import { deleteResidentSlide, updateResidentSlide, type ResidentSlideTag } from "@/lib/residentCarousel";

const VALID_TAGS: ResidentSlideTag[] = ["一般", "緊急", "活動"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { active, tag, title, subtitle, href } = body;

  if (tag !== undefined && !VALID_TAGS.includes(tag as ResidentSlideTag)) {
    return NextResponse.json({ error: "tag 須為 一般/緊急/活動" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof active === "boolean") update.active = active;
  if (typeof tag === "string") update.tag = tag;
  if (typeof title === "string" && title.trim()) update.title = title.trim();
  if (typeof subtitle === "string") update.subtitle = subtitle.trim() || undefined;
  if (typeof href === "string") update.href = href.trim() || undefined;

  const slide = await updateResidentSlide(slideId, update);
  if (!slide) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });
  return NextResponse.json({ ok: true, slide });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const ok = await deleteResidentSlide(slideId);
  if (!ok) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
