// Graceful degradation patterns for handling feature failures

import { ApplicationError, ErrorType, ErrorSeverity } from './errors';

export interface FeatureCapability {
  name: string;
  required: boolean;
  fallback?: React.ComponentType | (() => JSX.Element) | string;
  dependencies?: string[];
}

export interface DegradationState {
  degradedFeatures: Set<string>;
  availableFeatures: Set<string>;
  criticalFailures: Set<string>;
  lastDegradationTime: Date | null;
}

export class FeatureManager {
  private capabilities = new Map<string, FeatureCapability>();
  private degradationState: DegradationState = {
    degradedFeatures: new Set(),
    availableFeatures: new Set(),
    criticalFailures: new Set(),
    lastDegradationTime: null
  };

  registerFeature(capability: FeatureCapability) {
    this.capabilities.set(capability.name, capability);
    this.degradationState.availableFeatures.add(capability.name);
  }

  async checkFeatureAvailability(featureName: string): Promise<boolean> {
    const capability = this.capabilities.get(featureName);
    if (!capability) return false;

    // Check dependencies
    if (capability.dependencies) {
      for (const dep of capability.dependencies) {
        if (this.degradationState.degradedFeatures.has(dep)) {
          return false;
        }
      }
    }

    // Perform feature-specific checks
    try {
      switch (featureName) {
        case 'video-playback':
          return await this.checkVideoPlaybackSupport();
        case 'picture-in-picture':
          return 'pictureInPictureEnabled' in document;
        case 'fullscreen':
          return !!(document.documentElement.requestFullscreen ||
                   (document.documentElement as any).webkitRequestFullscreen);
        case 'webgl':
          return this.checkWebGLSupport();
        case 'indexeddb':
          return this.checkIndexedDBSupport();
        case 'service-worker':
          return 'serviceWorker' in navigator;
        case 'notifications':
          return 'Notification' in window && Notification.permission !== 'denied';
        case 'geolocation':
          return 'geolocation' in navigator;
        case 'web-share':
          return 'share' in navigator;
        case 'web-bluetooth':
          return 'bluetooth' in navigator;
        default:
          return true;
      }
    } catch (error) {
      console.warn(`Feature check failed for ${featureName}:`, error);
      return false;
    }
  }

