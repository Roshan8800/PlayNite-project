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
import { VideoLoader, type VideoSource, type VideoError } from './video-loader';
import { VideoLoadError, VideoPlaybackError, NetworkError, createErrorFromUnknown } from '@/lib/errors';
import { retryVideoLoad } from '@/lib/retry';
import { useFeature } from '@/lib/graceful-degradation';
import { useErrorToast } from './error-toast';
import { errorLogger } from '@/lib/error-logger';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { NetworkStatusIndicator } from './network-status-indicator';
import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect, useCallback, useMemo, useReducer, memo } from 'react';

// Dynamic import for LazyIframe to avoid SSR issues
const LazyIframe = dynamic(() => import('@/components/lazy-iframe').then(mod => ({ default: mod.LazyIframe })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center text-white">Loading iframe...</div>
});
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
   enableAnalytics?: boolean;
 }

// Player state reducer
interface PlayerState {
   isPlaying: boolean;
   volume: number;
   isMuted: boolean;
   progress: number;
   duration: number;
   isFullscreen: boolean;
   showControls: boolean;
   playbackRate: number;
   quality: string;
   isLooping: boolean;
   volumeIndicator: number | null;
   seekIndicator: 'forward' | 'backward' | null;
   error: VideoError | null;
   currentVideoSource: VideoSource | null;
   subtitlesEnabled: boolean;
   availableSubtitles: string[];
   currentSubtitle: string;
   availableAudioTracks: Array<{ id: string; label: string; language: string }>;
   currentAudioTrack: string;
   audioTracksEnabled: boolean;
   pipSupported: boolean;
}

type PlayerAction =
   | { type: 'SET_PLAYING'; payload: boolean }
   | { type: 'SET_VOLUME'; payload: number }
   | { type: 'SET_MUTED'; payload: boolean }
   | { type: 'SET_PROGRESS'; payload: number }
   | { type: 'SET_DURATION'; payload: number }
   | { type: 'SET_FULLSCREEN'; payload: boolean }
   | { type: 'SET_SHOW_CONTROLS'; payload: boolean }
   | { type: 'SET_PLAYBACK_RATE'; payload: number }
   | { type: 'SET_QUALITY'; payload: string }
   | { type: 'SET_LOOPING'; payload: boolean }
   | { type: 'SET_VOLUME_INDICATOR'; payload: number | null }
   | { type: 'SET_SEEK_INDICATOR'; payload: 'forward' | 'backward' | null }
   | { type: 'SET_ERROR'; payload: VideoError | null }
   | { type: 'SET_CURRENT_VIDEO_SOURCE'; payload: VideoSource | null }
   | { type: 'SET_SUBTITLES_ENABLED'; payload: boolean }
   | { type: 'SET_AVAILABLE_SUBTITLES'; payload: string[] }
   | { type: 'SET_CURRENT_SUBTITLE'; payload: string }
   | { type: 'SET_AVAILABLE_AUDIO_TRACKS'; payload: Array<{ id: string; label: string; language: string }> }
   | { type: 'SET_CURRENT_AUDIO_TRACK'; payload: string }
   | { type: 'SET_AUDIO_TRACKS_ENABLED'; payload: boolean }
   | { type: 'SET_PIP_SUPPORTED'; payload: boolean };

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
   switch (action.type) {
      case 'SET_PLAYING':
         return { ...state, isPlaying: action.payload };
      case 'SET_VOLUME':
         return { ...state, volume: action.payload, isMuted: action.payload === 0 };
      case 'SET_MUTED':
         return { ...state, isMuted: action.payload };
      case 'SET_PROGRESS':
         return { ...state, progress: action.payload };
      case 'SET_DURATION':
         return { ...state, duration: action.payload };
      case 'SET_FULLSCREEN':
         return { ...state, isFullscreen: action.payload };
      case 'SET_SHOW_CONTROLS':
         return { ...state, showControls: action.payload };
      case 'SET_PLAYBACK_RATE':
         return { ...state, playbackRate: action.payload };
      case 'SET_QUALITY':
         return { ...state, quality: action.payload };
      case 'SET_LOOPING':
         return { ...state, isLooping: action.payload };
      case 'SET_VOLUME_INDICATOR':
         return { ...state, volumeIndicator: action.payload };
      case 'SET_SEEK_INDICATOR':
         return { ...state, seekIndicator: action.payload };
      case 'SET_ERROR':
         return { ...state, error: action.payload };
      case 'SET_CURRENT_VIDEO_SOURCE':
         return { ...state, currentVideoSource: action.payload };
      case 'SET_SUBTITLES_ENABLED':
         return { ...state, subtitlesEnabled: action.payload };
      case 'SET_AVAILABLE_SUBTITLES':
         return { ...state, availableSubtitles: action.payload };
      case 'SET_CURRENT_SUBTITLE':
         return { ...state, currentSubtitle: action.payload };
      case 'SET_AVAILABLE_AUDIO_TRACKS':
         return { ...state, availableAudioTracks: action.payload };
      case 'SET_CURRENT_AUDIO_TRACK':
         return { ...state, currentAudioTrack: action.payload };
      case 'SET_AUDIO_TRACKS_ENABLED':
         return { ...state, audioTracksEnabled: action.payload };
      case 'SET_PIP_SUPPORTED':
         return { ...state, pipSupported: action.payload };
      default:
         return state;
   }
};

// Analytics state reducer with debouncing
interface AnalyticsState {
   playCount: number;
   totalWatchTime: number;
   lastPlayTime: Date | null;
   errorCount: number;
   bufferingCount: number;
   qualityChanges: number;
   lastError: VideoError | null;
}

type AnalyticsAction =
   | { type: 'INCREMENT_PLAY_COUNT'; payload: Date }
   | { type: 'ADD_WATCH_TIME'; payload: number }
   | { type: 'INCREMENT_ERROR_COUNT'; payload: VideoError }
   | { type: 'INCREMENT_BUFFERING_COUNT' }
   | { type: 'INCREMENT_QUALITY_CHANGES' };

