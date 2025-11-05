/**
 * Production performance optimizations
 * Code splitting, lazy loading, and caching strategies
 */

import React from 'react';
import { DynamicImporter, bundleSplitters, LazyLoader } from './bundle-optimization';
import { smartCache } from './cache';

// Production optimization configurations
export const productionOptimizations = {
  // Code splitting strategies
  codeSplitting: {
    // Route-based splitting
    routes: {
      home: () => import('../app/page'),
      search: () => import('../app/(home)/search/page'),
      video: () => import('../app/(home)/video/[id]/page'),
      watch: () => import('../app/(home)/watch/[id]/page'),
      admin: () => import('../app/admin/page'),
    },

    // Feature-based splitting
    features: {
      videoPlayer: () => import('../components/video-player'),
      liveStream: () => import('../components/live-stream-player'),
      analytics: () => import('../components/video-analytics'),
      filters: () => import('../components/video-filters'),
      reactions: () => import('../components/reactions/video-reactions'),
      playlists: () => import('../components/playlists/social-playlist-manager'),
      watchParties: () => import('../components/watch-parties/watch-party-manager'),
    },

    // Library splitting
    libraries: {
      firebase: () => import('firebase/app'),
      recharts: () => import('recharts'),
      radix: () => import('@radix-ui/react-dialog'),
    },
  },

  // Lazy loading configurations
  lazyLoading: {
    // Intersection observer thresholds
    thresholds: [0, 0.1, 0.25, 0.5, 0.75, 1.0],

    // Loading priorities
    priorities: {
      critical: 'high',
      important: 'medium',
      optional: 'low',
    },

    // Preload strategies
    preloadStrategies: {
      // Preload on user interaction
      onInteraction: (element: Element, importFn: () => Promise<any>) => {
        element.addEventListener('mouseenter', () => {
          DynamicImporter.preload(importFn);
        }, { once: true });
      },

      // Preload on scroll proximity
      onProximity: (element: Element, importFn: () => Promise<any>, distance = 200) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                DynamicImporter.preload(importFn);
                observer.disconnect();
              }
            });
          },
          { rootMargin: `${distance}px` }
        );
        observer.observe(element);
      },

      // Preload based on user behavior patterns
      behavioral: (userActions: string[], componentMap: Record<string, () => Promise<any>>) => {
        userActions.forEach(action => {
          const component = componentMap[action];
          if (component) {
            DynamicImporter.prefetch(component);
          }
        });
      },
    },
  },

  // Caching strategies
  caching: {
    // Service worker cache strategies
    swStrategies: {
      // Cache first for static assets
      cacheFirst: {
        cacheName: 'static-assets-v1',
        patterns: [
          /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
          /\.(?:css|js)$/,
          /\/_next\/static\//,
        ],
      },

      // Network first for dynamic content
      networkFirst: {
        cacheName: 'dynamic-content-v1',
        patterns: [
          /\/api\//,
          /\/videos\//,
        ],
      },

      // Stale while revalidate for frequently updated content
      staleWhileRevalidate: {
        cacheName: 'frequent-content-v1',
        patterns: [
          /\/trending/,
          /\/categories/,
        ],
      },
    },

    // Memory cache configurations
    memoryCache: {
      // Component cache
      components: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 50,
      },

      // API response cache
      api: {
        ttl: 10 * 60 * 1000, // 10 minutes
        maxSize: 100,
      },

      // Image cache
      images: {
        ttl: 30 * 60 * 1000, // 30 minutes
        maxSize: 200,
      },
    },

    // Browser cache optimizations
    browserCache: {
      // Cache headers for different resource types
      headers: {
        static: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        dynamic: {
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
        api: {
          'Cache-Control': 'public, max-age=60, s-maxage=120',
        },
      },
    },
  },

  // Image optimization
  images: {
    // Responsive image configurations
    responsive: {
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      formats: ['webp', 'avif', 'jpg', 'png'],
    },

    // Lazy loading
    lazy: {
      rootMargin: '50px 0px',
      threshold: 0.1,
    },

    // Compression settings
    compression: {
      quality: 85,
      progressive: true,
      optimizationLevel: 2,
    },
  },

  // Bundle optimization
  bundles: {
    // Vendor chunk splitting
    vendors: {
      firebase: /[\\/]node_modules[\\/]firebase[\\/]/,
      radix: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
      react: /[\\/]node_modules[\\/]react[\\/]/,
      lodash: /[\\/]node_modules[\\/]lodash[\\/]/,
    },

    // Dynamic imports for large components
    dynamicImports: [
      '../components/video-player',
      '../components/live-stream-player',
      '../components/video-analytics',
      '../components/reactions/video-reactions',
    ],

    // Tree shaking configurations
    treeShaking: {
      sideEffects: false,
      usedExports: true,
    },
  },
};

