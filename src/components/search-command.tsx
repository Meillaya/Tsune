"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Search Anime</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
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
                      onSelect={() => handleSelect(`/anime/${anime.id}`)}
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
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">
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
                  onSelect={() => handleSelect("/trending")}
                  className="flex items-center gap-2 py-3"
                >
                  Trending Anime
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect("/popular")}
                  className="flex items-center gap-2 py-3"
                >
                  Popular This Season
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect("/library")}
                  className="flex items-center gap-2 py-3"
                >
                  My Library
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect("/search")}
                  className="flex items-center gap-2 py-3 border-t"
                >
                  Advanced Search
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}