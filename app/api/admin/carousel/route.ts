import { NextRequest, NextResponse } from "next/server";
import { createSlide, readSlides, type CarouselSlide } from "@/lib/carousel";

const VALID_PHASES: CarouselSlide["phase"][] = ["past", "ongoing", "upcoming"];
const VALID_BADGES: NonNullable<CarouselSlide["badges"]>[number][] = ["route", "live"];

export async function GET() {
  const slides = await readSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { date, isoDate, phase, time, title, desc, history, theme, badges, ctaLabel, ctaUrl } = body;

  if (typeof date !== "string" || !date.trim()) {
    return NextResponse.json({ error: "date 為必填" }, { status: 400 });
  }
  if (typeof phase !== "string" || !VALID_PHASES.includes(phase as CarouselSlide["phase"])) {
    return NextResponse.json({ error: "phase 須為 past/ongoing/upcoming" }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  }
  if (typeof desc !== "string" || !desc.trim()) {
    return NextResponse.json({ error: "desc 為必填" }, { status: 400 });
  }

  const slide = await createSlide({
    date: date.trim(),
    isoDate: typeof isoDate === "string" && isoDate.trim() ? isoDate.trim() : undefined,
    phase: phase as CarouselSlide["phase"],
    time: typeof time === "string" ? time.trim() : "",
    title: title.trim(),
    desc: desc.trim(),
    history: typeof history === "string" && history.trim() ? history.trim() : undefined,
    theme: typeof theme === "string" && theme.trim() ? theme.trim() : undefined,
    badges: Array.isArray(badges) ? badges.filter((b) => VALID_BADGES.includes(b)) : undefined,
    ctaLabel: typeof ctaLabel === "string" && ctaLabel.trim() ? ctaLabel.trim() : undefined,
    ctaUrl: typeof ctaUrl === "string" && ctaUrl.trim() ? ctaUrl.trim() : undefined,
  });

  return NextResponse.json({ ok: true, slide });
}
