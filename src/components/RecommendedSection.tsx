"use client";

import { AnimeSection } from './anime-section';
import { useHistory } from '@/context/HistoryContext';
import { LoadingSpinner } from './loading-spinner';

export function RecommendedSection() {
  const { recommendedAnime } = useHistory();

  if (!recommendedAnime) {
    return <LoadingSpinner />;
  }

  if (recommendedAnime.length === 0) {
    return null;
  }

  return (
    <AnimeSection title="Recommended For You" anime={recommendedAnime.map(item => item.media)} />
  );
}
