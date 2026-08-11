import { NextRequest, NextResponse } from "next/server";
import { clientIp, isRateLimited, recordFailedAttempt } from "@/lib/rateLimit";
import { isPushTopic, upsertPushToken, type PushTopic } from "@/lib/pushTokens";

// Unauthenticated by necessity — the app registers before there is any notion
// of a user, and there are no accounts in this app at all. Rate-limited like
// /api/track for the same reason: nothing should be able to fill the disk by
// posting junk tokens in a loop.
const MAX_PER_WINDOW = 30;

export async function POST(request: NextRequest) {
  const key = `push-register:${clientIp(request)}`;
  if (isRateLimited(key, MAX_PER_WINDOW)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }
  recordFailedAttempt(key);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const platform = body.platform;
  // FCM/APNs tokens are well under this; the cap just bounds what one caller
  // can write to disk.
  if (!token || token.length > 512) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }
  if (platform !== "ios" && platform !== "android" && platform !== "web") {
    return NextResponse.json({ error: "invalid platform" }, { status: 400 });
  }

  const topics: PushTopic[] = Array.isArray(body.topics) ? body.topics.filter(isPushTopic) : [];

  await upsertPushToken({ token, platform, topics });
  return NextResponse.json({ ok: true });
}
