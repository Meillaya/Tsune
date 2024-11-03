"use client";

import { VideoPlayer } from "@/components/video-player";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { EpisodeNavigation } from "@/components/episode-navigation";
import { Media } from "@/types/anilistGraphQLTypes";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

interface WatchPageContentProps {
  anime: Media;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
}

export function WatchPageContent({ 
  anime, 
  animeId,
  episodeId,
  episodeNumber 
}: WatchPageContentProps) {
  useEffect(() => {
    console.log("Loading episode:", {
      animeId,
      episodeId,
      episodeNumber,
      animeTitle: anime.title?.english || anime.title?.romaji,
      totalEpisodes: anime.episodes
    });
  }, [animeId, episodeId, episodeNumber, anime]);

  // Calculate a reasonable episode range for pagination if needed
  const isLongRunning = !anime.episodes || anime.episodes > 100;
  const currentEpisodeRange = isLongRunning ? {
    start: Math.max(1, episodeNumber - 50),
    end: episodeNumber + 50
  } : {
    start: 1,
    end: anime.episodes || 1
  };

  return (
    <>
      <div className="relative">
        <VideoPlayer
          animeId={animeId}
          episodeId={episodeId}
          title={anime.title?.english || anime.title?.romaji || ""}
          episodeNumber={episodeNumber}
          totalEpisodes={anime.episodes || 9999} // Use a high number for ongoing series
          listAnimeData={{
            id: null,
            mediaId: null,
            progress: undefined,
            media: anime
          }}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">
            {anime.title?.english || anime.title?.romaji}
          </h1>
          
          <div className="flex flex-wrap gap-2">
            {anime.genres?.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>

          <p className="text-muted-foreground">
            {anime.description?.replace(/<[^>]*>/g, "")}
          </p>

          <div className="flex items-center gap-4">
            <WatchlistButton anime={anime} />
            <div className="text-sm text-muted-foreground">
              {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'} • {anime.duration} mins
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Episodes</h2>
          <EpisodeNavigation
            currentEpisode={episodeNumber}
            totalEpisodes={anime.episodes || 9999} // Use a high number for ongoing series
            animeId={parseInt(animeId)}
            episodeRange={currentEpisodeRange}
          />
        </Card>
      </div>
    </>
  );
}
