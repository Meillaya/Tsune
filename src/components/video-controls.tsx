"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward, Settings,
  Globe, Languages
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { IVideo } from "@consumet/extensions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  providers: {name: string, sources: IVideo[]}[];
  currentProviderIndex: number;
  dubbed: boolean;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onSeek: (value: number[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onProviderChange: (index: number) => void;
  onDubbedChange: (dubbed: boolean) => void;
  showPrevious?: boolean;
  showNext?: boolean;
}

export function VideoControls({
  currentTime,
  duration,
  isPlaying,
  volume,
  isMuted,
  providers,
  currentProviderIndex,
  dubbed,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeek,
  onPrevious,
  onNext,
  onProviderChange,
  onDubbedChange,
  showPrevious,
  showNext,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
        </div>
      </div>
    </div>
  );
}
