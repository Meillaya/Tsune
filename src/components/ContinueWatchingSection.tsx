"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

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
  const [recentlyWatched, setRecentlyWatched] = useState<WatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && lists) {
      // Get recently watched from AniList data
      const watched = lists
        .filter(item => item.progress && item.progress > 0)
        .map(item => ({
          animeId: item.media.id,
          episodeNumber: item.progress || 0,
          timestamp: Date.now(), // AniList doesn't provide timestamp
          progress: 100, // AniList doesn't provide episode progress
          duration: 24 * 60, // Default episode length in seconds
          title: item.media.title?.english || item.media.title?.romaji || '',
          coverImage: item.media.coverImage?.large || '',
          totalEpisodes: item.media.episodes
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 12);

      setRecentlyWatched(watched);
    } else {
      // Get recently watched from local storage
      const watched = Object.values(watchProgress)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 12);

      setRecentlyWatched(watched);
    }
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Continue Watching</h2>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recentlyWatched.map((item) => (
          <Link 
            key={`${item.animeId}-${item.episodeNumber}`}
            href={`/watch/${item.animeId}/${item.episodeNumber + 1}`}
          >
            <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="relative aspect-video group">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <h3 className="font-medium line-clamp-1">{item.title}</h3>
                <div className="text-sm text-muted-foreground">
                  Episode {item.episodeNumber}
                  {item.totalEpisodes && ` of ${item.totalEpisodes}`}
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={item.progress} 
                    className="h-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(item.duration * (item.progress / 100))}</span>
                    <span>{formatTime(item.duration)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}