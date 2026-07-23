// Admin-editable banner strip shown at the top of the resident home
// ("長條輪播") — same JSON-file-on-disk pattern as lib/carousel.ts, but
// deliberately lean (no photos/phases/badges): residents rotate through
// short announcement banners, not festival hero cards.
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "resident-carousel-slides.json");

export type ResidentSlideTag = "一般" | "緊急" | "活動";

export type ResidentCarouselSlide = {
  id: string;
  order: number;
  active: boolean;
  tag: ResidentSlideTag;
  title: string;
  subtitle?: string;
  href?: string;
  createdAt: string;
  updatedAt: string;
};

export type ResidentCarouselSlideInput = {
  active: boolean;
  tag: ResidentSlideTag;
  title: string;
  subtitle?: string;
  href?: string;
};

async function readJson<T>(fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(data: unknown) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readResidentSlides(): Promise<ResidentCarouselSlide[]> {
  const data = await readJson<unknown>([]);
  const slides = Array.isArray(data) ? (data as ResidentCarouselSlide[]) : [];
  return [...slides].sort((a, b) => a.order - b.order);
}

export async function listActiveResidentSlides(): Promise<ResidentCarouselSlide[]> {
  const slides = await readResidentSlides();
  return slides.filter((s) => s.active);
}

export async function getResidentSlide(id: string): Promise<ResidentCarouselSlide | null> {
  const slides = await readResidentSlides();
  return slides.find((s) => s.id === id) ?? null;
}

export async function createResidentSlide(input: ResidentCarouselSlideInput): Promise<ResidentCarouselSlide> {
  const slides = await readResidentSlides();
  const now = new Date().toISOString();
  const slide: ResidentCarouselSlide = {
    ...input,
    id: `rslide-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    order: slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 0,
    createdAt: now,
    updatedAt: now,
  };
  slides.push(slide);
  await writeJson(slides);
  return slide;
}

export async function updateResidentSlide(
  id: string,
  input: Partial<ResidentCarouselSlideInput>
): Promise<ResidentCarouselSlide | null> {
  const slides = await readResidentSlides();
  const idx = slides.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  slides[idx] = { ...slides[idx], ...input, updatedAt: new Date().toISOString() };
  await writeJson(slides);
  return slides[idx];
}

export async function deleteResidentSlide(id: string): Promise<boolean> {
  const slides = await readResidentSlides();
  const next = slides.filter((s) => s.id !== id);
  if (next.length === slides.length) return false;
  await writeJson(next);
  return true;
}

export async function moveResidentSlide(id: string, direction: "up" | "down"): Promise<boolean> {
  const slides = await readResidentSlides();
  const idx = slides.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= slides.length) return false;
  const a = slides[idx];
  const b = slides[swapWith];
  [a.order, b.order] = [b.order, a.order];
  await writeJson(slides);
  return true;
}