  private async checkVideoPlaybackSupport(): Promise<boolean> {
    try {
      const video = document.createElement('video');
      return !!(video.canPlayType && (
        video.canPlayType('video/mp4; codecs="avc1.42E01E"') ||
        video.canPlayType('video/webm; codecs="vp8, vorbis"') ||
        video.canPlayType('video/ogg; codecs="theora"')
      ));
    } catch {
      return false;
    }
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
               canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private checkIndexedDBSupport(): boolean {
    try {
      return !!(window.indexedDB || (window as any).mozIndexedDB ||
               (window as any).webkitIndexedDB || (window as any).msIndexedDB);
    } catch {
      return false;
    }
  }

  async degradeFeature(featureName: string, error?: ApplicationError) {
    const capability = this.capabilities.get(featureName);
    if (!capability) return;

    this.degradationState.degradedFeatures.add(featureName);
    this.degradationState.availableFeatures.delete(featureName);
    this.degradationState.lastDegradationTime = new Date();

    if (capability.required) {
      this.degradationState.criticalFailures.add(featureName);
    }

    // Log degradation
    console.warn(`Feature degraded: ${featureName}`, {
      error: error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Trigger fallback UI updates
    this.notifyFeatureDegradation(featureName, capability);
  }

  private notifyFeatureDegradation(featureName: string, capability: FeatureCapability) {
    // Dispatch custom event for UI updates
    const event = new CustomEvent('featureDegraded', {
      detail: {
        feature: featureName,
        capability,
        fallback: capability.fallback
      }
    });
    window.dispatchEvent(event);
  }

  getDegradationState(): DegradationState {
    return { ...this.degradationState };
  }

  isFeatureAvailable(featureName: string): boolean {
    return this.degradationState.availableFeatures.has(featureName);
  }

  isFeatureDegraded(featureName: string): boolean {
    return this.degradationState.degradedFeatures.has(featureName);
  }

  hasCriticalFailures(): boolean {
    return this.degradationState.criticalFailures.size > 0;
  }

  getAvailableFeatures(): string[] {
    return Array.from(this.degradationState.availableFeatures);
  }

  getDegradedFeatures(): string[] {
    return Array.from(this.degradationState.degradedFeatures);
  }

  reset() {
    this.degradationState = {
      degradedFeatures: new Set(),
      availableFeatures: new Set(this.capabilities.keys()),
      criticalFailures: new Set(),
      lastDegradationTime: null
    };
  }
}

// Global feature manager instance
export const featureManager = new FeatureManager();

// Initialize common features
featureManager.registerFeature({
  name: 'video-playback',
  required: true,
  fallback: 'Video playback is not supported in this browser.'
});

featureManager.registerFeature({
  name: 'picture-in-picture',
  required: false,
  dependencies: ['video-playback']
});

featureManager.registerFeature({
  name: 'fullscreen',
  required: false
});

featureManager.registerFeature({
  name: 'webgl',
  required: false
});

featureManager.registerFeature({
  name: 'indexeddb',
  required: false
});

featureManager.registerFeature({
  name: 'service-worker',
  required: false
});

featureManager.registerFeature({
  name: 'notifications',
  required: false
});

featureManager.registerFeature({
  name: 'geolocation',
  required: false
});

featureManager.registerFeature({
  name: 'web-share',
  required: false
});

featureManager.registerFeature({
  name: 'web-bluetooth',
  required: false
});

// React hook for graceful degradation
import React, { useState, useEffect } from 'react';

export function useFeature(featureName: string) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFeature = async () => {
      setIsLoading(true);
      const available = await featureManager.checkFeatureAvailability(featureName);
      setIsAvailable(available);
      setIsLoading(false);
    };

    checkFeature();

    const handleDegradation = (event: CustomEvent) => {
      if (event.detail.feature === featureName) {
        setIsAvailable(false);
      }
    };

    window.addEventListener('featureDegraded', handleDegradation as EventListener);

    return () => {
      window.removeEventListener('featureDegraded', handleDegradation as EventListener);
    };
  }, [featureName]);

  return { isAvailable, isLoading };
}

// Higher-order component for graceful degradation
export function withGracefulDegradation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string,
  FallbackComponent?: React.ComponentType<{ feature: string }>
) {
  return function GracefulDegradationWrapper(props: P) {
    const { isAvailable, isLoading } = useFeature(featureName);

    if (isLoading) {
      return React.createElement('div', null, 'Loading...'); // Or a proper loading component
    }

    if (!isAvailable) {
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, { feature: featureName });
      }

      const capability = featureManager['capabilities'].get(featureName);
      if (capability?.fallback) {
        if (typeof capability.fallback === 'string') {
          return React.createElement('div', {
            className: 'p-4 text-center text-muted-foreground'
          }, capability.fallback);
        }
        if (typeof capability.fallback === 'function') {
          const Fallback = capability.fallback;
          return React.createElement(Fallback);
        }
      }

      return React.createElement('div', {
        className: 'p-4 text-center text-muted-foreground'
      }, React.createElement('p', null, 'This feature is not available in your browser.'));
    }

    return React.createElement(WrappedComponent, props);
  };
}

// Utility function to handle API failures gracefully
export async function withApiFallback<T>(
  primaryApiCall: () => Promise<T>,
  fallbackApiCall?: () => Promise<T>,
  featureName?: string
): Promise<T> {
  try {
    return await primaryApiCall();
  } catch (error) {
    const appError = error instanceof ApplicationError ? error :
      new ApplicationError(ErrorType.NETWORK, 'API call failed', { details: error });

    // Degrade feature if specified
    if (featureName) {
      await featureManager.degradeFeature(featureName, appError);
    }

    // Try fallback if available
    if (fallbackApiCall) {
      try {
        console.warn('Using fallback API call due to primary failure');
        return await fallbackApiCall();
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw appError; // Throw original error
      }
    }

    throw appError;
  }
}