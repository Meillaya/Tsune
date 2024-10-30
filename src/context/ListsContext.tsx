"use client";

import { createContext, useContext, useState } from 'react';
import type { ListAnimeData, CurrentListAnime } from '@/types/anilistAPITypes';

interface ListsContextType {
  currentLists: CurrentListAnime;
  setCurrentLists: (lists: CurrentListAnime) => void;
  isListsLoading: boolean;
  setIsListsLoading: (loading: boolean) => void;
}

const ListsContext = createContext<ListsContextType | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [currentLists, setCurrentLists] = useState<CurrentListAnime>([]);
  const [isListsLoading, setIsListsLoading] = useState(true);

  return (
    <ListsContext.Provider value={{ currentLists, setCurrentLists, isListsLoading, setIsListsLoading }}>
      {children}
    </ListsContext.Provider>
  );
}

export const useLists = () => {
  const context = useContext(ListsContext);
  if (!context) throw new Error('useLists must be used within ListsProvider');
  return context;
};
