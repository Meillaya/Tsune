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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSource, setVideoSource] = useState<IVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [providers, setProviders] = useState<{name: string, sources: IVideo[]}[]>([]);
  const [dubbed, setDubbed] = useState(false);

  // Fetch anime data using the provided animeId
  const [animeData, setAnimeData] = useState<Media | null>(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      const data = await getAnimeInfo(parseInt(animeId));
      setAnimeData(data);
    };

    fetchAnimeData();
  }, [animeId]);
  
  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
  
      const animeTitles = getParsedAnimeTitles(listAnimeData.media);
      const customTitle = animeCustomTitles['INT'] && animeCustomTitles['INT'][listAnimeData.media?.id!];
      if (customTitle) animeTitles.unshift(customTitle.title);
  
      const providerResults = await Promise.all([
        hianime(animeTitles, customTitle?.index ?? 0, episodeNumber, dubbed),
        gogoanime(animeTitles, customTitle?.index ?? 0, episodeNumber, dubbed, listAnimeData.media.startDate?.year ?? 0),
        animeunity(animeTitles, customTitle?.index ?? 0, episodeNumber, dubbed, listAnimeData.media.startDate?.year ?? 0),
        animedrive(animeTitles, customTitle?.index ?? 0, episodeNumber, dubbed)
      ]);
  
      const availableProviders = [
        { name: 'HiAnime', sources: providerResults[0] || [] },
        { name: 'Gogoanime', sources: providerResults[1] || [] },
        { name: 'AnimeUnity', sources: providerResults[2] || [] },
        { name: 'AnimeDrive', sources: providerResults[3] || [] }
      ].filter((p) => p.sources.length > 0);
  
      setProviders(availableProviders);
      setVideoSource(availableProviders[0]?.sources?.[0] ?? null);
      setIsLoading(false);
    };
  
    loadProviders();
  }, [episodeNumber, dubbed, listAnimeData]);

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
        />
      )}
    </div>
  );
}
