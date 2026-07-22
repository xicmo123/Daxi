import { notFound } from "next/navigation";
import { getSlide } from "@/lib/carousel";
import CarouselSlideForm from "@/components/admin/CarouselSlideForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const slide = await getSlide(eventId);
  if (!slide) notFound();
  return <CarouselSlideForm slide={slide} />;
}
