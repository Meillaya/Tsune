import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SearchResults } from "@/components/search-results";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        Search Results for &quot;{searchParams.q}&quot;
      </h1>
      <Suspense fallback={<LoadingSpinner />}>
        <SearchResults query={searchParams.q} />
      </Suspense>
    </div>
  );
}