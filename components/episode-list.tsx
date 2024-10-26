"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle } from "lucide-react";

interface EpisodeListProps {
  episodes: number;
  animeId: number;
}

export function EpisodeList({ episodes, animeId }: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 12;
  const totalPages = Math.ceil(episodes / episodesPerPage);
  
  const startEpisode = (currentPage - 1) * episodesPerPage + 1;
  const endEpisode = Math.min(currentPage * episodesPerPage, episodes);
  
  const currentEpisodes = Array.from(
    { length: endEpisode - startEpisode + 1 },
    (_, i) => startEpisode + i
  );

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
        {currentEpisodes.map((episode) => (
          <Card key={episode} className="overflow-hidden">
            <Link
              href={`/watch/${animeId}/${episode}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
            >
              <PlayCircle className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Episode {episode}</div>
                <div className="text-sm text-muted-foreground">24m</div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}