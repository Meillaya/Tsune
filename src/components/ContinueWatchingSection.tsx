"use client";

import { useEffect } from 'react';
import { AnimeSection } from './anime-section';
import { LoadingSpinner } from './loading-spinner';
import { useLists } from '@/context/ListsContext';
import { ListAnimeData } from '@/types/anilistAPITypes';

export function ContinueWatchingSection() {
  const { currentLists, isListsLoading } = useLists();

  if (isListsLoading) {
    return <LoadingSpinner />;
  }
  console.log(currentLists)
  if (!currentLists || currentLists.length === 0) {
    return null;
  }

  return (
    <div className="section-container">
      <AnimeSection 
        title="Continue Watching" 
        animeData={() => {}}
        anime={currentLists.map(item => item.media)} 
      />
    </div>
  );
}
