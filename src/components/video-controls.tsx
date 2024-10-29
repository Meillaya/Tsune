"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward, Settings
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface VideoControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onSeek: (value: number[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
}

export function VideoControls({
  currentTime,
  duration,
  isPlaying,
  volume,
  isMuted,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeek,
  onPrevious,
  onNext,
  showPrevious,
  showNext,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
      <div className="flex items-center gap-2 mb-4">
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
        </div>

        <div className="flex items-center gap-2">
          {showPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onPrevious}
            >
              <SkipBack className="h-6 w-6" />
            </Button>
          )}
          {showNext && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onNext}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}