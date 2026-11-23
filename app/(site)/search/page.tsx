import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import TouristPageHeader from "@/components/TouristPageHeader";
import SearchResults from "@/components/SearchResults";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";

// Result pages are thin, query-dependent duplicates of /spots and
// /businesses — keep them out of the index but let crawlers follow links.
export const metadata = pageMetadata({
  path: "/search",
  title: "搜尋大溪景點與店家",
  description: "搜尋大溪老街周邊的景點、美食與店家。",
  noindex: true,
});

export const dynamic = "force-dynamic";

async function Results({ q }: { q: string }) {
  const [rawPlaces, details, photos] = await Promise.all([getAllPlaces(), readDetails(), readPhotos()]);
  const places = filterVisiblePlaces(rawPlaces, details);
  return <SearchResults places={places} details={details} photos={photos} initialQuery={q} />;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div>
      <TouristPageHeader title="搜尋" subtitle="搜尋景點和店家" />
      <Suspense>
        <Results q={q ?? ""} />
      </Suspense>
    </div>
  );
}
