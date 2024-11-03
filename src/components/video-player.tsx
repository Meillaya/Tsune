import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaPlayer, MediaProvider, useMediaPlayer } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CachedLink } from '@/components/shared/cached-links'
import { useLocalStorage } from "@/hooks/use-local-storage";



interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
}

export function VideoPlayer({
  animeId,
  episodeId,
  title,
  episodeNumber,
  totalEpisodes,
  listAnimeData,
}: VideoPlayerProps) {
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<{ url: string, lang: string }[]>([]);
  const [thumbnails, setThumbnails] = useState<string>('');
  const [cachedSources, setCachedSources] = useLocalStorage<Record<string, IVideo[]>>("cached-sources", {});
 


  function PlayerControls() {
    const player = useMediaPlayer();
    // Use player here
    return null;
  }
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      const cacheKey = `${animeId}-${episodeNumber}`; // create cache key

      if (cachedSources[cacheKey]) {
        // Use cached sources if available
        const bestSource = cachedSources[cacheKey][0];
        setVideoSource(bestSource.url);
        setSubtitles(bestSource.tracks || []);

        if (bestSource.isM3U8) {
          setThumbnails(`https://${new URL(bestSource.url).hostname.replace('sbfull.com', 'thumb.sbplay.org')}/hls/${new URL(bestSource.url).searchParams.get('id')}/thumbs.vtt`);
      } else {
          setThumbnails(`https://${new URL(bestSource.url).hostname.replace('sbfull.com', 'thumb.sbplay.org')}/preview/${new URL(bestSource.url).pathname.split('/').pop()}.vtt`)
      }


        setIsLoading(false);
      } else {
        try {
          const sources = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
          if (!sources || sources.length === 0) {
            throw new Error("No video sources found");
          }
          
          // Cache the sources
          setCachedSources(prev => ({ ...prev, [cacheKey]: sources }));
  
          const bestSource = sources[0];

          if (bestSource.url) {
            setVideoSource(bestSource.url);
          } else {
            throw new Error("Source URL is missing");
          }
          if (bestSource.tracks) {
            setSubtitles(bestSource.tracks)
          }

          if (bestSource.isM3U8) {
              setThumbnails(`https://${new URL(bestSource.url).hostname.replace('sbfull.com', 'thumb.sbplay.org')}/hls/${new URL(bestSource.url).searchParams.get('id')}/thumbs.vtt`);
          } else {
              setThumbnails(`https://${new URL(bestSource.url).hostname.replace('sbfull.com', 'thumb.sbplay.org')}/preview/${new URL(bestSource.url).pathname.split('/').pop()}.vtt`)
          }

        } catch (err) {
          console.error("Failed to load video:", err);
          setError("Failed to load video. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadVideo();
  }, [listAnimeData, episodeNumber, animeId, cachedSources]);

  const handlePreviousEpisode = () => {
    if (episodeNumber > 1) {
      router.push(`/watch/${animeId}/${episodeNumber - 1}`);
    }
  };

  const handleNextEpisode = () => {
    if (episodeNumber < totalEpisodes) {
      router.push(`/watch/${animeId}/${episodeNumber + 1}`);
    }
  };

  if (isLoading) {
    return (
      <div className="aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-white p-4">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MediaPlayer 
      title={title} 
      src={videoSource!}
      poster={listAnimeData.media?.coverImage?.extraLarge}
      autoplay
      crossOrigin='anonymous'
    >
      <MediaProvider />
      <PlayerControls />
      <DefaultVideoLayout
          thumbnails={thumbnails}
          icons={defaultLayoutIcons} 
          className="!border-0 !shadow-none" 
      />
    </MediaPlayer>
  );
}