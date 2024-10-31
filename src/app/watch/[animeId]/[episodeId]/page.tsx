import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { VideoPlayer } from "@/components/video-player";
import { LoadingSpinner } from "@/components/loading-spinner";

export default async function WatchPage({
  params,
}: {
  params: { animeId: string; episodeId: string };
}) {
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
        <VideoPlayer
          animeId={params.animeId}
          episodeId={params.episodeId}
          title={anime.title?.english || anime.title?.romaji || ''}
          episodeNumber={episodeNumber}
          totalEpisodes={anime.episodes} listAnimeData={{
            id: null,
            mediaId: null,
            progress: undefined,
            media: {
              id: undefined,
              type: undefined,
              idMal: undefined,
              title: undefined,
              format: undefined,
              status: undefined,
              description: undefined,
              startDate: undefined,
              endDate: undefined,
              season: undefined,
              seasonYear: undefined,
              episodes: 0,
              duration: undefined,
              coverImage: undefined,
              bannerImage: undefined,
              genres: undefined,
              synonyms: undefined,
              averageScore: undefined,
              meanScore: undefined,
              popularity: undefined,
              favourites: undefined,
              isAdult: undefined,
              nextAiringEpisode: undefined,
              airingSchedule: undefined,
              mediaListEntry: undefined,
              siteUrl: undefined,
              trailer: undefined,
              relations: undefined,
              recommendations: undefined
            }
          }}        />
      </Suspense>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">
            {anime.title?.english || anime.title?.romaji} - Episode {episodeNumber}
          </h1>
          <p className="text-muted-foreground">
            {anime.description?.replace(/<[^>]*>/g, "")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Episode Information</h2>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Episode</span>
              <span>{episodeNumber} of {anime.episodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{anime.status}</span>
            </div>
            {anime.duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{anime.duration} mins</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
