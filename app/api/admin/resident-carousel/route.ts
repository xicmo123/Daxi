import { NextRequest, NextResponse } from "next/server";
import { createResidentSlide, readResidentSlides, type ResidentSlideTag } from "@/lib/residentCarousel";

const VALID_TAGS: ResidentSlideTag[] = ["一般", "緊急", "活動"];

export async function GET() {
  const slides = await readResidentSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { active, tag, title, subtitle, href } = body;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  }
  if (typeof tag !== "string" || !VALID_TAGS.includes(tag as ResidentSlideTag)) {
    return NextResponse.json({ error: "tag 須為 一般/緊急/活動" }, { status: 400 });
  }

  const slide = await createResidentSlide({
    active: active === true,
    tag: tag as ResidentSlideTag,
    title: title.trim(),
    subtitle: typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : undefined,
    href: typeof href === "string" && href.trim() ? href.trim() : undefined,
  });

  return NextResponse.json({ ok: true, slide });
}
