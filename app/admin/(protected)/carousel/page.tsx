import { readSlides } from "@/lib/carousel";
import CarouselList from "@/components/admin/CarouselList";

export const dynamic = "force-dynamic";

export default async function CarouselDashboard() {
  const slides = await readSlides();
  return <CarouselList slides={slides} />;
}
