// Server-only data layer for the home page's event carousel. Same
// JSON-file-on-disk pattern as placesStore.ts — admin-editable, no rebuild
// needed for edits to show up.
import { promises as fs } from "fs";
import path from "path";
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";

const SLIDES_PATH = dataPath("carousel-slides.json");
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

function sorted(slides: CarouselSlide[]): CarouselSlide[] {
  return [...slides].sort((a, b) => a.order - b.order);
}

export async function readSlides(): Promise<CarouselSlide[]> {
  const data = await readJsonFile<unknown>(SLIDES_PATH, []);
  return sorted(Array.isArray(data) ? (data as CarouselSlide[]) : []);
}

export function isSlideInCarousel(slide: CarouselSlide): boolean {
  return slide.showInCarousel !== false;
}

export async function getSlide(id: string): Promise<CarouselSlide | null> {
  const slides = await readSlides();
  return slides.find((s) => s.id === id) ?? null;
}

export async function createSlide(input: CarouselSlideInput): Promise<CarouselSlide> {
  return mutateJsonList<CarouselSlide, CarouselSlide>(SLIDES_PATH, (records) => {
    const slides = sorted(records);
    const now = new Date().toISOString();
    const slide: CarouselSlide = {
      ...input,
      id: `slide-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      order: slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 0,
      createdAt: now,
      updatedAt: now,
    };
    return { next: [...slides, slide], result: slide };
  });
}

export async function updateSlide(
  id: string,
  input: Partial<CarouselSlideInput> & { photo?: CarouselPhoto | null }
): Promise<CarouselSlide | null> {
  return mutateJsonList<CarouselSlide, CarouselSlide | null>(SLIDES_PATH, (records) => {
    const slides = sorted(records);
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return { next: slides, result: null };
    const { photo, ...rest } = input;
    const updated: CarouselSlide = {
      ...slides[idx],
      ...rest,
      ...(photo !== undefined ? { photo: photo ?? undefined } : {}),
      updatedAt: new Date().toISOString(),
    };
    const next = [...slides];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteSlide(id: string): Promise<boolean> {
  const target = await mutateJsonList<CarouselSlide, CarouselSlide | null>(SLIDES_PATH, (slides) => {
    const found = slides.find((s) => s.id === id) ?? null;
    if (!found) return { next: slides, result: null };
    return { next: slides.filter((s) => s.id !== id), result: found };
  });
  if (!target) return false;
  // Only unlink after the record is gone: if the delete had failed we would
  // otherwise have removed the file out from under a slide that still exists.
  if (target.photo?.src?.startsWith("/api/uploads/carousel/")) {
    const filename = target.photo.src.slice("/api/uploads/carousel/".length);
    await fs.unlink(path.join(IMAGES_DIR, filename)).catch(() => {});
  }
  return true;
}

export async function moveSlide(id: string, direction: "up" | "down"): Promise<boolean> {
  return mutateJsonList<CarouselSlide, boolean>(SLIDES_PATH, (records) => {
    const slides = sorted(records).map((s) => ({ ...s }));
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return { next: slides, result: false };
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= slides.length) return { next: slides, result: false };
    const a = slides[idx];
    const b = slides[swapWith];
    [a.order, b.order] = [b.order, a.order];
    return { next: slides, result: true };
  });
}
