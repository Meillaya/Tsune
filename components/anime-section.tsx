"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeGrid } from "@/components/anime-grid";
import type { Anime } from "@/lib/anilist";

interface AnimeSectionProps {
  title: string;
  anime: Anime[];
}

export function AnimeSection({ title, anime }: AnimeSectionProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(anime.length / itemsPerPage);

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const currentAnime = anime.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <section className="px-4 sm:px-6 flex-col items-center w-full max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPage}
            disabled={totalPages <= 1}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={totalPages <= 1}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
      <AnimeGrid anime={currentAnime} />
    </section>
  );
}