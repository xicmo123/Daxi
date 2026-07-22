// Server-only data layer for the home page's event carousel. Same
// JSON-file-on-disk pattern as placesStore.ts — admin-editable, no rebuild
// needed for edits to show up.
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SLIDES_PATH = path.join(DATA_DIR, "carousel-slides.json");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "carousel");

export type CarouselPhoto = {
  src: string;
  author?: string;
  sourceUrl?: string;
  historical?: boolean; // photo predates the event, shown as illustrative only
};

export type CarouselSlide = {
  id: string;
  order: number;
  showInCarousel?: boolean;
  date: string;
  isoDate?: string; // set only for single-day slides (drives "today's" auto-select)
  phase: "past" | "ongoing" | "upcoming";
  time: string;
  title: string;
  desc: string;
  history?: string;
  theme?: string;
  badges?: ("route" | "live")[];
  ctaLabel?: string;
  ctaUrl?: string;
  photo?: CarouselPhoto;
  createdAt: string;
  updatedAt: string;
};

export type CarouselSlideInput = Omit<CarouselSlide, "id" | "order" | "createdAt" | "updatedAt" | "photo">;

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readSlides(): Promise<CarouselSlide[]> {
  const slides = await readJson<CarouselSlide[]>(SLIDES_PATH, []);
  return [...slides].sort((a, b) => a.order - b.order);
}

export function isSlideInCarousel(slide: CarouselSlide): boolean {
  return slide.showInCarousel !== false;
}

export async function getSlide(id: string): Promise<CarouselSlide | null> {
  const slides = await readSlides();
  return slides.find((s) => s.id === id) ?? null;
}

export async function createSlide(input: CarouselSlideInput): Promise<CarouselSlide> {
  const slides = await readSlides();
  const now = new Date().toISOString();
  const slide: CarouselSlide = {
    ...input,
    id: `slide-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    order: slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 0,
    createdAt: now,
    updatedAt: now,
  };
  slides.push(slide);
  await writeJson(SLIDES_PATH, slides);
  return slide;
}

export async function updateSlide(
  id: string,
  input: Partial<CarouselSlideInput> & { photo?: CarouselPhoto | null }
): Promise<CarouselSlide | null> {
  const slides = await readSlides();
  const idx = slides.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const { photo, ...rest } = input;
  slides[idx] = {
    ...slides[idx],
    ...rest,
    ...(photo !== undefined ? { photo: photo ?? undefined } : {}),
    updatedAt: new Date().toISOString(),
  };
  await writeJson(SLIDES_PATH, slides);
  return slides[idx];
}

export async function deleteSlide(id: string): Promise<boolean> {
  const slides = await readSlides();
  const target = slides.find((s) => s.id === id);
  if (!target) return false;
  const next = slides.filter((s) => s.id !== id);
  await writeJson(SLIDES_PATH, next);
  if (target.photo?.src?.startsWith("/api/uploads/carousel/")) {
    const filename = target.photo.src.slice("/api/uploads/carousel/".length);
    await fs.unlink(path.join(IMAGES_DIR, filename)).catch(() => {});
  }
  return true;
}

export async function moveSlide(id: string, direction: "up" | "down"): Promise<boolean> {
  const slides = await readSlides();
  const idx = slides.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= slides.length) return false;
  const a = slides[idx];
  const b = slides[swapWith];
  [a.order, b.order] = [b.order, a.order];
  await writeJson(SLIDES_PATH, slides);
  return true;
}
