import { Suspense } from "react";
import PageHeaderT from "@/components/PageHeaderT";
import SearchResults from "@/components/SearchResults";
import { getAllPlaces, filterVisiblePlaces, readDetails, readPhotos } from "@/lib/placesStore";

export const dynamic = "force-dynamic";

async function Results({ q }: { q: string }) {
  const [rawPlaces, details, photos] = await Promise.all([getAllPlaces(), readDetails(), readPhotos()]);
  const places = filterVisiblePlaces(rawPlaces, details);
  return <SearchResults places={places} details={details} photos={photos} initialQuery={q} />;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div className="pt-2">
      <PageHeaderT titleKey="searchTitle" subtitleKey="searchPlaceholder" />
      <Suspense>
        <Results q={q ?? ""} />
      </Suspense>
    </div>
  );
}
