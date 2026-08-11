// Admin-editable banner strip shown at the top of the resident home
// ("長條輪播") — same JSON-file-on-disk pattern as lib/carousel.ts, but
// deliberately lean (no photos/phases/badges): residents rotate through
// short announcement banners, not festival hero cards.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";
import { getResidentFeature, type ResidentFeatureKey } from "./residentFeatures";

const DATA_PATH = dataPath("resident-carousel-slides.json");

export type ResidentSlideTag = "一般" | "緊急" | "活動";
export type ResidentSlideKind = "custom" | "feature";

export type ResidentCarouselSlide = {
  id: string;
  order: number;
  active: boolean;
  kind?: ResidentSlideKind;
  featureKey?: ResidentFeatureKey;
  tag: ResidentSlideTag;
  title: string;
  subtitle?: string;
  href?: string;
  createdAt: string;
  updatedAt: string;
};

export type ResidentCarouselSlideInput = {
  active: boolean;
  kind?: ResidentSlideKind;
  featureKey?: ResidentFeatureKey;
  tag: ResidentSlideTag;
  title: string;
  subtitle?: string;
  href?: string;
};

export function resolveResidentSlide(slide: ResidentCarouselSlide): ResidentCarouselSlide {
  if ((slide.kind ?? "custom") !== "feature") return slide;
  const feature = getResidentFeature(slide.featureKey);
  if (!feature) return slide;
  return {
    ...slide,
    tag: slide.tag ?? feature.tag,
    title: slide.title || feature.title,
    subtitle: slide.subtitle || feature.subtitle,
    href: slide.href || feature.href,
  };
}

function sorted(slides: ResidentCarouselSlide[]): ResidentCarouselSlide[] {
  return [...slides].sort((a, b) => a.order - b.order);
}

export async function readResidentSlides(): Promise<ResidentCarouselSlide[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return sorted(Array.isArray(data) ? (data as ResidentCarouselSlide[]) : []);
}

export async function listActiveResidentSlides(): Promise<ResidentCarouselSlide[]> {
  const slides = await readResidentSlides();
  return slides.filter((s) => s.active).map(resolveResidentSlide);
}

export async function getResidentSlide(id: string): Promise<ResidentCarouselSlide | null> {
  const slides = await readResidentSlides();
  return slides.find((s) => s.id === id) ?? null;
}

export async function createResidentSlide(input: ResidentCarouselSlideInput): Promise<ResidentCarouselSlide> {
  return mutateJsonList<ResidentCarouselSlide, ResidentCarouselSlide>(DATA_PATH, (records) => {
    const slides = sorted(records);
    const now = new Date().toISOString();
    const slide: ResidentCarouselSlide = {
      ...input,
      id: `rslide-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      order: slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 0,
      createdAt: now,
      updatedAt: now,
    };
    return { next: [...slides, slide], result: slide };
  });
}

export async function updateResidentSlide(
  id: string,
  input: Partial<ResidentCarouselSlideInput>
): Promise<ResidentCarouselSlide | null> {
  return mutateJsonList<ResidentCarouselSlide, ResidentCarouselSlide | null>(DATA_PATH, (records) => {
    const slides = sorted(records);
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return { next: slides, result: null };
    const updated = { ...slides[idx], ...input, updatedAt: new Date().toISOString() };
    const next = [...slides];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteResidentSlide(id: string): Promise<boolean> {
  return mutateJsonList<ResidentCarouselSlide, boolean>(DATA_PATH, (slides) => {
    const next = slides.filter((s) => s.id !== id);
    return { next, result: next.length !== slides.length };
  });
}

export async function moveResidentSlide(id: string, direction: "up" | "down"): Promise<boolean> {
  return mutateJsonList<ResidentCarouselSlide, boolean>(DATA_PATH, (records) => {
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
