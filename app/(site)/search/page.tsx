import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
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
      <PageHeader title="搜尋" subtitle="搜尋景點、店家、活動" />
      <Suspense>
        <Results q={q ?? ""} />
      </Suspense>
    </div>
  );
}
