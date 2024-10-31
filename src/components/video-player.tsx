"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoControls } from "@/components/video-controls";
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RefreshCw } from "lucide-react";
import Hls from "hls.js";

interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
}

export default function VideoPlayer({
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading video for:', {
          animeId,
          episodeNumber,
          listAnimeData
        });

        const source = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
        
        if (source && source.length > 0) {
          console.log('Video source found:', source[0]);
          setVideoSource(source[0]);
        } else {
          console.error('No video sources found');
          setError("No video sources available for this episode");
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Failed to load video source");
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [listAnimeData, episodeNumber, retryCount]);

  useEffect(() => {
    if (!videoRef.current || !videoSource?.url) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const initializeVideo = async () => {
      try {
        if (videoSource.isM3U8) {
          if (Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(videoSource.url);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSource.url;
          }
        } else {
          video.src = videoSource.url;
        }
      } catch (error) {
        console.error('Failed to initialize video:', error);
        setError('Failed to initialize video player');
      }
    };

    initializeVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSource]);

  const handleRetry = () => {
    setRetryCount(count => count + 1);
  };

  // Rest of the component implementation remains the same...
  // (Previous implementation of handlePlayPause, handleVolumeChange, etc.)

  if (isLoading) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="h-full w-full"
        poster={listAnimeData.media?.coverImage?.large}
        controls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      
      {showControls && videoSource && (
        <VideoControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={() => {
            if (videoRef.current) {
              if (isPlaying) {
                videoRef.current.pause();
              } else {
                videoRef.current.play().catch(console.error);
              }
            }
          }}
          onVolumeChange={(value) => {
            const newVolume = value[0];
            if (videoRef.current) {
              videoRef.current.volume = newVolume;
              setVolume(newVolume);
              setIsMuted(newVolume === 0);
            }
          }}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onSeek={(value) => {
            if (videoRef.current) {
              videoRef.current.currentTime = value[0];
            }
          }}
          onPrevious={episodeNumber > 1 ? () => router.push(`/watch/${animeId}/${episodeNumber - 1}`) : undefined}
          onNext={episodeNumber < totalEpisodes ? () => router.push(`/watch/${animeId}/${episodeNumber + 1}`) : undefined}
          showPrevious={episodeNumber > 1}
          showNext={episodeNumber < totalEpisodes}
          providers={[{ name: 'Default', sources: [videoSource] }]}
          currentProviderIndex={0}
          onProviderChange={() => {}}
          dubbed={false}
          onDubbedChange={() => {}}
          qualities={[]}
          currentQuality={0}
          onQualityChange={() => {}}
          hasSkipEvents={false}
        />
      )}
    </div>
  );
}