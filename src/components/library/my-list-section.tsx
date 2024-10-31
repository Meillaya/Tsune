"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/use-watchlist";
import { WatchlistGrid } from "@/components/watchlist/watchlist-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { WatchlistEntry } from "@/types/watchlist";

export function MyListSection() {
  const { isAuthenticated, lists } = useAuth();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [filteredList, setFilteredList] = useState<WatchlistEntry[]>([]);

  useEffect(() => {
    const entries = isAuthenticated ? lists : watchlist;
    const filtered = entries?.filter(item => 
      item.status !== "completed" && item.status !== "dropped"
    ) || [];
    setFilteredList(filtered);
  }, [isAuthenticated, lists, watchlist]);

  if (isWatchlistLoading) {
    return <LoadingSpinner />;
  }

  if (!filteredList.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Your list is empty</h3>
        <p className="text-muted-foreground">
          Add some anime to your list to see them here
        </p>
      </div>
    );
  }

  return <WatchlistGrid entries={filteredList} />;
}