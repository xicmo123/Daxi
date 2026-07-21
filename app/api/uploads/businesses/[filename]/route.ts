import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Serves admin-uploaded business photos by reading the file fresh off disk
// on every request. Files under public/ get swept into this custom Next.js
// build's route cache and 404 forever if first requested before they exist
// (e.g. right after an admin upload) — see AGENTS.md re: this Next.js
// version's breaking changes from stock. A route handler is never
// statically cached, so it sidesteps that entirely.
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "businesses");

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^admin-[a-zA-Z0-9_-]+\.jpg$/.test(filename)) {
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