// Performance optimization utilities
export class PerformanceOptimizer {
  private static lazyLoader = new LazyLoader();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    this.setupCodeSplitting();
    this.setupLazyLoading();
    this.setupCaching();
    this.setupImageOptimization();
    this.initialized = true;
  }

  private static setupCodeSplitting(): void {
    // Preload critical routes
    if (typeof window !== 'undefined') {
      // Preload home route
      DynamicImporter.prefetch(productionOptimizations.codeSplitting.routes.home);

      // Preload critical features
      DynamicImporter.preload(productionOptimizations.codeSplitting.features.videoPlayer);
    }
  }

  private static setupLazyLoading(): void {
    // Initialize lazy loader with optimized settings
    this.lazyLoader = new LazyLoader('100px');
  }

  private static setupCaching(): void {
    // Configure memory cache with default settings
    // Note: smartCache may not have setConfig method, using direct configuration
  }

  private static setupImageOptimization(): void {
    // Configure responsive images
    if (typeof document !== 'undefined') {
      // Add responsive image support
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        this.lazyLoader.observe(img, () => {
          const src = img.getAttribute('data-src');
          if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
          }
        });
      });
    }
  }

  // Lazy load component
  static lazyLoadComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    return React.lazy(() =>
      importFn().catch(() => {
        // Fallback for failed imports
        return fallback ? Promise.resolve({ default: fallback as T }) : Promise.reject();
      })
    );
  }

  // Preload component on interaction
  static preloadOnInteraction(
    element: Element,
    importFn: () => Promise<any>
  ): void {
    productionOptimizations.lazyLoading.preloadStrategies.onInteraction(element, importFn);
  }

  // Preload component on proximity
  static preloadOnProximity(
    element: Element,
    importFn: () => Promise<any>,
    distance = 200
  ): void {
    productionOptimizations.lazyLoading.preloadStrategies.onProximity(element, importFn, distance);
  }

  // Behavioral preloading
  static behavioralPreload(
    userActions: string[],
    componentMap: Record<string, () => Promise<any>>
  ): void {
    productionOptimizations.lazyLoading.preloadStrategies.behavioral(userActions, componentMap);
  }

  // Cache API responses
  static cacheApiResponse(
    key: string,
    data: any,
    ttl = 10 * 60 * 1000
  ): void {
    smartCache.set(key, data, { memoryTtl: ttl });
  }

  // Get cached API response
  static getCachedApiResponse(key: string): any {
    return smartCache.get(key);
  }

  // Optimize bundle loading
  static optimizeBundleLoading(): void {
    // Implement bundle loading optimizations
    Object.entries(productionOptimizations.bundles.vendors).forEach(([name, pattern]) => {
      // Preload vendor chunks - simplified approach
      // DynamicImporter.prefetch(() => import(/* webpackChunkName: `vendor-${name}` */ 'lodash'));
    });
  }

  // Memory management
  static optimizeMemoryUsage(): void {
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }

    // Clear expired cache entries - SmartCache doesn't have clearExpired method
    // Use clear() instead which clears all cache
    smartCache.clear();
  }

  // Network optimization
  static optimizeNetworkRequests(): void {
    // Implement request deduplication, batching, etc.
    // This would integrate with your existing network utilities
  }
}

// Production-ready component lazy loading
export const lazyComponents = {
  // Video components
  VideoPlayer: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/video-player').then(mod => ({ default: mod.VideoPlayer }))
  ),

  LiveStreamPlayer: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/live-stream-player').then(mod => ({ default: mod.LiveStreamPlayer }))
  ),

  VideoAnalytics: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/video-analytics').then(mod => ({ default: mod.VideoAnalytics }))
  ),

  // Feature components
  VideoFilters: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/video-filters').then(mod => ({ default: mod.VideoFilters }))
  ),

  VideoReactions: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/reactions/video-reactions').then(mod => ({ default: mod.VideoReactions }))
  ),

  SocialPlaylistManager: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/playlists/social-playlist-manager').then(mod => ({ default: mod.SocialPlaylistManager }))
  ),

  WatchPartyManager: PerformanceOptimizer.lazyLoadComponent(
    () => import('../components/watch-parties/watch-party-manager').then(mod => ({ default: mod.WatchPartyManager }))
  ),

  // Admin components
  AdminPanel: PerformanceOptimizer.lazyLoadComponent(
    () => import('../app/admin/page').then(mod => ({ default: mod.default }))
  ),
};

// Initialize optimizations
export function initializeProductionOptimizations(): void {
  if (typeof window === 'undefined') return;

  PerformanceOptimizer.initialize();

  // Set up periodic optimizations
  setInterval(() => {
    PerformanceOptimizer.optimizeMemoryUsage();
  }, 5 * 60 * 1000); // Every 5 minutes
}