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

export default async function Home() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingAnime(null).then(data => data.media || []),
    searchFilteredAnime("type: ANIME, sort: POPULARITY_DESC, season: FALL, seasonYear: 2024, status: RELEASING", null).then(data => data.media || []),
    getMostPopularAnime(null).then(data => data.media || []),
  ]);

    return (
      <div className="space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedCarousel items={trending.slice(0, 6)} />
        </Suspense>
=
        <div className="container space-y-12">

          
          <Suspense fallback={<LoadingSpinner />}>
              <ContinueWatchingSection />
          </Suspense>
          
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection title="Trending Now" anime={trending} />
          </Suspense>
    
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection title="Popular This Season" anime={popular} />
          </Suspense>
  
    
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection title="Top Rated" anime={topRated} />
          </Suspense>
        </div>
      </div>
    );
    
}
