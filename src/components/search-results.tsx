"use client";

import { useEffect, useState } from "react";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { Anime } from "@/lib/anilist";

async function searchAnime(query: string): Promise<Anime[]> {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          Page(page: 1, perPage: 24) {
            media(type: ANIME, search: $search) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
                medium
              }
              bannerImage
              description
              episodes
              status
              genres
              averageScore
              popularity
            }
          }
        }
      `,
      variables: { search: query },
    }),
  });

  const { data } = await response.json();
  return data?.Page?.media || [];
}

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await searchAnime(query);
        setResults(data);
      } catch (error) {
        console.error("Error searching anime:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No results found for "{query}"
      </div>
    );
  }

  return <AnimeGrid anime={results} />;
}