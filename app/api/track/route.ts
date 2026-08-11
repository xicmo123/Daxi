import { NextRequest, NextResponse } from "next/server";
import { recordClientError, recordEvent } from "@/lib/telemetry";
import { clientIp, isRateLimited, recordFailedAttempt } from "@/lib/rateLimit";
import type { TrackedItemType } from "@/lib/trackClient";

const VALID_CLICK_TYPES: TrackedItemType[] = ["spot", "business", "coupon", "map_card"];
const VALID_ERROR_SOURCES = ["render", "window", "unhandledrejection"] as const;

// This endpoint is unauthenticated by necessity (it's a beacon), so cap what
// one client can push: a crash loop firing an error on every render, or
// someone curling the endpoint, must not be able to fill the disk.
const MAX_PER_WINDOW = 240;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const throttleKey = `track:${ip}`;
  if (isRateLimited(throttleKey, MAX_PER_WINDOW)) {
    // 204 rather than 429: the client is a beacon that ignores the response,
    // and a rejection status would show up as a console error in the app.
    return new NextResponse(null, { status: 204 });
  }
  recordFailedAttempt(throttleKey);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const kind = (body as { kind?: unknown }).kind;

  if (kind === "error") {
    const source = (body as { source?: unknown }).source;
    if (!VALID_ERROR_SOURCES.includes(source as (typeof VALID_ERROR_SOURCES)[number])) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const message = str((body as { message?: unknown }).message, 500);
    if (!message) return NextResponse.json({ ok: false }, { status: 400 });

    await recordClientError({
      message,
      source: source as (typeof VALID_ERROR_SOURCES)[number],
      stack: str((body as { stack?: unknown }).stack, 4000) || undefined,
      path: str((body as { path?: unknown }).path, 300) || undefined,
      version: str((body as { version?: unknown }).version, 40) || undefined,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  const type = str((body as { type?: unknown }).type, 40);
  const id = str((body as { id?: unknown }).id, 300);
  const label = str((body as { label?: unknown }).label, 200);
  const mode = str((body as { mode?: unknown }).mode, 40) || undefined;

  if (kind === "view") {
    if (!id) return NextResponse.json({ ok: false }, { status: 400 });
    await recordEvent({ kind: "view", type: "page_view", id, label, mode });
    return NextResponse.json({ ok: true });
  }

  // Default is a content click — kind is optional here so beacons queued by an
  // older client build (which sent no `kind`) still record correctly.
  if (!VALID_CLICK_TYPES.includes(type as TrackedItemType) || !id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await recordEvent({ kind: "click", type, id, label, mode });
  return NextResponse.json({ ok: true });
}
