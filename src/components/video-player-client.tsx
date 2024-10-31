'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoControls } from "@/components/video-controls";
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import Hls from 'hls.js';

interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
}

export default function VideoPlayerClient({
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
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [providers, setProviders] = useState<{ name: string, sources: IVideo[] }[]>([]);
  const [dubbed, setDubbed] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const source = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
        if (source) {
          setVideoSource(source);
        } else {
          setError("No video sources found. Please try another provider or episode.");
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Failed to load video. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [listAnimeData, episodeNumber]);

  useEffect(() => {
    if (!videoRef.current || !videoSource?.url) return;
      
    let hls: Hls | null = null;
    
    const initializeVideo = async () => {
      if (!videoRef.current) return;

      try {
        if (videoSource.isM3U8) {
          if (Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              debug: process.env.NODE_ENV === 'development'
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                setError('Failed to load video stream. Please try a different quality or provider.');
                console.error('Fatal HLS error:', data);
                
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls?.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls?.recoverMediaError();
                    break;
                  default:
                    hls?.destroy();
                    break;
                }
              }
            });

            hls.loadSource(videoSource.url);
            hls.attachMedia(videoRef.current);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoRef.current?.play().catch(error => {
                console.error('Failed to start playback:', error);
                setError('Failed to start video playback. Please try again.');
              });
            });
          } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = videoSource.url;
            await videoRef.current.play();
          }
        } else {
          videoRef.current.src = videoSource.url;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Failed to initialize video:', error);
        setError('Failed to initialize video player. Please try again or use a different provider.');
      }
    };

    initializeVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSource]);

  // ... Rest of the component implementation remains the same as in the original video-player.tsx

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-white">
          Loading video...
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="h-full w-full"
            poster={listAnimeData.media?.coverImage?.extraLarge}
            crossOrigin="anonymous"
            playsInline
          />
          {showControls && (
            <VideoControls
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              onPlayPause={() => {/* implement controls */}}
              onVolumeChange={() => {/* implement controls */}}
              onMuteToggle={() => {/* implement controls */}}
              onSeek={() => {/* implement controls */}}
              providers={providers}
              currentProviderIndex={currentProviderIndex}
              onProviderChange={setCurrentProviderIndex}
              dubbed={dubbed}
              onDubbedChange={setDubbed}
              qualities={[]}
              currentQuality={0}
              onQualityChange={() => {/* implement controls */}}
              hasSkipEvents={false}
            />
          )}
        </>
      )}
    </div>
  );
}