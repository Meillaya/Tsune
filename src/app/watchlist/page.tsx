"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WatchlistGrid } from "@/components/watchlist/watchlist-grid";
import { WatchlistFilters } from "@/components/watchlist/watchlist-filters";
import { WatchlistStats } from "@/components/watchlist/watchlist-stats";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { WatchStatus, WatchlistEntry } from "@/types/watchlist";

export const dynamic = 'force-dynamic';

export default function WatchlistPage() {
  const { isAuthenticated, user, lists } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [status, setStatus] = useState<WatchStatus>("watching");
  const [localWatchlist, setLocalWatchlist] = useLocalStorage<WatchlistEntry[]>("watchlist", []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sync local watchlist with AniList data when user logs in
    if (isAuthenticated && lists) {
      const syncedList = lists.map(item => ({
        id: item.mediaId || item.media.id,
        status: (item.status || "watching") as WatchStatus,
        progress: item.progress || 0,
        media: item.media,
        updatedAt: Date.now()
      }));
      setLocalWatchlist(syncedList);
    }
    setIsLoading(false);
  }, [isAuthenticated, lists, setLocalWatchlist]);

  const filteredList = (isAuthenticated ? lists : localWatchlist)
    ?.filter(item => item.status === status)
    .map(item => ({
      ...item,
      updatedAt: item.updatedAt || Date.now()
    })) || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        {!isAuthenticated && (
          <Button onClick={() => setIsLoginDialogOpen(true)}>
            Connect with AniList
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <WatchlistFilters 
            currentStatus={status} 
            onStatusChange={setStatus}
          />
          <WatchlistGrid entries={filteredList} />
        </div>

        <div className="space-y-6">
          <WatchlistStats 
            entries={isAuthenticated ? lists.map(item => ({
              ...item,
              updatedAt: item.updatedAt || Date.now()
            })) : localWatchlist} 
          />
        </div>
      </div>

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