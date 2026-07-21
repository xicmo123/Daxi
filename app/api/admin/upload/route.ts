import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { savePhoto, removePhoto, readPhotos } from "@/lib/placesStore";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "businesses");

function sanitize(placeId: string): string {
  return placeId.replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid form data" }, { status: 400 });

  const placeId = form.get("placeId");
  const file = form.get("file");
  const author = form.get("author");
  const sourceUrl = form.get("sourceUrl");

  if (typeof placeId !== "string" || !placeId) {
    return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少檔案" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "只能上傳圖片檔" }, { status: 400 });
  }

  const safeId = sanitize(placeId);
  const buffer = Buffer.from(await file.arrayBuffer());

  let resized: Buffer;
  try {
    resized = await sharp(buffer)
      .rotate() // respect EXIF orientation
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "圖片處理失敗，請確認檔案格式" }, { status: 400 });
  }

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const filename = `admin-${safeId}.jpg`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), resized);

  const src = `/images/businesses/${filename}`;
  await savePhoto(placeId, {
    src,
    author: typeof author === "string" && author.trim() ? author.trim() : undefined,
    sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : undefined,
  });

  return NextResponse.json({ ok: true, src });
}

export async function DELETE(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId) return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });

  const photos = await readPhotos();
  const existing = photos[placeId];
  await removePhoto(placeId);

  if (existing?.src?.startsWith("/images/businesses/admin-")) {
    const filePath = path.join(process.cwd(), "public", existing.src);
    await fs.unlink(filePath).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
