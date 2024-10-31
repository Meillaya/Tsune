import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { VideoPlayer } from "@/components/video-player";
import { LoadingSpinner } from "@/components/loading-spinner";
import WatchPageContent from "./WatchPageContent";

interface PageProps {
  params: {
    animeId: string;
    episodeId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WatchPage({ params }: PageProps) {
  try {
    const anime: Media = await getAnimeInfo(parseInt(params.animeId));

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