import { notFound } from "next/navigation";
import { getResidentSlide } from "@/lib/residentCarousel";
import ResidentCarouselSlideForm from "@/components/admin/ResidentCarouselSlideForm";

export const dynamic = "force-dynamic";

export default async function EditResidentCarouselSlidePage({ params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const slide = await getResidentSlide(slideId);
  if (!slide) notFound();
  return <ResidentCarouselSlideForm slide={slide} />;
}
