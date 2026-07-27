import { NextRequest, NextResponse } from "next/server";
import { deleteUsefulLink, moveUsefulLink, updateUsefulLink } from "@/lib/usefulLinks";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  if (body.direction === "up" || body.direction === "down") {
    const ok = await moveUsefulLink(linkId, body.direction);
    if (!ok) return NextResponse.json({ error: "無法移動" }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { label, note, href } = body;
  if (typeof label !== "string" || !label.trim()) return NextResponse.json({ error: "label 為必填" }, { status: 400 });
  if (typeof note !== "string") return NextResponse.json({ error: "note 格式錯誤" }, { status: 400 });
  if (typeof href !== "string" || !href.trim()) return NextResponse.json({ error: "href 為必填" }, { status: 400 });

  const link = await updateUsefulLink(linkId, { label: label.trim(), note: note.trim(), href: href.trim() });
  if (!link) return NextResponse.json({ error: "找不到這個連結" }, { status: 404 });
  return NextResponse.json({ ok: true, link });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const ok = await deleteUsefulLink(linkId);
  if (!ok) return NextResponse.json({ error: "找不到這個連結" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
