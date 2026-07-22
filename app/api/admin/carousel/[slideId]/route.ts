import { NextRequest, NextResponse } from "next/server";
import { deleteSlide, updateSlide, type CarouselSlide } from "@/lib/carousel";

const VALID_PHASES: CarouselSlide["phase"][] = ["past", "ongoing", "upcoming"];
const VALID_BADGES: NonNullable<CarouselSlide["badges"]>[number][] = ["route", "live"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { date, isoDate, phase, time, title, desc, history, theme, badges, ctaLabel, ctaUrl, showInCarousel } = body;

  if (phase !== undefined && !VALID_PHASES.includes(phase as CarouselSlide["phase"])) {
    return NextResponse.json({ error: "phase 須為 past/ongoing/upcoming" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof date === "string" && date.trim()) update.date = date.trim();
  if (typeof isoDate === "string") update.isoDate = isoDate.trim() || undefined;
  if (typeof phase === "string") update.phase = phase;
  if (typeof time === "string") update.time = time.trim();
  if (typeof title === "string" && title.trim()) update.title = title.trim();
  if (typeof desc === "string" && desc.trim()) update.desc = desc.trim();
  if (typeof history === "string") update.history = history.trim() || undefined;
  if (typeof theme === "string") update.theme = theme.trim() || undefined;
  if (Array.isArray(badges)) update.badges = badges.filter((b) => VALID_BADGES.includes(b));
  if (typeof ctaLabel === "string") update.ctaLabel = ctaLabel.trim() || undefined;
  if (typeof ctaUrl === "string") update.ctaUrl = ctaUrl.trim() || undefined;
  if (typeof showInCarousel === "boolean") update.showInCarousel = showInCarousel;

  const slide = await updateSlide(slideId, update);
  if (!slide) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });
  return NextResponse.json({ ok: true, slide });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const ok = await deleteSlide(slideId);
  if (!ok) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
