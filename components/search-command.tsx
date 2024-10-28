"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import { searchAnime } from "@/lib/actions";

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchAnime(query);
          setResults(data.slice(0, 5));
        } catch (error) {
          console.error("Error searching anime:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (animeId: number) => {
    setOpen(false);
    router.push(`/anime/${animeId}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search anime...</span>
        <span className="sr-only">Search anime</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search anime..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {isLoading && (
            <CommandLoading>Searching...</CommandLoading>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((anime) => (
                <CommandItem
                  key={anime.id}
                  onSelect={() => handleSelect(anime.id)}
                  className="flex items-center gap-2 p-2"
                >
                  <div className="relative h-16 w-12 flex-none overflow-hidden rounded-sm">
                    <Image
                      src={anime.coverImage.medium}
                      alt={anime.title.english || anime.title.romaji}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {anime.title.english || anime.title.romaji}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {anime.episodes} Episodes • {anime.status}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Quick Links">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/trending");
              }}
            >
              Trending Anime
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/popular");
              }}
            >
              Popular This Season
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/upcoming");
              }}
            >
              Upcoming Next Season
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}