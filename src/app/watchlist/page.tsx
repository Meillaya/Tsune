"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WatchlistGrid } from "@/components/watchlist/watchlist-grid";
import { WatchlistFilters } from "@/components/watchlist/watchlist-filters";
import { WatchlistStats } from "@/components/watchlist/watchlist-stats";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { WatchStatus } from "@/types/watchlist";

export const dynamic = 'force-dynamic';

export default function WatchlistPage() {
  const { isAuthenticated } = useAuth();
  const { watchlist, isLoading } = useWatchlist();
  const [status, setStatus] = useState<WatchStatus>("watching");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const filteredList = watchlist?.filter(item => 
    item.status?.toLowerCase() === status
  ) || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Watchlist</h1>
        {!isAuthenticated && (
          <Button onClick={() => setIsLoginDialogOpen(true)}>
            Connect with AniList
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <WatchlistFilters 
            currentStatus={status} 
            onStatusChange={setStatus}
          />
          <WatchlistGrid entries={filteredList} />
        </div>

        <div>
          <WatchlistStats entries={watchlist || []} />
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