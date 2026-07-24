import { NextRequest, NextResponse } from "next/server";
import {
  deleteResidentSlide,
  updateResidentSlide,
  type ResidentSlideKind,
  type ResidentSlideTag,
} from "@/lib/residentCarousel";
import { getResidentFeature } from "@/lib/residentFeatures";

const VALID_TAGS: ResidentSlideTag[] = ["一般", "緊急", "活動"];
const VALID_KINDS: ResidentSlideKind[] = ["custom", "feature"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { active, kind, featureKey, tag, title, subtitle, href } = body;

  if (tag !== undefined && !VALID_TAGS.includes(tag as ResidentSlideTag)) {
    return NextResponse.json({ error: "tag 須為 一般/緊急/活動" }, { status: 400 });
  }
  if (kind !== undefined && !VALID_KINDS.includes(kind as ResidentSlideKind)) {
    return NextResponse.json({ error: "kind 不正確" }, { status: 400 });
  }

  const feature = kind === "feature" || featureKey !== undefined ? getResidentFeature(featureKey) : null;
  if ((kind === "feature" || featureKey !== undefined) && !feature) {
    return NextResponse.json({ error: "請選擇有效功能" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof active === "boolean") update.active = active;
  if (typeof kind === "string") update.kind = kind;
  if (feature) update.featureKey = feature.key;
  if (typeof tag === "string") update.tag = tag;
  if (typeof title === "string" && title.trim()) update.title = title.trim();
  else if (feature) update.title = feature.title;
  if (typeof subtitle === "string") update.subtitle = subtitle.trim() || feature?.subtitle || undefined;
  else if (feature) update.subtitle = feature.subtitle;
  if (typeof href === "string") update.href = href.trim() || feature?.href || undefined;
  else if (feature) update.href = feature.href;
  if (feature && tag === undefined) update.tag = feature.tag;

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
