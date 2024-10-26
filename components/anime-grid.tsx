import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Anime } from "@/lib/anilist";

export function AnimeGrid({ anime }: { anime: Anime[] }) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
      {anime.map((item) => (
        <Link 
          key={item.id} 
          href={`/anime/${item.id}`}
          className="flex-none snap-start"
          style={{ width: 'min(300px, 80vw)' }}
        >
          <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="aspect-[3/4] relative">
              <Image
                src={item.coverImage.large}
                alt={item.title.english || item.title.romaji}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h2 className="font-semibold line-clamp-1">
                {item.title.english || item.title.romaji}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description?.replace(/<[^>]*>/g, "")}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
