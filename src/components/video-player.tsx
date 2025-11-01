'use client';

import { Video } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  PictureInPicture2,
  Check,
  Repeat,
  Volume1,
} from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface VideoPlayerProps {
  video: Video;
  className?: string;
}

export function VideoPlayer({ video, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [isLooping, setIsLooping] = useState(false);
  const [volumeIndicator, setVolumeIndicator] = useState<number | null>(null);
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'backward' | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideControls = () => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowControls(false);
    }
  };

  const showAndAutoHideControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(!videoRef.current.paused);
      showAndAutoHideControls();
    }
  }, [showAndAutoHideControls]);

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const showVolumeIndicator = (newVolume: number) => {
    setVolumeIndicator(newVolume * 100);
    setTimeout(() => setVolumeIndicator(null), 1000);
  };
  
  const changeVolume = useCallback((amount: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + amount));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      showVolumeIndicator(newVolume);
    }
  }, []);


  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        showVolumeIndicator(0);
      } else {
        showVolumeIndicator(videoRef.current.volume);
      }
    }
  };

  const seek = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
      setSeekIndicator(amount > 0 ? 'forward' : 'backward');
      setTimeout(() => setSeekIndicator(null), 500);
    }
  }, []);

  const handleProgressChange = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(console.error);
      } else {
        await videoRef.current.requestPictureInPicture().catch(console.error);
      }
    }
  }, []);

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = new Date().getTime();
    if (now - lastTapRef.current < 300) {
      // Double tap
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      if (tapX < rect.width / 3) {
        seek(-10); // Seek backward
      } else if (tapX > (rect.width * 2) / 3) {
        seek(10); // Seek forward
      } else {
        togglePlay();
      }
      lastTapRef.current = 0; // Reset tap timer
    } else {
      // Single tap
      setShowControls((s) => !s);
    }
    lastTapRef.current = now;
  };
  
  const handleMouseDown = () => {
    longPressTimeoutRef.current = setTimeout(() => {
        if(videoRef.current) {
            videoRef.current.playbackRate = 2;
        }
    }, 500);
  };

  const handleMouseUp = () => {
      if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
      }
      if(videoRef.current) {
          videoRef.current.playbackRate = playbackRate;
      }
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'p':
          togglePiP();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowleft':
          seek(-5);
          break;
        case 'arrowright':
          seek(5);
          break;
        case 'arrowup':
          changeVolume(0.1);
          break;
        case 'arrowdown':
          changeVolume(-0.1);
          break;
        case '.':
          if (videoRef.current?.paused) seek(1/60); // next frame
          break;
        case ',':
          if (videoRef.current?.paused) seek(-1/60); // prev frame
          break;
        case '>':
          if (e.shiftKey && videoRef.current) {
            const newRate = Math.min(playbackRate * 2, 4);
            handlePlaybackRateChange(newRate);
          }
          break;
        case '<':
          if (e.shiftKey && videoRef.current) {
            const newRate = Math.max(playbackRate / 2, 0.25);
            handlePlaybackRateChange(newRate);
          }
          break;
      }
  }, [togglePlay, toggleFullscreen, togglePiP, seek, changeVolume, playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setProgress(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
    video.loop = isLooping;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isLooping]);

  useEffect(() => {
    showAndAutoHideControls();
    const container = playerContainerRef.current;
    container?.focus();
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAndAutoHideControls, handleKeyDown]);

  const qualities = ['1080p', '720p', '480p', 'Auto'];
  const speeds = [2, 1.5, 1, 0.5];

  return (
    <div
      ref={playerContainerRef}
      tabIndex={0}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl bg-black group',
        className,
        isFullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
      onMouseMove={showAndAutoHideControls}
      onMouseLeave={hideControls}
      onClick={handleTap}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      />
      {/* Gesture indicators */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-5xl">
          {seekIndicator === 'backward' && <Rewind className="animate-ping" />}
          {seekIndicator === 'forward' && <FastForward className="animate-ping" />}
          {volumeIndicator !== null && (
            <div className="flex flex-col items-center bg-black/50 p-4 rounded-lg">
                {volumeIndicator > 50 && <Volume2 />}
                {volumeIndicator <= 50 && volumeIndicator > 0 && <Volume1 />}
                {volumeIndicator === 0 && <VolumeX />}
                <span className="text-2xl mt-2">{Math.round(volumeIndicator)}%</span>
            </div>
          )}
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Slider
          value={[progress]}
          max={duration}
          onValueChange={handleProgressChange}
          className="w-full h-1.5 absolute top-0 left-0 right-0 opacity-100 cursor-pointer group-hover:h-2 transition-all"
        />

        <div className="flex items-center gap-4 text-white mt-2">
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); togglePlay();}}>
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2 group/volume">
            <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleMute();}}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-0 group-hover/volume:w-24 transition-[width] duration-300 cursor-pointer"
            />
          </div>
          <div className="text-xs">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
          <div className="flex-grow" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => e.stopPropagation()}>
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent side="top" align="end" className="bg-black/80 text-white border-white/20">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Playback Speed</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                    {speeds.map((speed) => (
                      <DropdownMenuItem key={speed} onClick={() => handlePlaybackRateChange(speed)}>
                        <Check className={cn('mr-2 h-4 w-4', playbackRate === speed ? 'opacity-100' : 'opacity-0')} /> {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                 <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Quality</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                    {qualities.map((q) => (
                        <DropdownMenuItem key={q} onClick={() => setQuality(q)}>
                           <Check className={cn('mr-2 h-4 w-4', quality === q ? 'opacity-100' : 'opacity-0')} /> {q}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => setIsLooping(!isLooping)}>
                    <Check className={cn('mr-2 h-4 w-4', isLooping ? 'opacity-100' : 'opacity-0')} /> Loop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); togglePiP();}} disabled={!document.pictureInPictureEnabled}>
            <PictureInPicture2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleFullscreen();}}>
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

    