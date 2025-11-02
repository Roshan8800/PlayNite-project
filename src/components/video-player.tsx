'use client';

import type { Video } from '@/lib/types';
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
  Subtitles,
} from 'lucide-react';
import { SmartSkipDetector } from './smart-skip/smart-skip-detector';
import { CrossDeviceSync } from './sync/cross-device-sync';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useToast } from '@/hooks/use-toast';
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
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
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
  const [gestureStartY, setGestureStartY] = useState<number | null>(null);
  const [gestureStartX, setGestureStartX] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [availableSubtitles, setAvailableSubtitles] = useState<string[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [pipSupported, setPipSupported] = useState(false);

  // Multi-track audio states
  const [availableAudioTracks, setAvailableAudioTracks] = useState<Array<{ id: string; label: string; language: string }>>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string>('');
  const [audioTracksEnabled, setAudioTracksEnabled] = useState(true);

  // Enhanced gesture states
  const [brightness, setBrightness] = useState(1);
  const [gestureIndicator, setGestureIndicator] = useState<{
    type: 'volume' | 'brightness' | 'seek' | 'speed' | null;
    value: number;
    position: { x: number; y: number };
  } | null>(null);
  const [doubleTapIndicator, setDoubleTapIndicator] = useState<{
    type: 'forward' | 'backward' | 'play' | null;
    position: { x: number; y: number };
  } | null>(null);
  const [threeFingerGesture, setThreeFingerGesture] = useState<{
    type: 'screenshot' | 'settings' | null;
  } | null>(null);
  const [shakeGesture, setShakeGesture] = useState(false);
  const [pinchGesture, setPinchGesture] = useState<{
    scale: number;
    center: { x: number; y: number };
  } | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          toast({
            variant: 'destructive',
            title: 'Playback Error',
            description: 'Unable to play the video. Please try again.',
          });
        });
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(!videoRef.current.paused);
      showAndAutoHideControls();
    }
  }, [showAndAutoHideControls, toast]);

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
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      // Double tap - enhanced gesture control
      if (tapX < rect.width / 3) {
        seek(-10); // Seek backward
        setDoubleTapIndicator({
          type: 'backward',
          position: { x: tapX, y: tapY }
        });
      } else if (tapX > (rect.width * 2) / 3) {
        seek(10); // Seek forward
        setDoubleTapIndicator({
          type: 'forward',
          position: { x: tapX, y: tapY }
        });
      } else {
        togglePlay();
        setDoubleTapIndicator({
          type: 'play',
          position: { x: tapX, y: tapY }
        });
      }
      setTimeout(() => setDoubleTapIndicator(null), 1000);
      lastTapRef.current = 0; // Reset tap timer
    } else {
      // Single tap
      setShowControls((s) => !s);
    }
    lastTapRef.current = now;
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setGestureStartX(e.clientX);
    setGestureStartY(e.clientY);
    longPressTimeoutRef.current = setTimeout(() => {
        if(videoRef.current) {
            videoRef.current.playbackRate = 2;
            setGestureIndicator({
              type: 'speed',
              value: 200,
              position: { x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top }
            });
            setTimeout(() => setGestureIndicator(null), 1000);
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
      setGestureStartX(null);
      setGestureStartY(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gestureStartX !== null && gestureStartY !== null) {
      const deltaX = e.clientX - gestureStartX;
      const deltaY = e.clientY - gestureStartY;
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      const isLeftSide = relativeX < rect.width * 0.3;
      const isRightSide = relativeX > rect.width * 0.7;

      // Horizontal swipe for seeking
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const seekAmount = Math.floor(deltaX / 10);
        seek(seekAmount);
        setGestureIndicator({
          type: 'seek',
          value: seekAmount,
          position: { x: relativeX, y: relativeY }
        });
        setTimeout(() => setGestureIndicator(null), 1000);
        setGestureStartX(e.clientX);
      }

      // Vertical swipe on sides for volume/brightness
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
        if (isRightSide) {
          // Right side: volume control
          const volumeChange = deltaY > 0 ? -0.05 : 0.05;
          changeVolume(volumeChange);
          setGestureIndicator({
            type: 'volume',
            value: volume * 100,
            position: { x: relativeX, y: relativeY }
          });
        } else if (isLeftSide) {
          // Left side: brightness control
          const newBrightness = Math.max(0.1, Math.min(2, brightness + (deltaY > 0 ? -0.1 : 0.1)));
          setBrightness(newBrightness);
          // Apply brightness to video container
          const container = e.currentTarget as HTMLElement;
          container.style.filter = `brightness(${newBrightness})`;
          setGestureIndicator({
            type: 'brightness',
            value: newBrightness * 50,
            position: { x: relativeX, y: relativeY }
          });
        }
        setTimeout(() => setGestureIndicator(null), 1000);
        setGestureStartY(e.clientY);
      }
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
         case 's':
           if (e.ctrlKey) {
             e.preventDefault();
             takeScreenshot();
           }
           break;
         case 'c':
           if (e.ctrlKey && e.shiftKey) {
             e.preventDefault();
             toggleSubtitles();
           }
           break;
       }
   }, [togglePlay, toggleFullscreen, togglePiP, seek, changeVolume, playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setProgress(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const errorMessage = target.error?.message || 'Unknown error';
      setError(`Video playback error: ${errorMessage}`);
  
      // Auto-retry logic for network errors
      if (retryCount < maxRetries && (target.error?.code === 2 || target.error?.code === 3)) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setError(null);
          // Force reload the video source
          if (videoRef.current) {
            const currentSrc = videoRef.current.src;
            videoRef.current.src = '';
            videoRef.current.src = currentSrc;
          }
        }, 2000 * (retryCount + 1)); // Exponential backoff
  
        toast({
          variant: 'destructive',
          title: 'Video Error',
          description: `Unable to load video. Retrying... (${retryCount + 1}/${maxRetries})`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Video Error',
          description: 'Unable to load or play this video. Please try refreshing the page.',
        });
      }
    };

    // Check for subtitle tracks
    const checkSubtitles = () => {
      const tracks = Array.from(video.textTracks || []);
      const subtitleTracks = tracks.filter(track => track.kind === 'subtitles');
      setAvailableSubtitles(subtitleTracks.map(track => track.label || track.language));
    };

    // Check for audio tracks (using WebVTT or similar for demo purposes)
    const checkAudioTracks = () => {
      // For demo purposes, we'll simulate audio tracks
      // In a real implementation, this would check video.audioTracks
      const mockAudioTracks = [
        { id: 'original', label: 'Original Audio', language: 'en' },
        { id: 'dubbed', label: 'Dubbed Audio', language: 'en' },
      ];
      setAvailableAudioTracks(mockAudioTracks);

      if (mockAudioTracks.length > 0 && !currentAudioTrack) {
        setCurrentAudioTrack('original');
      }
    };

    // Check PiP support
    setPipSupported(document.pictureInPictureEnabled);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('loadedmetadata', checkSubtitles);
    video.addEventListener('loadedmetadata', checkAudioTracks);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
    video.addEventListener('error', handleError);
    video.loop = isLooping;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('loadedmetadata', checkSubtitles);
      video.removeEventListener('loadedmetadata', checkAudioTracks);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isLooping, toast]);

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

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single touch - regular gesture
      setGestureStartX(e.touches[0].clientX);
      setGestureStartY(e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      // Two finger touch - potential pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setPinchGesture({
        scale: 1,
        center: {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        }
      });
    } else if (e.touches.length === 3) {
      // Three finger touch - special gesture
      setThreeFingerGesture({ type: 'screenshot' });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && gestureStartX !== null && gestureStartY !== null) {
      const deltaX = e.touches[0].clientX - gestureStartX;
      const deltaY = e.touches[0].clientY - gestureStartY;
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.touches[0].clientX - rect.left;
      const isLeftSide = relativeX < rect.width * 0.3;
      const isRightSide = relativeX > rect.width * 0.7;

      // Horizontal swipe for seeking
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        const seekAmount = Math.floor(deltaX / 5);
        seek(seekAmount);
        setGestureIndicator({
          type: 'seek',
          value: seekAmount,
          position: { x: relativeX, y: e.touches[0].clientY - rect.top }
        });
        setTimeout(() => setGestureIndicator(null), 1000);
      }

      // Vertical swipe for volume/brightness
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
        if (isRightSide) {
          changeVolume(deltaY > 0 ? -0.05 : 0.05);
          setGestureIndicator({
            type: 'volume',
            value: volume * 100,
            position: { x: relativeX, y: e.touches[0].clientY - rect.top }
          });
        } else if (isLeftSide) {
          const newBrightness = Math.max(0.1, Math.min(2, brightness + (deltaY > 0 ? -0.1 : 0.1)));
          setBrightness(newBrightness);
          e.currentTarget.style.filter = `brightness(${newBrightness})`;
          setGestureIndicator({
            type: 'brightness',
            value: newBrightness * 50,
            position: { x: relativeX, y: e.touches[0].clientY - rect.top }
          });
        }
        setTimeout(() => setGestureIndicator(null), 1000);
      }
    } else if (e.touches.length === 2 && pinchGesture) {
      // Handle pinch gesture for zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / 100; // Normalize scale
      setPinchGesture(prev => prev ? { ...prev, scale } : null);

      // Apply zoom to video
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${scale})`;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches.length === 1) {
      setGestureStartX(null);
      setGestureStartY(null);
    }

    if (pinchGesture) {
      // Reset zoom after pinch ends
      if (videoRef.current) {
        videoRef.current.style.transform = 'scale(1)';
      }
      setPinchGesture(null);
    }

    if (threeFingerGesture) {
      if (threeFingerGesture.type === 'screenshot') {
        // Take screenshot
        takeScreenshot();
      }
      setThreeFingerGesture(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    changeVolume(delta);
  };

  // Device orientation for shake gesture
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const deltaX = Math.abs(acceleration.x! - lastX);
      const deltaY = Math.abs(acceleration.y! - lastY);
      const deltaZ = Math.abs(acceleration.z! - lastZ);

      if (deltaX + deltaY + deltaZ > 25) {
        shakeCount++;
        if (shakeCount > 3) {
          // Random video gesture
          setShakeGesture(true);
          setTimeout(() => setShakeGesture(false), 1000);
          // Could trigger random video navigation here
          shakeCount = 0;
        }
      } else {
        shakeCount = Math.max(0, shakeCount - 1);
      }

      lastX = acceleration.x!;
      lastY = acceleration.y!;
      lastZ = acceleration.z!;
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => window.removeEventListener('devicemotion', handleDeviceMotion);
    }
  }, []);

  const takeScreenshot = async () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx?.drawImage(videoRef.current, 0, 0);

        const link = document.createElement('a');
        link.download = `screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();

        toast({
          title: 'Screenshot taken',
          description: 'Screenshot saved to downloads',
        });
      } catch (error) {
        console.error('Screenshot failed:', error);
        toast({
          variant: 'destructive',
          title: 'Screenshot failed',
          description: 'Unable to take screenshot',
        });
      }
    }
  };

  const toggleSubtitles = () => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          tracks[i].mode = subtitlesEnabled ? 'disabled' : 'showing';
        }
      }
      setSubtitlesEnabled(!subtitlesEnabled);
    }
  };

  const selectSubtitle = (language: string) => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          tracks[i].mode = tracks[i].label === language || tracks[i].language === language ? 'showing' : 'disabled';
        }
      }
      setCurrentSubtitle(language);
    }
  };

  const selectAudioTrack = (trackId: string) => {
    // In a real implementation, this would switch audio tracks
    // For demo purposes, we'll just update the state
    setCurrentAudioTrack(trackId);
    toast({
      title: 'Audio track changed',
      description: `Switched to ${availableAudioTracks.find(t => t.id === trackId)?.label || 'Unknown track'}`,
    });
  };

  const toggleAudioTracks = () => {
    setAudioTracksEnabled(!audioTracksEnabled);
    toast({
      title: audioTracksEnabled ? 'Audio tracks disabled' : 'Audio tracks enabled',
      description: 'Multi-track audio has been toggled.',
    });
  };

  return (
    <div
      ref={(node) => {
        playerContainerRef.current = node;
        inViewRef(node);
      }}
      tabIndex={0}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl bg-black group',
        className,
        isFullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
      role="region"
      aria-label="Video player"
      aria-describedby="video-controls"
      onMouseMove={(e) => {
        showAndAutoHideControls();
        handleMouseMove(e);
      }}
      onMouseLeave={hideControls}
      onClick={handleTap}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {error ? (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-lg mb-2">⚠️ Playback Error</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      ) : inView ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <div className="text-white text-lg">Video will load when in view</div>
        </div>
      )}
      {/* Smart Skip Detector */}
      <SmartSkipDetector
        videoRef={videoRef}
        currentTime={progress}
        duration={duration}
        onSkip={(time) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        }}
        className="absolute inset-0"
      />

      {/* Cross-Device Sync */}
      <div className="absolute top-20 right-4 z-10">
        <CrossDeviceSync
          videoId={video.id}
          currentTime={progress}
          isPlaying={isPlaying}
          onSyncFromDevice={(time, playing) => {
            if (videoRef.current) {
              videoRef.current.currentTime = time;
              if (playing !== isPlaying) {
                if (playing) {
                  videoRef.current.play().catch(console.error);
                } else {
                  videoRef.current.pause();
                }
              }
            }
          }}
        />
      </div>

      {/* Enhanced Gesture indicators */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-5xl">
          {seekIndicator === 'backward' && <Rewind className="animate-ping" />}
          {seekIndicator === 'forward' && <FastForward className="animate-ping" />}
          {doubleTapIndicator && (
            <div className="absolute" style={{
              left: doubleTapIndicator.position.x - 50,
              top: doubleTapIndicator.position.y - 50,
              animation: 'fadeOut 1s ease-out forwards'
            }}>
              {doubleTapIndicator.type === 'backward' && <Rewind className="text-6xl animate-bounce" />}
              {doubleTapIndicator.type === 'forward' && <FastForward className="text-6xl animate-bounce" />}
              {doubleTapIndicator.type === 'play' && <Play className="text-6xl animate-bounce" />}
            </div>
          )}
          {gestureIndicator && (
            <div className="absolute bg-black/70 p-3 rounded-lg" style={{
              left: gestureIndicator.position.x - 60,
              top: gestureIndicator.position.y - 40,
              animation: 'fadeOut 1s ease-out forwards'
            }}>
              {gestureIndicator.type === 'volume' && (
                <div className="flex flex-col items-center">
                  {gestureIndicator.value > 50 && <Volume2 />}
                  {gestureIndicator.value <= 50 && gestureIndicator.value > 0 && <Volume1 />}
                  {gestureIndicator.value === 0 && <VolumeX />}
                  <span className="text-lg mt-1">{Math.round(gestureIndicator.value)}%</span>
                </div>
              )}
              {gestureIndicator.type === 'brightness' && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">☀️</span>
                  <span className="text-lg mt-1">{Math.round(gestureIndicator.value)}%</span>
                </div>
              )}
              {gestureIndicator.type === 'seek' && (
                <div className="flex flex-col items-center">
                  {gestureIndicator.value > 0 ? <FastForward /> : <Rewind />}
                  <span className="text-lg mt-1">{Math.abs(gestureIndicator.value)}s</span>
                </div>
              )}
              {gestureIndicator.type === 'speed' && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⚡</span>
                  <span className="text-lg mt-1">{gestureIndicator.value}%</span>
                </div>
              )}
            </div>
          )}
          {shakeGesture && (
            <div className="bg-black/70 p-4 rounded-lg animate-bounce">
              <span className="text-2xl">🎲</span>
              <div className="text-sm mt-1">Random Video</div>
            </div>
          )}
          {pinchGesture && (
            <div className="bg-black/70 p-3 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div className="text-sm mt-1">Zoom: {pinchGesture.scale.toFixed(1)}x</div>
            </div>
          )}
          {threeFingerGesture && (
            <div className="bg-black/70 p-3 rounded-lg animate-pulse">
              <span className="text-2xl">📸</span>
              <div className="text-sm mt-1">Screenshot</div>
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

        <div id="video-controls" className="flex items-center gap-4 text-white mt-2" role="toolbar" aria-label="Video controls">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/20"
            onClick={(e) => {e.stopPropagation(); togglePlay();}}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={isPlaying}
          >
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
                 {availableSubtitles.length > 0 && (
                   <DropdownMenuSub>
                     <DropdownMenuSubTrigger>Subtitles</DropdownMenuSubTrigger>
                     <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                       <DropdownMenuItem onClick={toggleSubtitles}>
                         <Check className={cn('mr-2 h-4 w-4', subtitlesEnabled ? 'opacity-100' : 'opacity-0')} />
                         {subtitlesEnabled ? 'Disable' : 'Enable'} Subtitles
                       </DropdownMenuItem>
                       {availableSubtitles.map((subtitle) => (
                         <DropdownMenuItem key={subtitle} onClick={() => selectSubtitle(subtitle)}>
                           <Check className={cn('mr-2 h-4 w-4', currentSubtitle === subtitle ? 'opacity-100' : 'opacity-0')} />
                           {subtitle}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuSubContent>
                   </DropdownMenuSub>
                 )}
                 {availableAudioTracks.length > 1 && (
                   <DropdownMenuSub>
                     <DropdownMenuSubTrigger>Audio Tracks</DropdownMenuSubTrigger>
                     <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                       <DropdownMenuItem onClick={toggleAudioTracks}>
                         <Check className={cn('mr-2 h-4 w-4', audioTracksEnabled ? 'opacity-100' : 'opacity-0')} />
                         {audioTracksEnabled ? 'Disable' : 'Enable'} Multi-Track Audio
                       </DropdownMenuItem>
                       {availableAudioTracks.map((track) => (
                         <DropdownMenuItem key={track.id} onClick={() => selectAudioTrack(track.id)}>
                           <Check className={cn('mr-2 h-4 w-4', currentAudioTrack === track.id ? 'opacity-100' : 'opacity-0')} />
                           {track.label} ({track.language})
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuSubContent>
                   </DropdownMenuSub>
                 )}
                 <DropdownMenuItem onClick={() => setIsLooping(!isLooping)}>
                     <Check className={cn('mr-2 h-4 w-4', isLooping ? 'opacity-100' : 'opacity-0')} /> Loop
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          {availableSubtitles.length > 0 && (
            <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleSubtitles();}}>
              <Subtitles className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); togglePiP();}} disabled={!pipSupported}>
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

    