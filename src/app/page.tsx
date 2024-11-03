import { Suspense } from "react";
import { 
  getTrendingAnime, 
  getMostPopularAnime,
  searchFilteredAnime 
} from "@/modules/anilist/anilistsAPI";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { AnimeSection } from "@/components/anime-section";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  try {
    const [trending, popular, topRated] = await Promise.all([
      getTrendingAnime(null),
      searchFilteredAnime("type: ANIME, sort: POPULARITY_DESC, season: FALL, seasonYear: 2024, status: RELEASING", null),
      getMostPopularAnime(null)
    ]);

    return {
      trending: trending?.media || [],
      popular: popular?.media || [],
      topRated: topRated?.media || []
    };
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return {
      trending: [],
      popular: [],
      topRated: []
    };
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background pointer-events-none" />
      
      <section className="relative w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedCarousel items={data.trending.slice(0, 12)} />
        </Suspense>
      </section>

      <section className="relative z-10 container space-y-12 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ContinueWatchingSection />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Trending Now" 
            anime={data.trending} 
          />
        </Suspense>
  
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Popular This Season" 
            anime={data.popular} 
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Top Rated" 
            anime={data.topRated} 
          />
        </Suspense>
      </section>
    </div>
  );
}
