import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "reservations");

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid form data" }, { status: 400 });

  const placeId = form.get("placeId");
  const file = form.get("file");
  if (typeof placeId !== "string" || !placeId) {
    return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少檔案" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "只能上傳圖片檔" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let resized: Buffer;
  try {
    resized = await sharp(buffer)
      .rotate()
      .resize(900, 640, { fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "圖片處理失敗，請確認檔案格式" }, { status: 400 });
  }

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const filename = `admin-${sanitize(placeId)}-${Date.now().toString(36)}.jpg`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), resized);
  return NextResponse.json({ ok: true, src: `/api/uploads/reservations/${filename}` });
}
