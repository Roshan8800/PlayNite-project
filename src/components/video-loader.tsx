'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type VideoSourceType = 'url' | 'iframe';

export interface VideoSource {
  type: VideoSourceType;
  url?: string;
  iframeCode?: string;
  title?: string;
}

export interface VideoLoadState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: VideoError;
  retryCount: number;
  lastAttempt?: Date;
}

export interface VideoError {
  type: 'network' | 'format' | 'cors' | 'timeout' | 'invalid_source' | 'unknown';
  message: string;
  code?: number;
  details?: any;
}

interface VideoLoaderProps {
  sources: VideoSource[];
  onSourceReady: (source: VideoSource) => void;
  onError: (error: VideoError) => void;
  className?: string;
  maxRetries?: number;
  timeout?: number;
  children?: React.ReactNode;
}

export function VideoLoader({
  sources,
  onSourceReady,
  onError,
  className,
  maxRetries = 3,
  timeout = 10000,
  children
}: VideoLoaderProps) {
  const [loadStates, setLoadStates] = useState<Map<string, VideoLoadState>>(new Map());
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getSourceKey = (source: VideoSource, index: number) => `${source.type}-${index}`;

  const validateSource = (source: VideoSource): VideoError | null => {
    if (source.type === 'url') {
      if (!source.url) {
        return { type: 'invalid_source', message: 'Video URL is missing' };
      }
      try {
        new URL(source.url);
      } catch {
        return { type: 'invalid_source', message: 'Invalid video URL format' };
      }
    } else if (source.type === 'iframe') {
      if (!source.iframeCode) {
        return { type: 'invalid_source', message: 'Iframe code is missing' };
      }
      // Basic iframe validation
      if (!source.iframeCode.includes('<iframe') || !source.iframeCode.includes('src=')) {
        return { type: 'invalid_source', message: 'Invalid iframe code format' };
      }
    }
    return null;
  };

  const testVideoUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      const timeoutId = setTimeout(() => {
        video.remove();
        resolve(false);
      }, timeout);

      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        video.remove();
        resolve(true);
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        video.remove();
        resolve(false);
      };

      video.src = url;
    });
  };

  const testIframeCode = (iframeCode: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Extract src from iframe code
        const parser = new DOMParser();
        const doc = parser.parseFromString(iframeCode, 'text/html');
        const iframe = doc.querySelector('iframe');
        if (!iframe || !iframe.src) {
          resolve(false);
          return;
        }

        // Test if iframe src is accessible
        fetch(iframe.src, { method: 'HEAD', mode: 'no-cors' })
          .then(() => resolve(true))
          .catch(() => resolve(false));
      } catch {
        resolve(false);
      }
    });
  };

  const loadSource = useCallback(async (source: VideoSource, index: number) => {
    const sourceKey = getSourceKey(source, index);
    const currentState = loadStates.get(sourceKey) || { status: 'idle', retryCount: 0 };

    if (currentState.retryCount >= maxRetries) {
      return;
    }

    setLoadStates(prev => new Map(prev.set(sourceKey, {
      ...currentState,
      status: 'loading',
      lastAttempt: new Date()
    })));

    // Validate source first
    const validationError = validateSource(source);
    if (validationError) {
      const errorState: VideoLoadState = {
        status: 'error',
        error: validationError,
        retryCount: currentState.retryCount + 1,
        lastAttempt: new Date()
      };
      setLoadStates(prev => new Map(prev.set(sourceKey, errorState)));
      onError(validationError);
      return;
    }

    try {
      let isValid = false;

      if (source.type === 'url' && source.url) {
        isValid = await testVideoUrl(source.url);
      } else if (source.type === 'iframe' && source.iframeCode) {
        isValid = await testIframeCode(source.iframeCode);
      }

      if (isValid) {
        setLoadStates(prev => new Map(prev.set(sourceKey, {
          status: 'ready',
          retryCount: currentState.retryCount,
          lastAttempt: new Date()
        })));
        onSourceReady(source);
      } else {
        throw new Error('Source validation failed');
      }
    } catch (error) {
      const videoError: VideoError = {
        type: 'network',
        message: error instanceof Error ? error.message : 'Failed to load video source',
        details: error
      };

      const errorState: VideoLoadState = {
        status: 'error',
        error: videoError,
        retryCount: currentState.retryCount + 1,
        lastAttempt: new Date()
      };

      setLoadStates(prev => new Map(prev.set(sourceKey, errorState)));
      onError(videoError);
    }
  }, [loadStates, maxRetries, onSourceReady, onError]);

  const retrySource = (index: number) => {
    const source = sources[index];
    if (source) {
      loadSource(source, index);
    }
  };

  const tryNextSource = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (sources.length > 0 && currentSourceIndex < sources.length) {
      const source = sources[currentSourceIndex];
      const sourceKey = getSourceKey(source, currentSourceIndex);
      const state = loadStates.get(sourceKey);

      if (!state || state.status === 'idle') {
        loadSource(source, currentSourceIndex);
      }
    }
  }, [sources, currentSourceIndex, loadStates, loadSource]);

  const currentSource = sources[currentSourceIndex];
  const currentState = currentSource ? loadStates.get(getSourceKey(currentSource, currentSourceIndex)) : null;

  const getErrorMessage = (error: VideoError) => {
    switch (error.type) {
      case 'network':
        return 'Network error: Unable to load video from this source.';
      case 'format':
        return 'Format error: Video format is not supported.';
      case 'cors':
        return 'CORS error: Video cannot be loaded due to cross-origin restrictions.';
      case 'timeout':
        return 'Timeout error: Video loading took too long.';
      case 'invalid_source':
        return 'Invalid source: Video URL or iframe code is malformed.';
      default:
        return 'Unknown error: An unexpected error occurred while loading the video.';
    }
  };

  if (!currentSource) {
    return (
      <div className={cn('w-full aspect-video bg-black flex items-center justify-center text-white', className)}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">No video sources available</p>
          <p className="text-sm text-gray-400">This video cannot be played.</p>
        </div>
      </div>
    );
  }

  if (currentState?.status === 'loading') {
    return (
      <div className={cn('w-full aspect-video bg-black flex items-center justify-center text-white', className)}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-lg font-semibold">Loading video...</p>
          <p className="text-sm text-gray-400">
            Testing source {currentSourceIndex + 1} of {sources.length}
          </p>
        </div>
      </div>
    );
  }

  if (currentState?.status === 'error') {
    return (
      <div className={cn('w-full aspect-video bg-black flex items-center justify-center text-white', className)}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold mb-2">Video Load Error</p>
          <p className="text-sm text-gray-400 mb-4">
            {getErrorMessage(currentState.error!)}
          </p>
          <div className="flex gap-2 justify-center">
            {currentState.retryCount < maxRetries && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => retrySource(currentSourceIndex)}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry ({currentState.retryCount}/{maxRetries})
              </Button>
            )}
            {currentSourceIndex < sources.length - 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={tryNextSource}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Next Source
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentState?.status === 'ready') {
    return <>{children}</>;
  }

  return (
    <div className={cn('w-full aspect-video bg-black flex items-center justify-center text-white', className)}>
      <div className="text-center">
        <Play className="h-12 w-12 mx-auto mb-4 text-gray-500" />
        <p className="text-lg font-semibold">Preparing video...</p>
      </div>
    </div>
  );
}