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
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface VideoPlayerProps {
  video: Video;
  className?: string;
}

export function VideoPlayer({ video, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!document.fullscreenElement) {
      videoContainer?.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setProgress(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  useEffect(() => {
    const videoContainer = videoRef.current?.parentElement;
    if (videoContainer) {
        videoContainer.addEventListener('mousemove', handleMouseMove);
        videoContainer.addEventListener('mouseleave', () => setShowControls(false));
    }

    return () => {
        if (videoContainer) {
            videoContainer.removeEventListener('mousemove', handleMouseMove);
            videoContainer.removeEventListener('mouseleave', () => setShowControls(false));
        }
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
    }
  }, []);


  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl bg-black group", className)}>
      <video
        ref={videoRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Slider
          value={[progress]}
          max={duration}
          onValueChange={handleProgressChange}
          className="w-full h-1 absolute top-0 left-0 right-0 opacity-100 group-hover:opacity-100 transition-opacity"
        />

        <div className="flex items-center gap-4 text-white mt-2">
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={togglePlay}>
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
             </Button>
             <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
            />
          </div>
          <div className="text-xs">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
          <div className="flex-grow" />
          <Button variant="ghost" size="icon" className="hover:bg-white/20">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
