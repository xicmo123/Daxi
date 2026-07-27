import { NextRequest, NextResponse } from "next/server";
import { createTrafficAlert, readTrafficAlerts, type AlertLevel } from "@/lib/trafficAlerts";

const VALID_LEVELS: AlertLevel[] = ["block", "warn", "info"];

export async function GET() {
  const alerts = await readTrafficAlerts();
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { level, title, desc } = body;
  if (!VALID_LEVELS.includes(level)) return NextResponse.json({ error: "level 須為 block/warn/info" }, { status: 400 });
  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  if (typeof desc !== "string" || !desc.trim()) return NextResponse.json({ error: "desc 為必填" }, { status: 400 });

  const alert = await createTrafficAlert({ level, title: title.trim(), desc: desc.trim() });
  return NextResponse.json({ ok: true, alert });
}
