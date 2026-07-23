import { readResidentSlides } from "@/lib/residentCarousel";
import ResidentCarouselList from "@/components/admin/ResidentCarouselList";

export const dynamic = "force-dynamic";

export default async function ResidentCarouselDashboard() {
  const slides = await readResidentSlides();
  return <ResidentCarouselList slides={slides} />;
}
