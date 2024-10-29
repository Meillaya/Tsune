import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/lib/anilist";
import { VideoPlayer } from "@/components/video-player";
import { LoadingSpinner } from "@/components/loading-spinner";

export default async function WatchPage({
  params,
}: {
  params: { animeId: string; episodeId: string };
}) {
  const anime = await getAnimeById(parseInt(params.animeId));

  if (!anime) {
    notFound();
  }

  const episodeNumber = parseInt(params.episodeId);
  if (isNaN(episodeNumber) || episodeNumber < 1 || episodeNumber > anime.episodes) {
    notFound();
  }

  return (
    <div className="container max-w-7xl py-4 space-y-8">
      <Suspense fallback={<LoadingSpinner />}>
        <VideoPlayer
          animeId={params.animeId}
          episodeId={params.episodeId}
          title={anime.title.english || anime.title.romaji}
          episodeNumber={episodeNumber}
          totalEpisodes={anime.episodes}
        />
      </Suspense>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">
            {anime.title.english || anime.title.romaji} - Episode {episodeNumber}
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