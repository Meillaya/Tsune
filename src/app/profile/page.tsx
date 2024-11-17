"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { WatchlistGrid } from "@/components/watchlist/watchlist-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getViewerLists, getViewerInfo } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";
import type { AnimeListEntry } from "@/types/auth";
import { formatDate, formatNumber } from "@/lib/utils";


interface ProfileStats {
  totalEpisodes: number;
  totalAnime: number;
  daysWatched: number;
  totalChapters: number;
  totalManga: number;
}

export default function ProfilePage() {
  const { isAuthenticated, user, lists, login, logout, updateLists, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"anime" | "manga">("anime");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [currentList, setCurrentList] = useState<"CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING">('CURRENT');

  const filteredLists = lists.filter(item => item.status === currentList);


  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthenticated && user) {
        const viewerId = parseInt(sessionStorage.getItem("viewer_id") || "0");
        if (!viewerId) return;

        try {
          const viewerInfo = await getViewerInfo(viewerId);
          
          setStats({
            totalEpisodes: viewerInfo.statistics?.anime?.episodes_watched || 0,
            totalAnime: viewerInfo.statistics?.anime?.count || 0,
            daysWatched: viewerInfo.statistics?.anime?.mean_score || 0,
            totalChapters: viewerInfo.statistics?.manga?.chapters_read || 0,
            totalManga: viewerInfo.statistics?.manga?.count || 0,
          });
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        }

      }
    };


    fetchStats();
  }, [isAuthenticated, user, lists]);

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4">Connect to AniList to view your profile</h2>
          <Button onClick={() => setIsLoginDialogOpen(true)}>Connect with AniList</Button>
          <LoginDialog
            isOpen={isLoginDialogOpen}
            onOpenChange={setIsLoginDialogOpen}
            onLogin={login}
            isLoading={authLoading}
            error={null} // Pass the actual error from auth state if needed
          />
        </div>
      </div>
    );
  }

  if (authLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <div className="relative h-24 w-24 mb-4">
              <Image
                src={user.avatar?.medium || ""}
                alt={user.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">
              Created At: {formatDate(user.createdAt)}
            </p>

            <div className="mt-6 space-y-2 w-full">
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Total Episodes</span>
                <span>{formatNumber(stats?.totalEpisodes || 0)}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Total Anime</span>
                <span>{formatNumber(stats?.totalAnime || 0)}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Mean Score</span>
                <span>{stats?.daysWatched.toFixed(2) || 0}</span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Total Chapters Read</span>
                <span>{formatNumber(stats?.totalChapters || 0)}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Total Manga</span>
                <span>{formatNumber(stats?.totalManga || 0)}</span>
              </div>
            </div>


            <Button onClick={logout} variant="outline" className="mt-8">
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <Tabs defaultValue="anime" value={activeTab} onValueChange={(value: "anime" | "manga") => setActiveTab(value)} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="anime">Anime Lists</TabsTrigger>
              <TabsTrigger value="manga">Manga Lists</TabsTrigger>
            </TabsList>
            <TabsContent value="anime">
              {lists && (
                <>
                <select value={currentList} onChange={e => setCurrentList(e.target.value as any)}>
                  <option value="CURRENT">Currently Watching</option>
                  <option value="PLANNING">Plan to Watch</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="PAUSED">Paused</option>
                  <option value="REPEATING">Rewatching</option>
                </select>
                <WatchlistGrid entries={filteredLists as any} />
                </>
              )}
            </TabsContent>
            <TabsContent value="manga">
              <p>Manga list implementation coming soon!</p>
            </TabsContent>
          </Tabs>
        </Card>

      </div>
    </div>
  );
}