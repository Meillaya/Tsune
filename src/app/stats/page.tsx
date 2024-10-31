"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StatsOverview } from "@/components/stats/stats-overview";
import { GenreDistribution } from "@/components/stats/genre-distribution";
import { WatchHistory } from "@/components/stats/watch-history";
import { RatingDistribution } from "@/components/stats/rating-distribution";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { useWatchlist } from "@/hooks/use-watchlist";

export const fetchCache = 'force-no-store';

export default function StatsPage() {
  const { isAuthenticated, lists } = useAuth();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { isLoading: isProgressLoading } = useWatchProgress();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  // Use local watchlist if not authenticated, otherwise use AniList data
  const entries = isAuthenticated ? lists : watchlist;

  // Show loading state only during initial data fetch
  if (isWatchlistLoading || isProgressLoading) {
    return <LoadingSpinner />;
  }

  // Calculate stats from available data
  const totalAnime = entries?.length || 0;
  const totalEpisodes = entries?.reduce((sum, item) => sum + (item.progress || 0), 0) || 0;
  const averageScore = entries?.reduce((sum, item) => {
    const score = isAuthenticated 
      ? item.media.averageScore 
      : item.media.averageScore;
    return sum + (score || 0);
  }, 0) / (totalAnime || 1);
  
  // Estimate watch time (24 minutes per episode)
  const watchTime = (totalEpisodes * 24) / 60;

  // Generate genre distribution data
  const genreMap = new Map<string, number>();
  entries?.forEach(item => {
    item.media.genres?.forEach(genre => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });
  
  const genreData = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Generate rating distribution data
  const ratingMap = new Map<number, number>();
  entries?.forEach(item => {
    const score = isAuthenticated 
      ? item.media.averageScore 
      : item.media.averageScore;
    if (score) {
      const rating = Math.floor(score / 10);
      ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
    }
  });
  
  const ratingData = Array.from(ratingMap.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating);

  // Generate watch history data (last 30 days)
  const watchHistoryData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString(),
      episodes: Math.floor(Math.random() * 5), // Replace with actual watch history data
    };
  }).reverse();

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Statistics</h1>
        {!isAuthenticated && (
          <Button onClick={() => setIsLoginDialogOpen(true)}>
            Connect with AniList
          </Button>
        )}
      </div>

      <StatsOverview
        totalAnime={totalAnime}
        totalEpisodes={totalEpisodes}
        averageScore={averageScore}
        watchTime={watchTime}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <WatchHistory data={watchHistoryData} />
        <RatingDistribution data={ratingData} />
      </div>

      <GenreDistribution data={genreData} />

      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onLogin={async () => false}
        isLoading={false}
        error={null}
      />
    </div>
  );
}