const analyticsReducer = (state: AnalyticsState, action: AnalyticsAction): AnalyticsState => {
   switch (action.type) {
      case 'INCREMENT_PLAY_COUNT':
         return { ...state, playCount: state.playCount + 1, lastPlayTime: action.payload };
      case 'ADD_WATCH_TIME':
         return { ...state, totalWatchTime: state.totalWatchTime + action.payload };
      case 'INCREMENT_ERROR_COUNT':
         return { ...state, errorCount: state.errorCount + 1, lastError: action.payload };
      case 'INCREMENT_BUFFERING_COUNT':
         return { ...state, bufferingCount: state.bufferingCount + 1 };
      case 'INCREMENT_QUALITY_CHANGES':
         return { ...state, qualityChanges: state.qualityChanges + 1 };
      default:
         return state;
   }
};

// Gesture state reducer
interface GestureState {
   gestureStartY: number | null;
   gestureStartX: number | null;
   brightness: number;
   gestureIndicator: {
      type: 'volume' | 'brightness' | 'seek' | 'speed' | null;
      value: number;
      position: { x: number; y: number };
   } | null;
   doubleTapIndicator: {
      type: 'forward' | 'backward' | 'play' | null;
      position: { x: number; y: number };
   } | null;
   threeFingerGesture: {
      type: 'screenshot' | 'settings' | null;
   } | null;
   shakeGesture: boolean;
   pinchGesture: {
      scale: number;
      center: { x: number; y: number };
   } | null;
}

type GestureAction =
   | { type: 'SET_GESTURE_START'; payload: { x: number | null; y: number | null } }
   | { type: 'SET_BRIGHTNESS'; payload: number }
   | { type: 'SET_GESTURE_INDICATOR'; payload: GestureState['gestureIndicator'] }
   | { type: 'SET_DOUBLE_TAP_INDICATOR'; payload: GestureState['doubleTapIndicator'] }
   | { type: 'SET_THREE_FINGER_GESTURE'; payload: GestureState['threeFingerGesture'] }
   | { type: 'SET_SHAKE_GESTURE'; payload: boolean }
   | { type: 'SET_PINCH_GESTURE'; payload: GestureState['pinchGesture'] };

const gestureReducer = (state: GestureState, action: GestureAction): GestureState => {
   switch (action.type) {
      case 'SET_GESTURE_START':
         return { ...state, gestureStartX: action.payload.x, gestureStartY: action.payload.y };
      case 'SET_BRIGHTNESS':
         return { ...state, brightness: action.payload };
      case 'SET_GESTURE_INDICATOR':
         return { ...state, gestureIndicator: action.payload };
      case 'SET_DOUBLE_TAP_INDICATOR':
         return { ...state, doubleTapIndicator: action.payload };
      case 'SET_THREE_FINGER_GESTURE':
         return { ...state, threeFingerGesture: action.payload };
      case 'SET_SHAKE_GESTURE':
         return { ...state, shakeGesture: action.payload };
      case 'SET_PINCH_GESTURE':
         return { ...state, pinchGesture: action.payload };
      default:
         return state;
   }
};

