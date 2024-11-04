"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Media } from "@/types/anilistGraphQLTypes";
import { AnimeSection } from './anime-section';
import { Card } from './ui/card';

interface WatchProgress {
  animeId: number;
  episodeNumber: number;
  timestamp: number;
  progress: number;
  duration: number;
  title: string;
  coverImage: string;
  totalEpisodes?: number;
}

export function ContinueWatchingSection() {
  const { isAuthenticated, lists } = useAuth();
  const [watchProgress] = useLocalStorage<Record<string, WatchProgress>>("watch-progress", {});
  const [recentlyWatched, setRecentlyWatched] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uniqueAnimeIds = new Set();
    let watched: WatchProgress[] = [];

    if (isAuthenticated && lists) {
      watched = lists
        .filter(item => item.progress !== null)
        .sort((a, b) => {
          // Sort by progress in descending order
          if (a.progress && b.progress) {
            return b.progress - a.progress;
          }
          return 0;
        })
        .map(item => ({
          animeId: item.media.id,
          episodeNumber: item.progress || 0,
          timestamp: Date.now(),
          progress: 100,
          duration: 24 * 60,
          title: item.media.title?.english || item.media.title?.romaji || '',
          coverImage: item.media.coverImage?.large || '',
          totalEpisodes: item.media.episodes
        }))

    } else {
      watched = Object.values(watchProgress)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 12);
    }

    // Convert WatchProgress to Media format
    const mediaList: Media[] = watched.map(item => ({
      id: item.animeId,
      title: {
        english: item.title,
        romaji: item.title
      },
      coverImage: {
        large: item.coverImage
      },
      description: `Episode ${item.episodeNumber}${item.totalEpisodes ? ` of ${item.totalEpisodes}` : ''}`,
      episodes: item.totalEpisodes || 0
    }));

    setRecentlyWatched(mediaList);
    setIsLoading(false);
  }, [isAuthenticated, lists, watchProgress]);
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!recentlyWatched.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No watched anime yet</h3>
        <p className="text-muted-foreground">
          Start watching anime to track your progress
        </p>
      </div>
    );
  }

  return (
    <AnimeSection 
      title="Continue Watching" 
      anime={recentlyWatched}
      animeData={() => {}}
    />
  );
}
