"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoControls } from "@/components/video-controls";
import { ListAnimeData, Media } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getEpisodeUrl as hianime } from "@/modules/providers/hianime";
import { getEpisodeUrl as gogoanime } from "@/modules/providers/gogoanime";
import { getEpisodeUrl as animeunity } from "@/modules/providers/animeunity";
import { getEpisodeUrl as animedrive } from "@/modules/providers/animedrive";
import { getParsedAnimeTitles } from "@/modules/utils";
import { animeCustomTitles } from "@/modules/animeCustomTitles";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import Hls from 'hls.js';

interface Provider {
  name: string;
  sources: IVideo[];
  currentQuality: number;
}

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
  console.log('VideoPlayer mounted with props:', {
    animeId,
    episodeId,
    title,
    episodeNumber,
    totalEpisodes,
    listAnimeData
  });
  
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSource, setVideoSource] = useState<IVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [dubbed, setDubbed] = useState(false);

  // Fetch anime data using the provided animeId
  const [animeData, setAnimeData] = useState<Media | null>(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      console.log('Fetching anime data for ID:', animeId);
      const data = await getAnimeInfo(parseInt(animeId));
      console.log('Received anime data:', data);
      setAnimeData(data);
    };
  
    fetchAnimeData();
  }, [animeId]);
  
  useEffect(() => {
    const loadProviders = async () => {
      if (!animeData) {
        console.log('Waiting for anime data...');
        return;
      }
      
      setIsLoading(true);
      console.log('Starting provider load with anime data:', animeData);
      
      const animeTitles = getParsedAnimeTitles(animeData);
      console.log('Parsed anime titles:', animeTitles);
      
      const providers = [
        { name: 'HiAnime', fetch: () => hianime(animeTitles, 0, episodeNumber, dubbed) },
        { name: 'Gogoanime', fetch: () => gogoanime(animeTitles, 0, episodeNumber, dubbed, animeData.startDate?.year ?? 0) },
        { name: 'AnimeUnity', fetch: () => animeunity(animeTitles, 0, episodeNumber, dubbed, animeData.startDate?.year ?? 0) },
        { name: 'AnimeDrive', fetch: () => animedrive(animeTitles, 0, episodeNumber, dubbed) }
      ];
    
      for (const provider of providers) {
        const sources = await provider.fetch();
        if (sources && sources.length > 0) {
          setProviders([{ name: provider.name, sources, currentQuality: 0 }]);
          setVideoSource(sources[0]);
          break;
        }
      }
      
      setIsLoading(false);
    };
  
    loadProviders();
  }, [episodeNumber, dubbed, animeData]);
  
  

  const handleQualityChange = (providerIndex: number, qualityIndex: number) => {
    const provider = providers[providerIndex];
    if (!provider) return;
  
    const newProviders = [...providers];
    newProviders[providerIndex].currentQuality = qualityIndex;
    setProviders(newProviders);
  
    if (providerIndex === currentProviderIndex) {
      const newSource = provider.sources[qualityIndex];
      setVideoSource(newSource);
      
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        videoRef.current.src = newSource.url;
        videoRef.current.currentTime = currentTime;
        if (isPlaying) videoRef.current.play();
      }
    }
  };

  const handleSkipEvent = (type: 'intro' | 'outro') => {
    if (!videoRef.current || !videoSource?.skipEvents) return;
  
    const event = videoSource.skipEvents[type as keyof typeof videoSource.skipEvents];
    if (!event) return;
  
    videoRef.current.currentTime = event.end;
  };
  const handleProviderChange = (index: number) => {
    setCurrentProviderIndex(index);
    const newSource = providers[index]?.sources?.[0] ?? null;
    setVideoSource(newSource);
    
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };
  
  useEffect(() => {
    if (!videoRef.current || !videoSource?.url) {
      console.log('Video source or ref not ready:', { videoSource, videoRef: videoRef.current });
      return;
    }
      
    console.log('Loading video source:', videoSource);
    let hls: Hls | null = null;
    
    const initializeVideo = async () => {
      if (videoSource.isM3U8) {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            debug: true
          });
          hls.loadSource(videoSource.url);
          hls.attachMedia(videoRef.current!);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, starting playback');
            videoRef.current?.play()
              .then(() => console.log('Playback started'))
              .catch(e => console.error('Playback failed:', e));
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = videoSource.url;
          await videoRef.current.play();
        }
      } else {
        videoRef.current.src = videoSource.url;
        await videoRef.current.play();
      }
    };
  
    initializeVideo();
  
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSource]);
  
  
  
  
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onDoubleClick={toggleFullscreen}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-white">Loading...</div>
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full"
          src={videoSource?.url}
          poster={listAnimeData.media?.coverImage?.extraLarge}
          crossOrigin="anonymous"
          onError={(e) => console.error('Video loading error:', e)}
          autoPlay={isPlaying}
        >
          {videoSource?.tracks?.map((track, index) => (
            <track
              key={index}
              kind="subtitles"
              src={track.url}
              srcLang={track.lang}
              label={track.lang}
              default={index === 0}
            />
          ))}
        </video>
      )}
      {showControls && (
        <VideoControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={handlePlayPause}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onSeek={handleSeek}
          onPrevious={episodeNumber > 1 ? handlePreviousEpisode : undefined}
          onNext={episodeNumber < totalEpisodes ? handleNextEpisode : undefined}
          showPrevious={episodeNumber > 1}
          showNext={episodeNumber < totalEpisodes}
          providers={providers}
          currentProviderIndex={currentProviderIndex}
          onProviderChange={handleProviderChange}
          dubbed={dubbed}
          onDubbedChange={setDubbed}
          onQualityChange={handleQualityChange}
          onSkipIntro={() => handleSkipEvent('intro')}
          onSkipOutro={() => handleSkipEvent('outro')}
          qualities={providers[currentProviderIndex]?.sources.map(s => s.quality) ?? []}
          currentQuality={providers[currentProviderIndex]?.currentQuality ?? 0}
          hasSkipEvents={!!videoSource?.skipEvents}
        />
      )}
    </div>
  );
}
