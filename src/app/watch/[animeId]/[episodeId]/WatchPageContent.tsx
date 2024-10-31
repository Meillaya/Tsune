"use client";

import dynamic from 'next/dynamic';
import type { Media } from "@/types/anilistGraphQLTypes";

const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

interface WatchPageContentProps {
  anime: Media;
  episodeNumber: number;
  animeId: string;
  episodeId: string;
}

export default function WatchPageContent({
  anime,
  episodeNumber,
  animeId,
  episodeId
}: WatchPageContentProps) {
  return (
    <>
      <VideoPlayer
        animeId={animeId}
        episodeId={episodeId}
        title={anime.title?.english || anime.title?.romaji || ''}
        episodeNumber={episodeNumber}
        totalEpisodes={anime.episodes || 0}
        listAnimeData={{
          id: null,
          mediaId: null,
          progress: undefined,
          media: anime
        }}
      />

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
    </>
  );
}