import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { getSlide, updateSlide } from "@/lib/carousel";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "carousel");

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid form data" }, { status: 400 });

  const slideId = form.get("slideId");
  const file = form.get("file");
  const author = form.get("author");
  const sourceUrl = form.get("sourceUrl");
  const historical = form.get("historical");

  if (typeof slideId !== "string" || !slideId) {
    return NextResponse.json({ error: "slideId 為必填" }, { status: 400 });
  }
  const slide = await getSlide(slideId);
  if (!slide) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });
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
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "圖片處理失敗，請確認檔案格式" }, { status: 400 });
  }

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const filename = `${slideId}.jpg`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), resized);

  // Served via a route handler, not the raw /images/carousel/ static path —
  // see app/api/uploads/carousel/[filename]/route.ts for why.
  const src = `/api/uploads/carousel/${filename}`;
  const updated = await updateSlide(slideId, {
    photo: {
      src,
      author: typeof author === "string" && author.trim() ? author.trim() : undefined,
      sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : undefined,
      historical: historical === "true" ? true : undefined,
    },
  });

  return NextResponse.json({ ok: true, slide: updated });
}

export async function DELETE(request: NextRequest) {
  const slideId = request.nextUrl.searchParams.get("slideId");
  if (!slideId) return NextResponse.json({ error: "slideId 為必填" }, { status: 400 });

  const slide = await getSlide(slideId);
  if (!slide) return NextResponse.json({ error: "找不到這個輪播項目" }, { status: 404 });

  if (slide.photo?.src?.startsWith("/api/uploads/carousel/")) {
    const filename = slide.photo.src.slice("/api/uploads/carousel/".length);
    await fs.unlink(path.join(IMAGES_DIR, filename)).catch(() => {});
  }
  await updateSlide(slideId, { photo: null });

  return NextResponse.json({ ok: true });
}
