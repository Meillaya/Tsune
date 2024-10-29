import { Suspense } from "react";
import { getTrendingAnime, getPopularThisSeason, getUpcomingNextSeason, getTopRatedAnime } from "@/lib/anilist";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AnimeGrid } from "@/components/anime-grid";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { AnimeSection } from "@/components/anime-section";

export default async function Home() {
  const [trending, popular, upcoming, topRated] = await Promise.all([
    getTrendingAnime(),
    getPopularThisSeason(),
    getUpcomingNextSeason(),
    getTopRatedAnime(),
  ]);

  return (
    <div className="space-y-8">
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedCarousel items={trending.slice(0, 6)} />
      </Suspense>

      <div className="container space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection title="Trending Now" anime={trending} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection title="Popular This Season" anime={popular} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection title="Upcoming Next Season" anime={upcoming} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection title="Top Rated" anime={topRated} />
        </Suspense>
      </div>
    </div>
  );
}