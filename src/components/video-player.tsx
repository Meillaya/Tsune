import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoControls } from "@/components/video-controls";
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import Hls from 'hls.js';
import hls from "hls.js";
import { CachedLink } from '@/components/shared/cached-links'

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
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<{ name: string; sources: IVideo[] }[]>([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [dubbed, setDubbed] = useState(false);
  

  useEffect(() => {
    console.log("Starting video source effect with:", videoSource?.url);
    if (!videoRef.current || !videoSource?.url) {
      console.log("Missing requirements:", {
        hasVideoRef: !!videoRef.current,
        hasVideoSource: !!videoSource?.url
      });
      return;
    }
        
    let hls: Hls | null = null;
    
    const initializeVideo = async () => {
      console.log("Starting video initialization");
  
      if (!videoRef.current) return;
      
      try {
        console.log("Video source type:", videoSource?.isM3U8 ? "HLS" : "Direct");
        
        if (videoSource.isM3U8) {
          if (Hls.isSupported()) {
            console.log("HLS is supported, configuring...");
        
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              maxBufferLength: 60,
              maxMaxBufferLength: 120,
              maxBufferSize: 500 * 1000 * 1000,
              maxBufferHole: 0.1,
              highBufferWatchdogPeriod: 1,
              nudgeOffset: 0.1,
              startFragPrefetch: true,
              progressive: true,
              testBandwidth: true,
              backBufferLength: 90,
              abrEwmaDefaultEstimate: 500000,
              abrBandWidthFactor: 0.95,
              abrBandWidthUpFactor: 0.7,
              abrMaxWithRealBitrate: true
            });
            console.log("HLS instance created");
    
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed");
            });
    
            hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
              console.log(`Chunk loaded in ${data.frag.stats.loading.end - data.frag.stats.loading.start}ms`);
            });
    
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.log("HLS error:", data);
            });
    
            console.log("Loading source:", videoSource.url);
            hls.loadSource(videoSource.url);
            hls.attachMedia(videoRef.current);
          }
        }
      } catch (error) {
        console.error('Video initialization failed:', error);
        setError("Failed to play video. Please try another source.");
      }
    };
  
    initializeVideo();
  
    return () => {
      if (hls) {
        console.log("Cleaning up HLS instance");
        hls.destroy();
      }
    };
  }, [videoSource]);

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sources = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
        if (!sources) {
          throw new Error("No video sources found");
        }
        setProviders([{ name: "Default", sources }]);
        setVideoSource(sources[0]);
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Failed to load video. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [listAnimeData, episodeNumber]);

  

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
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
      return (
        <CachedLink 
          listAnimeData={listAnimeData}
          episode={episodeNumber - 1}
        >
      router.push(`/watch/${animeId}/${episodeNumber - 1}`);
      </CachedLink>
    );
  }
};

const handleNextEpisode = () => {
  if (episodeNumber < totalEpisodes) {
    return (
      <CachedLink 
        listAnimeData={listAnimeData}
        episode={episodeNumber + 1}
      >
         router.push(`/watch/${animeId}/${episodeNumber + 1}`);
      </CachedLink>
    );
  }
};

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
  
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };  

  const handleQualityChange = (index: number) => {
    if (!videoRef.current || !providers[currentProviderIndex]?.sources[index]) return;
  
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    const newSource = providers[currentProviderIndex].sources[index];
  
    setVideoSource(newSource);
  
    const handleLoaded = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
    };
  
    if (newSource.isM3U8) {
      if (Hls.isSupported()) {
        if (Hls) {
          Hls.destroy();
        }
        const newHls = new Hls();
        newHls.loadSource(newSource.url);
        newHls.attachMedia(videoRef.current);
        newHls.on(Hls.Events.MANIFEST_PARSED, handleLoaded);
        setHls(newHls);
      }
    } else {
      videoRef.current.src = newSource.url;
      videoRef.current.addEventListener('loadedmetadata', handleLoaded, { once: true });
    }
  };    
  const handleProviderChange = (index: number) => {
    setCurrentProviderIndex(index);
    handleQualityChange(0); // Reset to first quality option of new provider
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
    <div
      ref={containerRef}
      className="group relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden ring-1 ring-black/5"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        className="h-full w-full rounded-lg"
        poster={listAnimeData.media?.coverImage?.extraLarge}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onVolumeChange={() => {
          setVolume(videoRef.current?.volume || 1);
          setIsMuted(videoRef.current?.muted || false);
        }}
        // onFullscreenChange={() => setIsFullscreen(document.fullscreenElement !== null)}
        playsInline
        >
        {videoSource?.tracks?.map((track: { url: string; lang: string }, index: number) => (
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

      {/* Gradient overlay for better control visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {showControls && (
        <VideoControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          providers={providers}
          currentProviderIndex={currentProviderIndex}
          dubbed={dubbed}
          qualities={providers[currentProviderIndex]?.sources.map(s => s.quality).filter((q): q is string => q !== undefined) ?? []}
          currentQuality={providers[currentProviderIndex]?.sources.findIndex(s => s.url === videoSource?.url) ?? 0}
          hasSkipEvents={false}
          onPlayPause={handlePlayPause}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onSeek={handleSeek}
          onPrevious={episodeNumber > 1 ? handlePreviousEpisode : undefined}
          onNext={episodeNumber < totalEpisodes ? handleNextEpisode : undefined}
          onProviderChange={handleProviderChange}
          onDubbedChange={setDubbed}
          onQualityChange={handleQualityChange}
          onToggleFullscreen={toggleFullscreen}
          onSeekBackward={() => handleSeek([Math.max(0, currentTime - 10)])}
          onSeekForward={() => handleSeek([Math.min(duration, currentTime + 10)])}
        />
      )}
    </div>
  );
}

function setHls(newHls: Hls) {
  throw new Error("Function not implemented.");
}
