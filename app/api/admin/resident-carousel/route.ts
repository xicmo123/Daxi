import { NextRequest, NextResponse } from "next/server";
import {
  createResidentSlide,
  readResidentSlides,
  type ResidentSlideKind,
  type ResidentSlideTag,
} from "@/lib/residentCarousel";
import { getResidentFeature } from "@/lib/residentFeatures";

const VALID_TAGS: ResidentSlideTag[] = ["一般", "緊急", "活動"];
const VALID_KINDS: ResidentSlideKind[] = ["custom", "feature"];

export async function GET() {
  const slides = await readResidentSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { active, kind, featureKey, tag, title, subtitle, href } = body;
  const nextKind: ResidentSlideKind = VALID_KINDS.includes(kind) ? kind : "custom";
  const feature = nextKind === "feature" ? getResidentFeature(featureKey) : null;

  if (nextKind === "feature" && !feature) {
    return NextResponse.json({ error: "請選擇有效功能" }, { status: 400 });
  }

  const nextTitle = typeof title === "string" && title.trim() ? title.trim() : feature?.title;
  if (!nextTitle) {
    return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  }
  const nextTag = typeof tag === "string" && VALID_TAGS.includes(tag as ResidentSlideTag) ? (tag as ResidentSlideTag) : feature?.tag;
  if (!nextTag) {
    return NextResponse.json({ error: "tag 須為 一般/緊急/活動" }, { status: 400 });
  }

  const slide = await createResidentSlide({
    active: active === true,
    kind: nextKind,
    featureKey: feature?.key,
    tag: nextTag,
    title: nextTitle,
    subtitle: typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : feature?.subtitle,
    href: typeof href === "string" && href.trim() ? href.trim() : feature?.href,
  });

  return NextResponse.json({ ok: true, slide });
}
