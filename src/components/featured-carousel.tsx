"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Anime } from "@/lib/anilist";

export function FeaturedCarousel({ items }: { items: Anime[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      clearInterval(autoplayInterval);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((anime) => (
            <div
              key={anime.id}
              className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] min-w-full flex-[0_0_100%]"
            >
              <div className="absolute inset-0">
                <Image
                  src={anime.bannerImage || anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  fill
                  className="object-cover brightness-50"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="container relative flex h-full items-end pb-12 sm:pb-16 lg:pb-24">
                <div className="max-w-3xl px-4 sm:px-6 lg:px-8">
                  <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {anime.title.english || anime.title.romaji}
                  </h1>
                  <p className="mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 text-base sm:text-lg text-muted-foreground">
                    {anime.description?.replace(/<[^>]*>/g, "")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Link href={`/anime/${anime.id}`}>
                      <Button size="lg" className="w-full sm:w-auto">
                        <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Watch Now
                      </Button>
                    </Link>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-2 right-2 sm:left-4 sm:right-4 top-1/2 flex -translate-y-1/2 justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-1.5 sm:h-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedIndex === index
                ? "bg-primary w-6 sm:w-8"
                : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50"
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}