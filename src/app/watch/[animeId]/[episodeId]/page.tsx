import { use } from "react";
import { notFound } from "next/navigation";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { WatchPageContent } from "./WatchPageContent";
import { LoadingSpinner } from "@/components/loading-spinner";

interface PageProps {
  params: Promise<{
    animeId: string;
    episodeId: string;
  }>;
}

export default function WatchPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const animeId = parseInt(resolvedParams.animeId);
  const episodeNumber = parseInt(resolvedParams.episodeId);

  if (isNaN(animeId) || isNaN(episodeNumber)) {
    notFound();
  }

  async function loadAnime(): Promise<Media> {
    try {
      const data = await getAnimeInfo(animeId);
      if (!data || episodeNumber < 1 || episodeNumber > (data.episodes || 0)) {
        notFound();
      }
      return data;
    } catch (error) {
      console.error("Error loading anime:", error);
      throw error;
    }
  }

  const anime = use(loadAnime());

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl space-y-8 py-6">
        <WatchPageContent 
          anime={anime} 
          animeId={resolvedParams.animeId}
          episodeId={resolvedParams.episodeId}
          episodeNumber={episodeNumber}
        />
      </div>
    </div>
  );
}