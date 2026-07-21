import { notFound } from "next/navigation";
import { getSlide } from "@/lib/carousel";
import CarouselSlideForm from "@/components/admin/CarouselSlideForm";

export const dynamic = "force-dynamic";

export default async function EditCarouselSlidePage({ params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const slide = await getSlide(slideId);
  if (!slide) notFound();
  return <CarouselSlideForm slide={slide} />;
}
