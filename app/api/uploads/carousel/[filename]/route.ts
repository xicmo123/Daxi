import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Same fix as app/api/uploads/businesses/[filename]/route.ts — this custom
// Next.js build 404-caches public/ files first requested before they exist
// on disk, which a freshly-uploaded slide photo always is on first render.
// Reading fresh off disk in a route handler sidesteps that entirely.
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "carousel");

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^slide-[a-zA-Z0-9_-]+\.jpg$/.test(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(path.join(IMAGES_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
