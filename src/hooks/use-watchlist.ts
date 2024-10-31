"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { WatchlistEntry, WatchStatus } from "@/types/watchlist";
import { updateAnimeFromList, deleteAnimeFromList } from "@/modules/anilist/anilistsAPI";

export function useWatchlist() {
  const { isAuthenticated, lists, updateLists } = useAuth();
  const [localWatchlist, setLocalWatchlist] = useLocalStorage<WatchlistEntry[]>("watchlist", []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sync local watchlist with AniList data when user logs in
    if (isAuthenticated && lists) {
      const syncedList = lists.map(item => ({
        id: item.mediaId || item.media.id,
        status: (item.status?.toLowerCase() || "watching") as WatchStatus,
        progress: item.progress || 0,
        media: {
          id: item.media.id,
          title: item.media.title,
          coverImage: item.media.coverImage,
          episodes: item.media.episodes,
          genres: item.media.genres,
        },
        updatedAt: Date.now(),
      }));
      setLocalWatchlist(syncedList);
    }
    setIsLoading(false);
  }, [isAuthenticated, lists]);

  const addToWatchlist = async (entry: WatchlistEntry) => {
    if (isAuthenticated) {
      // Update AniList
      const mediaListId = await updateAnimeFromList(
        entry.id,
        entry.status.toUpperCase(),
        undefined,
        entry.progress
      );
      
      if (mediaListId) {
        // Update local state to match AniList
        const updatedLists = lists?.map(item => 
          item.mediaId === entry.id ? { ...item, status: entry.status.toUpperCase() } : item
        ) || [];
        updateLists(updatedLists);
      }
    } else {
      // Update local storage
      const existingIndex = localWatchlist.findIndex(item => item.id === entry.id);
      if (existingIndex >= 0) {
        const newList = [...localWatchlist];
        newList[existingIndex] = entry;
        setLocalWatchlist(newList);
      } else {
        setLocalWatchlist([...localWatchlist, entry]);
      }
    }
  };

  const removeFromWatchlist = async (animeId: number) => {
    if (isAuthenticated) {
      // Remove from AniList
      const success = await deleteAnimeFromList(animeId);
      if (success) {
        // Update local state
        const updatedLists = lists?.filter(item => item.mediaId !== animeId) || [];
        updateLists(updatedLists);
      }
    } else {
      // Remove from local storage
      setLocalWatchlist(localWatchlist.filter(item => item.id !== animeId));
    }
  };

  const getStatus = (animeId: number): WatchStatus | null => {
    if (isAuthenticated) {
      const entry = lists?.find(item => item.mediaId === animeId);
      return entry ? (entry.status?.toLowerCase() as WatchStatus) : null;
    } else {
      const entry = localWatchlist.find(item => item.id === animeId);
      return entry ? entry.status : null;
    }
  };

  return {
    watchlist: isAuthenticated ? lists : localWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getStatus,
    isLoading,
  };
}