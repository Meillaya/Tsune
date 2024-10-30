"use client";

import { useState, useEffect } from 'react';
import { AnimeSection } from './anime-section';
import type { Media } from '@/types/anilistGraphQLTypes';
import type { ListAnimeData } from '@/types/anilistAPITypes';
import { LoadingSpinner } from './loading-spinner';

export function ContinueWatchingSection() {
  const [currentlyWatching, setCurrentlyWatching] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the anime lists from localStorage
    const animeLists = localStorage.getItem('anime_lists');
    if (animeLists) {
      const lists: ListAnimeData[] = JSON.parse(animeLists);

      // Filter to get anime that are currently being watched
      const watching = lists
        .map((item) => item.media)
        .filter((media): media is Media => !!media); // Ensure media is not undefined

      setCurrentlyWatching(watching);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (currentlyWatching.length === 0) {
    return null; // Don't render anything if there are no anime to display
  }

  return (
    <AnimeSection title="Continue Watching" anime={currentlyWatching} />
  );
}