const VideoPlayer = memo(function VideoPlayer({ video, className, enableAnalytics = true }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    const { ref: inViewRef, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    // Feature detection for graceful degradation
    const { isAvailable: isVideoPlaybackAvailable } = useFeature('video-playback');
    const { isAvailable: isPiPAvailable } = useFeature('picture-in-picture');
    const { isAvailable: isFullscreenAvailable } = useFeature('fullscreen');
    const { showErrorToast } = useErrorToast();
    const { isOnline, isSlowConnection } = useNetworkStatus();

   // Initialize player state with useReducer
   const [playerState, dispatchPlayer] = useReducer(playerReducer, {
      isPlaying: false,
      volume: 1,
      isMuted: false,
      progress: 0,
      duration: 0,
      isFullscreen: false,
      showControls: true,
      playbackRate: 1,
      quality: 'Auto',
      isLooping: false,
      volumeIndicator: null,
      seekIndicator: null,
      error: null,
      currentVideoSource: null,
      subtitlesEnabled: false,
      availableSubtitles: [],
      currentSubtitle: '',
      availableAudioTracks: [],
      currentAudioTrack: '',
      audioTracksEnabled: true,
      pipSupported: false,
   });

   // Initialize analytics state with useReducer
   const [analyticsState, dispatchAnalytics] = useReducer(analyticsReducer, {
      playCount: 0,
      totalWatchTime: 0,
      lastPlayTime: null,
      errorCount: 0,
      bufferingCount: 0,
      qualityChanges: 0,
      lastError: null,
   });

   // Initialize gesture state with useReducer
   const [gestureState, dispatchGesture] = useReducer(gestureReducer, {
      gestureStartY: null,
      gestureStartX: null,
      brightness: 1,
      gestureIndicator: null,
      doubleTapIndicator: null,
      threeFingerGesture: null,
      shakeGesture: false,
      pinchGesture: null,
   });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchStartTimeRef = useRef<number | null>(null);
  const bufferingStartTimeRef = useRef<number | null>(null);
  const analyticsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deviceMotionHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const { toast } = useToast();

  // Create video sources from video data with enhanced validation
  const videoSources = useMemo((): VideoSource[] => {
    const sources: VideoSource[] = [];

    // Primary source: videoUrl (highest priority)
    if (video.videoUrl && typeof video.videoUrl === 'string' && video.videoUrl.trim()) {
      try {
        new URL(video.videoUrl); // Validate URL format
        sources.push({
          type: 'url',
          url: video.videoUrl.trim(),
          title: video.title
        });
      } catch {
        console.warn('Invalid video URL format:', video.videoUrl);
      }
    }

    // Secondary source: iframe_code (fallback)
    if (video.iframe_code && typeof video.iframe_code === 'string' && video.iframe_code.trim()) {
      // Basic iframe validation
      const iframeCode = video.iframe_code.trim();
      if (iframeCode.includes('<iframe') && iframeCode.includes('src=')) {
        sources.push({
          type: 'iframe',
          iframeCode: iframeCode,
          title: video.title
        });
      } else {
        console.warn('Invalid iframe code format');
      }
    }

    // Log source availability for debugging
    if (sources.length === 0) {
      console.warn('No valid video sources found for video:', video.id);
    } else {
      console.log(`Found ${sources.length} valid video sources for video:`, video.id);
    }

    return sources;
  }, [video.videoUrl, video.iframe_code, video.title, video.id]);

  // Memoize expensive computations to prevent unnecessary re-renders
  const memoizedControlsVisibility = useMemo(() => playerState.showControls || !playerState.isPlaying, [playerState.showControls, playerState.isPlaying]);
  const memoizedVolumeDisplay = useMemo(() => playerState.isMuted ? 0 : playerState.volume, [playerState.isMuted, playerState.volume]);
  const memoizedTimeDisplay = useMemo(() => `${formatTime(playerState.progress)} / ${formatTime(playerState.duration)}`, [playerState.progress, playerState.duration]);

  const hideControls = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      dispatchPlayer({ type: 'SET_SHOW_CONTROLS', payload: false });
    }
  }, []);

  const showAndAutoHideControls = useCallback(() => {
    dispatchPlayer({ type: 'SET_SHOW_CONTROLS', payload: true });
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  // Debounced analytics update function
  const debouncedAnalyticsUpdate = useCallback((action: AnalyticsAction) => {
    if (analyticsTimeoutRef.current) {
      clearTimeout(analyticsTimeoutRef.current);
    }
    analyticsTimeoutRef.current = setTimeout(() => {
      dispatchAnalytics(action);
    }, 500); // Debounce analytics updates by 500ms
  }, []);

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          dispatchPlayer({ type: 'SET_PLAYING', payload: true });
          if (enableAnalytics) {
            debouncedAnalyticsUpdate({ type: 'INCREMENT_PLAY_COUNT', payload: new Date() });
            watchStartTimeRef.current = Date.now();
          }
        }
      } catch (error) {
        const isNetworkError = !isOnline || error instanceof NetworkError;
        const errorMessage = isNetworkError
          ? 'Network connection issue. Please check your internet and try again.'
          : 'Unable to play the video. Please try again.';

        const videoError = new VideoPlaybackError(
          errorMessage,
          {
            details: error,
            component: 'VideoPlayer',
            action: 'togglePlay',
            context: { videoId: video.id, videoUrl: video.videoUrl, isOnline, isSlowConnection }
          }
        );

        // Convert to VideoError format for state
        const stateError: VideoError = {
          type: isNetworkError ? 'network' : 'unknown',
          message: errorMessage,
          details: error
        };

        dispatchPlayer({ type: 'SET_ERROR', payload: stateError });
        if (enableAnalytics) {
          debouncedAnalyticsUpdate({ type: 'INCREMENT_ERROR_COUNT', payload: stateError });
        }

        showErrorToast(videoError, {
          onRetry: () => {
            dispatchPlayer({ type: 'SET_ERROR', payload: null });
            togglePlay();
          }
        });
      }
    } else {
      videoRef.current.pause();
      dispatchPlayer({ type: 'SET_PLAYING', payload: false });
      if (enableAnalytics && watchStartTimeRef.current) {
        const watchTime = (Date.now() - watchStartTimeRef.current) / 1000;
        debouncedAnalyticsUpdate({ type: 'ADD_WATCH_TIME', payload: watchTime });
        watchStartTimeRef.current = null;
      }
    }
    showAndAutoHideControls();
  }, [showAndAutoHideControls, enableAnalytics, debouncedAnalyticsUpdate, video.id, video.videoUrl, showErrorToast]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      dispatchPlayer({ type: 'SET_VOLUME', payload: newVolume });
    }
  }, []);

  const volumeIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showVolumeIndicator = useCallback((newVolume: number) => {
    if (volumeIndicatorTimeoutRef.current) {
      clearTimeout(volumeIndicatorTimeoutRef.current);
    }
    dispatchPlayer({ type: 'SET_VOLUME_INDICATOR', payload: newVolume * 100 });
    volumeIndicatorTimeoutRef.current = setTimeout(() => {
      dispatchPlayer({ type: 'SET_VOLUME_INDICATOR', payload: null });
      volumeIndicatorTimeoutRef.current = null;
    }, 1000);
  }, []);

  const changeVolume = useCallback((amount: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + amount));
      videoRef.current.volume = newVolume;
      dispatchPlayer({ type: 'SET_VOLUME', payload: newVolume });
      showVolumeIndicator(newVolume);
    }
  }, [showVolumeIndicator]);


  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      dispatchPlayer({ type: 'SET_MUTED', payload: newMuted });
      if (newMuted) {
        showVolumeIndicator(0);
      } else {
        showVolumeIndicator(videoRef.current.volume);
      }
    }
  }, [showVolumeIndicator]);

  const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const seek = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
      if (seekIndicatorTimeoutRef.current) {
        clearTimeout(seekIndicatorTimeoutRef.current);
      }
      dispatchPlayer({ type: 'SET_SEEK_INDICATOR', payload: amount > 0 ? 'forward' : 'backward' });
      seekIndicatorTimeoutRef.current = setTimeout(() => {
        dispatchPlayer({ type: 'SET_SEEK_INDICATOR', payload: null });
        seekIndicatorTimeoutRef.current = null;
      }, 500);
    }
  }, []);

  const handleProgressChange = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      dispatchPlayer({ type: 'SET_PROGRESS', payload: newTime });
    }
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreenAvailable) {
      showErrorToast(new VideoPlaybackError('Fullscreen is not supported in this browser'));
      return;
    }

    const container = playerContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        dispatchPlayer({ type: 'SET_FULLSCREEN', payload: true });
      } else {
        await document.exitFullscreen();
        dispatchPlayer({ type: 'SET_FULLSCREEN', payload: false });
      }
    } catch (error) {
      const fullscreenError = new VideoPlaybackError(
        'Failed to toggle fullscreen mode',
        { details: error, component: 'VideoPlayer', action: 'toggleFullscreen' }
      );
      showErrorToast(fullscreenError);
    }
  }, [isFullscreenAvailable, showErrorToast]);

  const togglePiP = useCallback(async () => {
    if (!isPiPAvailable) {
      showErrorToast(new VideoPlaybackError('Picture-in-Picture is not supported in this browser'));
      return;
    }

    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        const pipError = new VideoPlaybackError(
          'Failed to toggle Picture-in-Picture mode',
          { details: error, component: 'VideoPlayer', action: 'togglePiP' }
        );
        showErrorToast(pipError);
      }
    }
  }, [isPiPAvailable, showErrorToast]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      dispatchPlayer({ type: 'SET_PLAYBACK_RATE', payload: rate });
    }
  }, []);

  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now = new Date().getTime();
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      // Double tap - enhanced gesture control
      if (tapX < rect.width / 3) {
        seek(-10); // Seek backward
        dispatchGesture({
          type: 'SET_DOUBLE_TAP_INDICATOR',
          payload: { type: 'backward', position: { x: tapX, y: tapY } }
        });
      } else if (tapX > (rect.width * 2) / 3) {
        seek(10); // Seek forward
        dispatchGesture({
          type: 'SET_DOUBLE_TAP_INDICATOR',
          payload: { type: 'forward', position: { x: tapX, y: tapY } }
        });
      } else {
        togglePlay();
        dispatchGesture({
          type: 'SET_DOUBLE_TAP_INDICATOR',
          payload: { type: 'play', position: { x: tapX, y: tapY } }
        });
      }
      setTimeout(() => dispatchGesture({ type: 'SET_DOUBLE_TAP_INDICATOR', payload: null }), 1000);
      lastTapRef.current = 0; // Reset tap timer
    } else {
      // Single tap
      dispatchPlayer({ type: 'SET_SHOW_CONTROLS', payload: !playerState.showControls });
    }
    lastTapRef.current = now;
  }, [seek, togglePlay, playerState.showControls]);
  
  const gestureIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    dispatchGesture({
      type: 'SET_GESTURE_START',
      payload: { x: e.clientX, y: e.clientY }
    });
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    longPressTimeoutRef.current = setTimeout(() => {
        if(videoRef.current) {
            videoRef.current.playbackRate = 2;
            if (gestureIndicatorTimeoutRef.current) {
              clearTimeout(gestureIndicatorTimeoutRef.current);
            }
            dispatchGesture({
              type: 'SET_GESTURE_INDICATOR',
              payload: {
                type: 'speed',
                value: 200,
                position: { x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top }
              }
            });
            gestureIndicatorTimeoutRef.current = setTimeout(() => {
              dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
              gestureIndicatorTimeoutRef.current = null;
            }, 1000);
        }
    }, 500);
  }, []);

  const handleMouseUp = useCallback(() => {
      if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
      }
      if(videoRef.current) {
          videoRef.current.playbackRate = playerState.playbackRate;
      }
      dispatchGesture({
        type: 'SET_GESTURE_START',
        payload: { x: null, y: null }
      });
  }, [playerState.playbackRate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gestureState.gestureStartX !== null && gestureState.gestureStartY !== null) {
      const deltaX = e.clientX - gestureState.gestureStartX;
      const deltaY = e.clientY - gestureState.gestureStartY;
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      const isLeftSide = relativeX < rect.width * 0.3;
      const isRightSide = relativeX > rect.width * 0.7;

      // Horizontal swipe for seeking
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const seekAmount = Math.floor(deltaX / 10);
        seek(seekAmount);
        if (gestureIndicatorTimeoutRef.current) {
          clearTimeout(gestureIndicatorTimeoutRef.current);
        }
        dispatchGesture({
          type: 'SET_GESTURE_INDICATOR',
          payload: {
            type: 'seek',
            value: seekAmount,
            position: { x: relativeX, y: relativeY }
          }
        });
        gestureIndicatorTimeoutRef.current = setTimeout(() => {
          dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
          gestureIndicatorTimeoutRef.current = null;
        }, 1000);
        dispatchGesture({
          type: 'SET_GESTURE_START',
          payload: { x: e.clientX, y: gestureState.gestureStartY }
        });
      }

      // Vertical swipe on sides for volume/brightness
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
        if (isRightSide) {
          // Right side: volume control
          const volumeChange = deltaY > 0 ? -0.05 : 0.05;
          changeVolume(volumeChange);
          if (gestureIndicatorTimeoutRef.current) {
            clearTimeout(gestureIndicatorTimeoutRef.current);
          }
          dispatchGesture({
            type: 'SET_GESTURE_INDICATOR',
            payload: {
              type: 'volume',
              value: playerState.volume * 100,
              position: { x: relativeX, y: relativeY }
            }
          });
          gestureIndicatorTimeoutRef.current = setTimeout(() => {
            dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
            gestureIndicatorTimeoutRef.current = null;
          }, 1000);
        } else if (isLeftSide) {
          // Left side: brightness control
          const newBrightness = Math.max(0.1, Math.min(2, gestureState.brightness + (deltaY > 0 ? -0.1 : 0.1)));
          dispatchGesture({ type: 'SET_BRIGHTNESS', payload: newBrightness });
          // Apply brightness to video container
          const container = e.currentTarget as HTMLElement;
          container.style.filter = `brightness(${newBrightness})`;
          if (gestureIndicatorTimeoutRef.current) {
            clearTimeout(gestureIndicatorTimeoutRef.current);
          }
          dispatchGesture({
            type: 'SET_GESTURE_INDICATOR',
            payload: {
              type: 'brightness',
              value: newBrightness * 50,
              position: { x: relativeX, y: relativeY }
            }
          });
          gestureIndicatorTimeoutRef.current = setTimeout(() => {
            dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
            gestureIndicatorTimeoutRef.current = null;
          }, 1000);
        }
        dispatchGesture({
          type: 'SET_GESTURE_START',
          payload: { x: gestureState.gestureStartX, y: e.clientY }
        });
      }
    }
  }, [gestureState.gestureStartX, gestureState.gestureStartY, gestureState.brightness, playerState.volume, seek, changeVolume]);
  
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
             const newRate = Math.min(playerState.playbackRate * 2, 4);
             handlePlaybackRateChange(newRate);
           }
           break;
         case '<':
           if (e.shiftKey && videoRef.current) {
             const newRate = Math.max(playerState.playbackRate / 2, 0.25);
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
   }, [togglePlay, toggleFullscreen, togglePiP, seek, changeVolume, playerState.playbackRate, handlePlaybackRateChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => dispatchPlayer({ type: 'SET_PROGRESS', payload: video.currentTime });
    const setVideoDuration = () => dispatchPlayer({ type: 'SET_DURATION', payload: video.duration });
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const errorCode = target.error?.code;
      let errorType: VideoError['type'] = 'unknown';
      let errorMessage = target.error?.message || 'Unknown error';

      // Map HTMLMediaElement error codes to our error types
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          errorType = 'network';
          errorMessage = 'Video loading was aborted';
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorType = 'network';
          errorMessage = 'Network error while loading video';
          break;
        case 3: // MEDIA_ERR_DECODE
          errorType = 'format';
          errorMessage = 'Video format is not supported or corrupted';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorType = 'invalid_source';
          errorMessage = 'Video source is not supported';
          break;
        default:
          errorType = 'unknown';
      }

      const videoError: VideoError = {
        type: errorType,
        message: errorMessage,
        code: errorCode,
        details: target.error
      };

      const legacyVideoError: VideoError = {
        type: 'network',
        message: videoError.message,
        details: videoError
      };
      dispatchPlayer({ type: 'SET_ERROR', payload: legacyVideoError });
      if (enableAnalytics) {
        debouncedAnalyticsUpdate({ type: 'INCREMENT_ERROR_COUNT', payload: legacyVideoError });
      }

      // Log the error
      errorLogger.logError(createErrorFromUnknown(videoError));

      toast({
        variant: 'destructive',
        title: 'Video Error',
        description: errorMessage,
      });
    };

    const handleWaiting = () => {
        if (enableAnalytics && !bufferingStartTimeRef.current) {
          bufferingStartTimeRef.current = Date.now();
        }
  
        // Show buffering indicator for slow connections
        if (isSlowConnection && !isOnline) {
          toast({
            title: "Buffering",
            description: "Slow connection detected. Video may buffer frequently.",
            duration: 3000,
          });
        }
      };
  
      const handlePlaying = () => {
        if (enableAnalytics && bufferingStartTimeRef.current) {
          const bufferingTime = Date.now() - bufferingStartTimeRef.current;
          debouncedAnalyticsUpdate({ type: 'INCREMENT_BUFFERING_COUNT' });
          bufferingStartTimeRef.current = null;
        }
      };

    // Check for subtitle tracks
    const checkSubtitles = () => {
      const tracks = Array.from(video.textTracks || []);
      const subtitleTracks = tracks.filter(track => track.kind === 'subtitles');
      dispatchPlayer({ type: 'SET_AVAILABLE_SUBTITLES', payload: subtitleTracks.map(track => track.label || track.language) });
    };

    // Check for audio tracks (using WebVTT or similar for demo purposes)
    const checkAudioTracks = () => {
      // For demo purposes, we'll simulate audio tracks
      // In a real implementation, this would check video.audioTracks
      const mockAudioTracks = [
        { id: 'original', label: 'Original Audio', language: 'en' },
        { id: 'dubbed', label: 'Dubbed Audio', language: 'en' },
      ];
      dispatchPlayer({ type: 'SET_AVAILABLE_AUDIO_TRACKS', payload: mockAudioTracks });

      if (mockAudioTracks.length > 0 && !playerState.currentAudioTrack) {
        dispatchPlayer({ type: 'SET_CURRENT_AUDIO_TRACK', payload: 'original' });
      }
    };

    // Check PiP support
    dispatchPlayer({ type: 'SET_PIP_SUPPORTED', payload: document.pictureInPictureEnabled });

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('loadedmetadata', checkSubtitles);
    video.addEventListener('loadedmetadata', checkAudioTracks);
    video.addEventListener('play', () => dispatchPlayer({ type: 'SET_PLAYING', payload: true }));
    video.addEventListener('pause', () => dispatchPlayer({ type: 'SET_PLAYING', payload: false }));
    video.addEventListener('ratechange', () => dispatchPlayer({ type: 'SET_PLAYBACK_RATE', payload: video.playbackRate }));
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.loop = playerState.isLooping;

    const handleFullscreenChange = () => {
      dispatchPlayer({ type: 'SET_FULLSCREEN', payload: !!document.fullscreenElement });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
     video.removeEventListener('loadedmetadata', setVideoDuration);
     video.removeEventListener('loadedmetadata', checkSubtitles);
     video.removeEventListener('loadedmetadata', checkAudioTracks);
     video.removeEventListener('play', () => dispatchPlayer({ type: 'SET_PLAYING', payload: true }));
     video.removeEventListener('pause', () => dispatchPlayer({ type: 'SET_PLAYING', payload: false }));
     video.removeEventListener('ratechange', () => dispatchPlayer({ type: 'SET_PLAYBACK_RATE', payload: video.playbackRate }));
     video.removeEventListener('error', handleError);
     video.removeEventListener('waiting', handleWaiting);
     video.removeEventListener('playing', handlePlaying);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [playerState.isLooping, toast, enableAnalytics, debouncedAnalyticsUpdate]);

  useEffect(() => {
    showAndAutoHideControls();
    const container = playerContainerRef.current;
    container?.focus();
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      if (analyticsTimeoutRef.current) {
        clearTimeout(analyticsTimeoutRef.current);
        analyticsTimeoutRef.current = null;
      }
      if (volumeIndicatorTimeoutRef.current) {
        clearTimeout(volumeIndicatorTimeoutRef.current);
        volumeIndicatorTimeoutRef.current = null;
      }
      if (seekIndicatorTimeoutRef.current) {
        clearTimeout(seekIndicatorTimeoutRef.current);
        seekIndicatorTimeoutRef.current = null;
      }
      if (gestureIndicatorTimeoutRef.current) {
        clearTimeout(gestureIndicatorTimeoutRef.current);
        gestureIndicatorTimeoutRef.current = null;
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAndAutoHideControls, handleKeyDown]);

  const qualities = ['1080p', '720p', '480p', 'Auto'];
  const speeds = [2, 1.5, 1, 0.5];

  // Video source handlers
  const handleSourceReady = useCallback((source: VideoSource) => {
    dispatchPlayer({ type: 'SET_CURRENT_VIDEO_SOURCE', payload: source });
    dispatchPlayer({ type: 'SET_ERROR', payload: null });
    if (enableAnalytics) {
      // Log successful source loading
      console.log('Video source loaded successfully:', source);
    }
  }, [enableAnalytics]);

  const handleSourceError = useCallback((error: VideoError) => {
    dispatchPlayer({ type: 'SET_ERROR', payload: error });
    if (enableAnalytics) {
      debouncedAnalyticsUpdate({ type: 'INCREMENT_ERROR_COUNT', payload: error });
    }
  }, [enableAnalytics, debouncedAnalyticsUpdate]);

  // Quality change handler with analytics
  const handleQualityChange = useCallback((newQuality: string) => {
    dispatchPlayer({ type: 'SET_QUALITY', payload: newQuality });
    if (enableAnalytics) {
      debouncedAnalyticsUpdate({ type: 'INCREMENT_QUALITY_CHANGES' });
    }
  }, [enableAnalytics, debouncedAnalyticsUpdate]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single touch - regular gesture
      dispatchGesture({
        type: 'SET_GESTURE_START',
        payload: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      });
    } else if (e.touches.length === 2) {
      // Two finger touch - potential pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      dispatchGesture({
        type: 'SET_PINCH_GESTURE',
        payload: {
          scale: 1,
          center: {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
          }
        }
      });
    } else if (e.touches.length === 3) {
      // Three finger touch - special gesture
      dispatchGesture({ type: 'SET_THREE_FINGER_GESTURE', payload: { type: 'screenshot' } });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && gestureState.gestureStartX !== null && gestureState.gestureStartY !== null) {
      const deltaX = e.touches[0].clientX - gestureState.gestureStartX;
      const deltaY = e.touches[0].clientY - gestureState.gestureStartY;
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.touches[0].clientX - rect.left;
      const isLeftSide = relativeX < rect.width * 0.3;
      const isRightSide = relativeX > rect.width * 0.7;

      // Horizontal swipe for seeking
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        const seekAmount = Math.floor(deltaX / 5);
        seek(seekAmount);
        if (gestureIndicatorTimeoutRef.current) {
          clearTimeout(gestureIndicatorTimeoutRef.current);
        }
        dispatchGesture({
          type: 'SET_GESTURE_INDICATOR',
          payload: {
            type: 'seek',
            value: seekAmount,
            position: { x: relativeX, y: e.touches[0].clientY - rect.top }
          }
        });
        gestureIndicatorTimeoutRef.current = setTimeout(() => {
          dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
          gestureIndicatorTimeoutRef.current = null;
        }, 1000);
      }

      // Vertical swipe for volume/brightness
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
        if (isRightSide) {
          changeVolume(deltaY > 0 ? -0.05 : 0.05);
          if (gestureIndicatorTimeoutRef.current) {
            clearTimeout(gestureIndicatorTimeoutRef.current);
          }
          dispatchGesture({
            type: 'SET_GESTURE_INDICATOR',
            payload: {
              type: 'volume',
              value: playerState.volume * 100,
              position: { x: relativeX, y: e.touches[0].clientY - rect.top }
            }
          });
          gestureIndicatorTimeoutRef.current = setTimeout(() => {
            dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
            gestureIndicatorTimeoutRef.current = null;
          }, 1000);
        } else if (isLeftSide) {
          const newBrightness = Math.max(0.1, Math.min(2, gestureState.brightness + (deltaY > 0 ? -0.1 : 0.1)));
          dispatchGesture({ type: 'SET_BRIGHTNESS', payload: newBrightness });
          e.currentTarget.style.filter = `brightness(${newBrightness})`;
          if (gestureIndicatorTimeoutRef.current) {
            clearTimeout(gestureIndicatorTimeoutRef.current);
          }
          dispatchGesture({
            type: 'SET_GESTURE_INDICATOR',
            payload: {
              type: 'brightness',
              value: newBrightness * 50,
              position: { x: relativeX, y: e.touches[0].clientY - rect.top }
            }
          });
          gestureIndicatorTimeoutRef.current = setTimeout(() => {
            dispatchGesture({ type: 'SET_GESTURE_INDICATOR', payload: null });
            gestureIndicatorTimeoutRef.current = null;
          }, 1000);
        }
      }
    } else if (e.touches.length === 2 && gestureState.pinchGesture) {
      // Handle pinch gesture for zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / 100; // Normalize scale
      dispatchGesture({
        type: 'SET_PINCH_GESTURE',
        payload: gestureState.pinchGesture ? { ...gestureState.pinchGesture, scale } : null
      });

      // Apply zoom to video
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${scale})`;
      }
    }
  }, [gestureState.gestureStartX, gestureState.gestureStartY, gestureState.brightness, gestureState.pinchGesture, playerState.volume, seek, changeVolume]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches.length === 1) {
      dispatchGesture({
        type: 'SET_GESTURE_START',
        payload: { x: null, y: null }
      });
    }

    if (gestureState.pinchGesture) {
      // Reset zoom after pinch ends
      if (videoRef.current) {
        videoRef.current.style.transform = 'scale(1)';
      }
      dispatchGesture({ type: 'SET_PINCH_GESTURE', payload: null });
    }

    if (gestureState.threeFingerGesture) {
      if (gestureState.threeFingerGesture.type === 'screenshot') {
        // Take screenshot
        takeScreenshot();
      }
      dispatchGesture({ type: 'SET_THREE_FINGER_GESTURE', payload: null });
    }
  }, [gestureState.pinchGesture, gestureState.threeFingerGesture]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    changeVolume(delta);
  };

  // Simplified shake gesture detection
  useEffect(() => {
    let shakeCount = 0;
    let lastShakeTime = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const now = Date.now();
      if (now - lastShakeTime < 100) return; // Throttle shake detection

      const totalAcceleration = Math.abs(acceleration.x!) + Math.abs(acceleration.y!) + Math.abs(acceleration.z!);

      if (totalAcceleration > 25) {
        shakeCount++;
        lastShakeTime = now;
        if (shakeCount >= 3) {
          dispatchGesture({ type: 'SET_SHAKE_GESTURE', payload: true });
          setTimeout(() => dispatchGesture({ type: 'SET_SHAKE_GESTURE', payload: false }), 1000);
          shakeCount = 0;
        }
      } else if (now - lastShakeTime > 500) {
        shakeCount = Math.max(0, shakeCount - 1);
      }
    };

    deviceMotionHandlerRef.current = handleDeviceMotion;

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => {
        if (deviceMotionHandlerRef.current) {
          window.removeEventListener('devicemotion', deviceMotionHandlerRef.current);
          deviceMotionHandlerRef.current = null;
        }
      };
    }
  }, []);

  const takeScreenshot = useCallback(async () => {
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
  }, [toast]);

  const toggleSubtitles = useCallback(() => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          tracks[i].mode = playerState.subtitlesEnabled ? 'disabled' : 'showing';
        }
      }
      dispatchPlayer({ type: 'SET_SUBTITLES_ENABLED', payload: !playerState.subtitlesEnabled });
    }
  }, [playerState.subtitlesEnabled]);

  const selectSubtitle = useCallback((language: string) => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          tracks[i].mode = tracks[i].label === language || tracks[i].language === language ? 'showing' : 'disabled';
        }
      }
      dispatchPlayer({ type: 'SET_CURRENT_SUBTITLE', payload: language });
    }
  }, []);

  const selectAudioTrack = useCallback((trackId: string) => {
    // In a real implementation, this would switch audio tracks
    // For demo purposes, we'll just update the state
    dispatchPlayer({ type: 'SET_CURRENT_AUDIO_TRACK', payload: trackId });
    toast({
      title: 'Audio track changed',
      description: `Switched to ${playerState.availableAudioTracks.find(t => t.id === trackId)?.label || 'Unknown track'}`,
    });
  }, [playerState.availableAudioTracks, toast]);

  const toggleAudioTracks = useCallback(() => {
    dispatchPlayer({ type: 'SET_AUDIO_TRACKS_ENABLED', payload: !playerState.audioTracksEnabled });
    toast({
      title: playerState.audioTracksEnabled ? 'Audio tracks disabled' : 'Audio tracks enabled',
      description: 'Multi-track audio has been toggled.',
    });
  }, [playerState.audioTracksEnabled, toast]);

  return (
    <div
      ref={(node) => {
        if (node) {
          playerContainerRef.current = node;
          inViewRef(node);
        }
      }}
      tabIndex={0}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl bg-black group',
        className,
        playerState.isFullscreen && 'fixed inset-0 z-50 rounded-none'
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
      <VideoLoader
        sources={videoSources}
        onSourceReady={handleSourceReady}
        onError={handleSourceError}
        className={cn('w-full h-full', className)}
      >
        {playerState.currentVideoSource ? (
          playerState.currentVideoSource.type === 'url' ? (
            <video
              ref={videoRef}
              src={playerState.currentVideoSource.url}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <LazyIframe
              srcDoc={playerState.currentVideoSource.iframeCode || ''}
              title={playerState.currentVideoSource.title || video.title}
              className="w-full h-full"
            />
          )
        ) : inView ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white text-lg">Preparing video...</div>
          </div>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white text-lg">Video will load when in view</div>
          </div>
        )}
      </VideoLoader>
      {/* Smart Skip Detector */}
      <SmartSkipDetector
        videoRef={videoRef}
        currentTime={playerState.progress}
        duration={playerState.duration}
        onSkip={(time) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        }}
        className="absolute inset-0"
      />

      {/* Network Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <NetworkStatusIndicator compact />
      </div>

      {/* Cross-Device Sync */}
      <div className="absolute top-20 right-4 z-10">
        <CrossDeviceSync
          videoId={video.id}
          currentTime={playerState.progress}
          isPlaying={playerState.isPlaying}
          onSyncFromDevice={(time, playing) => {
            if (videoRef.current) {
              videoRef.current.currentTime = time;
              if (playing !== playerState.isPlaying) {
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
          {playerState.seekIndicator === 'backward' && <Rewind className="animate-ping" />}
          {playerState.seekIndicator === 'forward' && <FastForward className="animate-ping" />}
          {gestureState.doubleTapIndicator && (
            <div className="absolute" style={{
              left: gestureState.doubleTapIndicator.position.x - 50,
              top: gestureState.doubleTapIndicator.position.y - 50,
              animation: 'fadeOut 1s ease-out forwards'
            }}>
              {gestureState.doubleTapIndicator.type === 'backward' && <Rewind className="text-6xl animate-bounce" />}
              {gestureState.doubleTapIndicator.type === 'forward' && <FastForward className="text-6xl animate-bounce" />}
              {gestureState.doubleTapIndicator.type === 'play' && <Play className="text-6xl animate-bounce" />}
            </div>
          )}
          {gestureState.gestureIndicator && (
            <div className="absolute bg-black/70 p-3 rounded-lg" style={{
              left: gestureState.gestureIndicator.position.x - 60,
              top: gestureState.gestureIndicator.position.y - 40,
              animation: 'fadeOut 1s ease-out forwards'
            }}>
              {gestureState.gestureIndicator.type === 'volume' && (
                <div className="flex flex-col items-center">
                  {gestureState.gestureIndicator.value > 50 && <Volume2 />}
                  {gestureState.gestureIndicator.value <= 50 && gestureState.gestureIndicator.value > 0 && <Volume1 />}
                  {gestureState.gestureIndicator.value === 0 && <VolumeX />}
                  <span className="text-lg mt-1">{Math.round(gestureState.gestureIndicator.value)}%</span>
                </div>
              )}
              {gestureState.gestureIndicator.type === 'brightness' && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">☀️</span>
                  <span className="text-lg mt-1">{Math.round(gestureState.gestureIndicator.value)}%</span>
                </div>
              )}
              {gestureState.gestureIndicator.type === 'seek' && (
                <div className="flex flex-col items-center">
                  {gestureState.gestureIndicator.value > 0 ? <FastForward /> : <Rewind />}
                  <span className="text-lg mt-1">{Math.abs(gestureState.gestureIndicator.value)}s</span>
                </div>
              )}
              {gestureState.gestureIndicator.type === 'speed' && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⚡</span>
                  <span className="text-lg mt-1">{gestureState.gestureIndicator.value}%</span>
                </div>
              )}
            </div>
          )}
          {gestureState.shakeGesture && (
            <div className="bg-black/70 p-4 rounded-lg animate-bounce">
              <span className="text-2xl">🎲</span>
              <div className="text-sm mt-1">Random Video</div>
            </div>
          )}
          {gestureState.pinchGesture && (
            <div className="bg-black/70 p-3 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div className="text-sm mt-1">Zoom: {gestureState.pinchGesture.scale.toFixed(1)}x</div>
            </div>
          )}
          {gestureState.threeFingerGesture && (
            <div className="bg-black/70 p-3 rounded-lg animate-pulse">
              <span className="text-2xl">📸</span>
              <div className="text-sm mt-1">Screenshot</div>
            </div>
          )}
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300',
          memoizedControlsVisibility ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Slider
          value={[playerState.progress]}
          max={playerState.duration}
          onValueChange={handleProgressChange}
          className="w-full h-1.5 absolute top-0 left-0 right-0 opacity-100 cursor-pointer group-hover:h-2 transition-all"
        />

        <div id="video-controls" className="flex items-center gap-4 text-white mt-2" role="toolbar" aria-label="Video controls">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/20"
            onClick={(e) => {e.stopPropagation(); togglePlay();}}
            aria-label={playerState.isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={playerState.isPlaying}
          >
            {playerState.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2 group/volume">
            <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleMute();}}>
              {playerState.isMuted || playerState.volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[memoizedVolumeDisplay]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-0 group-hover/volume:w-24 transition-[width] duration-300 cursor-pointer"
            />
          </div>
          <div className="text-xs">
            {memoizedTimeDisplay}
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
                        <Check className={cn('mr-2 h-4 w-4', playerState.playbackRate === speed ? 'opacity-100' : 'opacity-0')} /> {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                 <DropdownMenuSub>
                   <DropdownMenuSubTrigger>Quality</DropdownMenuSubTrigger>
                   <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                     {qualities.map((q) => (
                         <DropdownMenuItem key={q} onClick={() => handleQualityChange(q)}>
                              <Check className={cn('mr-2 h-4 w-4', playerState.quality === q ? 'opacity-100' : 'opacity-0')} /> {q}
                           </DropdownMenuItem>
                     ))}
                   </DropdownMenuSubContent>
                 </DropdownMenuSub>
                 {playerState.availableSubtitles.length > 0 && (
                   <DropdownMenuSub>
                     <DropdownMenuSubTrigger>Subtitles</DropdownMenuSubTrigger>
                     <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                       <DropdownMenuItem onClick={toggleSubtitles}>
                         <Check className={cn('mr-2 h-4 w-4', playerState.subtitlesEnabled ? 'opacity-100' : 'opacity-0')} />
                         {playerState.subtitlesEnabled ? 'Disable' : 'Enable'} Subtitles
                       </DropdownMenuItem>
                       {playerState.availableSubtitles.map((subtitle) => (
                         <DropdownMenuItem key={subtitle} onClick={() => selectSubtitle(subtitle)}>
                           <Check className={cn('mr-2 h-4 w-4', playerState.currentSubtitle === subtitle ? 'opacity-100' : 'opacity-0')} />
                           {subtitle}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuSubContent>
                   </DropdownMenuSub>
                 )}
                 {playerState.availableAudioTracks.length > 1 && (
                   <DropdownMenuSub>
                     <DropdownMenuSubTrigger>Audio Tracks</DropdownMenuSubTrigger>
                     <DropdownMenuSubContent sideOffset={5} alignOffset={-5} className="bg-black/80 text-white border-white/20">
                       <DropdownMenuItem onClick={toggleAudioTracks}>
                         <Check className={cn('mr-2 h-4 w-4', playerState.audioTracksEnabled ? 'opacity-100' : 'opacity-0')} />
                         {playerState.audioTracksEnabled ? 'Disable' : 'Enable'} Multi-Track Audio
                       </DropdownMenuItem>
                       {playerState.availableAudioTracks.map((track) => (
                         <DropdownMenuItem key={track.id} onClick={() => selectAudioTrack(track.id)}>
                           <Check className={cn('mr-2 h-4 w-4', playerState.currentAudioTrack === track.id ? 'opacity-100' : 'opacity-0')} />
                           {track.label} ({track.language})
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuSubContent>
                   </DropdownMenuSub>
                 )}
                 <DropdownMenuItem onClick={() => dispatchPlayer({ type: 'SET_LOOPING', payload: !playerState.isLooping })}>
                            <Check className={cn('mr-2 h-4 w-4', playerState.isLooping ? 'opacity-100' : 'opacity-0')} /> Loop
                        </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          {playerState.availableSubtitles.length > 0 && (
            <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleSubtitles();}}>
              <Subtitles className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); togglePiP();}} disabled={!isPiPAvailable}>
            <PictureInPicture2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={(e) => {e.stopPropagation(); toggleFullscreen();}}>
            {playerState.isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export { VideoPlayer };
