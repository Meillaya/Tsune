"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Globe,
  Languages,
  Maximize,
  Minimize,
  FastForward,
  Rewind,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { IVideo } from "@consumet/extensions";

interface VideoControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  providers: { name: string; sources: IVideo[] }[];
  currentProviderIndex: number;
  dubbed: boolean;
  qualities: string[];
  currentQuality: number;
  hasSkipEvents: boolean;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onSeek: (value: number[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onProviderChange: (index: number) => void;
  onDubbedChange: (dubbed: boolean) => void;
  onQualityChange: (index: number) => void;
  onSkipIntro?: () => void;
  onSkipOutro?: () => void;
  onToggleFullscreen: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export function VideoControls({
  currentTime,
  duration,
  isPlaying,
  volume,
  isMuted,
  isFullscreen,
  providers,
  currentProviderIndex,
  dubbed,
  qualities,
  currentQuality,
  hasSkipEvents,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeek,
  onPrevious,
  onNext,
  onProviderChange,
  onDubbedChange,
  onQualityChange,
  onSkipIntro,
  onSkipOutro,
  onToggleFullscreen,
  onSeekBackward,
  onSeekForward,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="space-y-4 p-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={1}
            onValueChange={onSeek}
            className="w-full"
          />
          <span className="text-sm text-white min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <div
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onMuteToggle}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              {showVolumeSlider && (
                <div className="absolute bottom-full left-0 mb-2 w-32 p-2 bg-black/80 rounded-md">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={onVolumeChange}
                    orientation="horizontal"
                  />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onSeekBackward}
            >
              <Rewind className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onSeekForward}
            >
              <FastForward className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onPrevious}
              >
                <SkipBack className="h-6 w-6" />
              </Button>
            )}

            {onNext && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onNext}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            )}

            {hasSkipEvents && (
              <>
                {onSkipIntro && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white bg-white/20 hover:bg-white/30"
                    onClick={onSkipIntro}
                  >
                    Skip Intro
                  </Button>
                )}
                {onSkipOutro && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white bg-white/20 hover:bg-white/30"
                    onClick={onSkipOutro}
                  >
                    Skip Outro
                  </Button>
                )}
              </>
            )}

            <Select
              value={currentProviderIndex.toString()}
              onValueChange={(value) => onProviderChange(parseInt(value))}
            >
              <SelectTrigger className="w-[180px] bg-black/60 border-none text-white">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onDubbedChange(!dubbed)}
            >
              <Languages className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-6 w-6" />
              ) : (
                <Maximize className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Settings panel */}
      {showSettings && (
        <div className="absolute bottom-full right-4 mb-2 w-56 rounded-md bg-black/80 p-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-white">
              <span>Source</span>
              <span className="text-primary">{providers[currentProviderIndex].name}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white">
              <span>Quality</span>
              <Select
                value={currentQuality.toString()}
                onValueChange={(value) => onQualityChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((quality, index) => (
                    <SelectItem key={quality} value={index.toString()}>
                      {quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}