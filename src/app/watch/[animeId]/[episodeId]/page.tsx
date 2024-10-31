import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import type { Media } from "@/types/anilistGraphQLTypes";
import { LoadingSpinner } from "@/components/loading-spinner";
import WatchPageContent from "./WatchPageContent";

interface PageProps {
  params: {
    animeId: string;
    episodeId: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WatchPage({ params }: PageProps) {
  try {
    const animeId = parseInt(params.animeId);
    if (isNaN(animeId)) {
      notFound();
    }

    const anime = await getAnimeInfo(animeId);
    if (!anime) {
      notFound();
    }

    const episodeNumber = parseInt(params.episodeId);
    if (isNaN(episodeNumber) || episodeNumber < 1 || episodeNumber > (anime.episodes || 0)) {
      notFound();
    }

    return (
      <div className="container max-w-7xl py-4 space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <WatchPageContent 
            anime={anime}
            episodeNumber={episodeNumber}
            animeId={params.animeId}
            episodeId={params.episodeId}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading anime:", error);
    notFound();
  }
}