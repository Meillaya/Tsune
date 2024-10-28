"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle } from "lucide-react";

interface Episode {
  title: {
    en: string;
  };
  image: string;
  runtime: number;
}

interface EpisodeMapping {
  episodes: {
    [key: string]: Episode;
  };
}

interface EpisodeListProps {
  episodes: number;
  animeId: number;
  coverImage: string;
  bannerImage?: string;
}

export function EpisodeList({ episodes, animeId, coverImage, bannerImage }: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [episodeData, setEpisodeData] = useState<EpisodeMapping | null>(null);
  const episodesPerPage = 12;
  const totalPages = Math.ceil(episodes / episodesPerPage);
  
  const startEpisode = (currentPage - 1) * episodesPerPage + 1;
  const endEpisode = Math.min(currentPage * episodesPerPage, episodes);
  
  const currentEpisodes = Array.from(
    { length: endEpisode - startEpisode + 1 },
    (_, i) => startEpisode + i
  );

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        const response = await fetch(`https://api.ani.zip/mappings?anilist_id=${animeId}`);
        const data = await response.json();
        setEpisodeData(data);
      } catch (error) {
        console.error("Error fetching episode data:", error);
      }
    };

    fetchEpisodeData();
  }, [animeId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Episodes</h2>
        {totalPages > 1 && (
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => setCurrentPage(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <SelectItem key={page} value={page.toString()}>
                  Page {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentEpisodes.map((episode) => {
          const episodeInfo = episodeData?.episodes[episode.toString()];
          // Use episode image first, then banner image, then cover image, then fallback
          const imageSource = episodeInfo?.image || bannerImage || coverImage || "/placeholder-episode.jpg";
          
          return (
            <Card key={episode} className="overflow-hidden">
              <Link
                href={`/watch/${animeId}/${episode}`}
                className="group relative flex flex-col transition-colors hover:bg-muted/50"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={imageSource}
                    alt={`Episode ${episode}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div>
                    <div className="font-medium">Episode {episode}</div>
                    <div className="text-sm text-muted-foreground">
                      {episodeInfo?.title?.en || `${episodeInfo?.runtime || 24}m`}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}