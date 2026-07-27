import { NextRequest, NextResponse } from "next/server";
import { createUsefulLink, readUsefulLinks } from "@/lib/usefulLinks";

export async function GET() {
  const links = await readUsefulLinks();
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { label, note, href } = body;
  if (typeof label !== "string" || !label.trim()) return NextResponse.json({ error: "label 為必填" }, { status: 400 });
  if (typeof note !== "string") return NextResponse.json({ error: "note 格式錯誤" }, { status: 400 });
  if (typeof href !== "string" || !href.trim()) return NextResponse.json({ error: "href 為必填" }, { status: 400 });

  const link = await createUsefulLink({ label: label.trim(), note: note.trim(), href: href.trim() });
  return NextResponse.json({ ok: true, link });
}
