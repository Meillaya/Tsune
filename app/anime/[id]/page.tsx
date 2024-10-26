import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAnimeById, getAllAnimeIds } from "@/lib/anilist";
import { AnimeDetails } from "@/components/anime-details";
import { EpisodeList } from "@/components/episode-list";
import { LoadingSpinner } from "@/components/loading-spinner";

export async function generateStaticParams() {
  const ids = await getAllAnimeIds();
  return ids.map((id) => ({
    id: id.toString(),
  }));
}

export default async function AnimePage({
  params,
}: {
  params: { id: string };
}) {
  const anime = await getAnimeById(parseInt(params.id));

  if (!anime) {
    notFound();
  }

  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <AnimeDetails anime={anime} />
      </Suspense>
      <div className="container py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <EpisodeList episodes={anime.episodes} animeId={anime.id} />
        </Suspense>
      </div>
    </div>
  );
}