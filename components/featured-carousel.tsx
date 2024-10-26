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

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        if (!nextBtnDisabled) {
          emblaApi.scrollNext();
        }
      }, 5000);

      return () => clearInterval(autoplay);
    }
  }, [emblaApi, nextBtnDisabled]);

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((anime) => (
            <div
              key={anime.id}
              className="relative h-[70vh] min-w-full flex-[0_0_100%]"
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
              <div className="container relative flex h-full items-end pb-24">
                <div className="max-w-2xl">
                  <h1 className="mb-4 text-4xl font-bold">
                    {anime.title.english || anime.title.romaji}
                  </h1>
                  <p className="mb-6 line-clamp-3 text-lg text-muted-foreground">
                    {anime.description?.replace(/<[^>]*>/g, "")}
                  </p>
                  <div className="flex gap-4">
                    <Link href={`/anime/${anime.id}`}>
                      <Button size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Watch Now
                      </Button>
                    </Link>
                    <Button size="lg" variant="secondary">
                      <Plus className="mr-2 h-5 w-5" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedIndex === index
                ? "bg-primary w-8"
                : "bg-primary/30 hover:bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}