import { NextRequest, NextResponse } from "next/server";
import { pushConfigured, sendPush } from "@/lib/pushSend";
import { isPushTopic, readPushTokens } from "@/lib/pushTokens";
import { clientIp } from "@/lib/rateLimit";
import { appendAuditLog } from "@/lib/auditLog";

// Behind the admin gate in proxy.ts.

export async function GET() {
  const tokens = await readPushTokens();
  const byTopic: Record<string, number> = {};
  for (const token of tokens) {
    for (const topic of token.topics) byTopic[topic] = (byTopic[topic] ?? 0) + 1;
  }
  return NextResponse.json({ configured: pushConfigured(), devices: tokens.length, byTopic });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const topic = body?.topic;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const message = typeof body?.body === "string" ? body.body.trim() : "";
  const path = typeof body?.path === "string" ? body.path.trim() : undefined;

  if (!isPushTopic(topic)) return NextResponse.json({ error: "請選擇通知類別" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "請填寫標題" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "請填寫內容" }, { status: 400 });
  // A push cannot be recalled once sent, so keep it to what a lock screen
  // actually shows rather than letting a truncated essay go out.
  if (title.length > 60) return NextResponse.json({ error: "標題請控制在 60 字以內" }, { status: 400 });
  if (message.length > 180) return NextResponse.json({ error: "內容請控制在 180 字以內" }, { status: 400 });

  const result = await sendPush({ topic, title, body: message, path });

  await appendAuditLog({
    action: "push.broadcast",
    target: topic,
    detail: `${title}（送達 ${result.delivered}/${result.attempted}）`,
    ip: clientIp(request),
  });

  return NextResponse.json(result);
}
