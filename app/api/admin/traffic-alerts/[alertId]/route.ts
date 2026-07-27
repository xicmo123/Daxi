import { NextRequest, NextResponse } from "next/server";
import { deleteTrafficAlert, updateTrafficAlert, type AlertLevel } from "@/lib/trafficAlerts";

const VALID_LEVELS: AlertLevel[] = ["block", "warn", "info"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  const { alertId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { level, title, desc } = body;
  if (!VALID_LEVELS.includes(level)) return NextResponse.json({ error: "level 須為 block/warn/info" }, { status: 400 });
  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  if (typeof desc !== "string" || !desc.trim()) return NextResponse.json({ error: "desc 為必填" }, { status: 400 });

  const alert = await updateTrafficAlert(alertId, { level, title: title.trim(), desc: desc.trim() });
  if (!alert) return NextResponse.json({ error: "找不到這則公告" }, { status: 404 });
  return NextResponse.json({ ok: true, alert });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  const { alertId } = await params;
  const ok = await deleteTrafficAlert(alertId);
  if (!ok) return NextResponse.json({ error: "找不到這則公告" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
