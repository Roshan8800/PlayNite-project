/**
 * Super fast page loading techniques
 * Instant loading, skeleton screens, progressive loading
 */

import React from 'react';
import { DynamicImporter, LazyLoader, progressiveLoader } from './bundle-optimization';
import { smartCache } from './cache';

// Skeleton screen components
export const SkeletonComponents = {
  VideoCard: () => (
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 rounded-lg h-48 w-full mb-4'
    }, [
      React.createElement('div', {
        className: 'h-32 bg-gray-300 rounded-t-lg'
      }),
      React.createElement('div', { className: 'p-4' }, [
        React.createElement('div', {
          className: 'h-4 bg-gray-300 rounded w-3/4 mb-2'
        }),
        React.createElement('div', {
          className: 'h-3 bg-gray-300 rounded w-1/2'
        })
      ])
    ])
  ),

  VideoGrid: ({ count = 12 }: { count?: number }) => (
    React.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    },
      Array.from({ length: count }, (_, i) =>
        React.createElement(SkeletonComponents.VideoCard, { key: i })
      )
    )
  ),

  VideoPlayer: () => (
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 rounded-lg h-96 w-full'
    },
      React.createElement('div', {
        className: 'h-full bg-gray-300 rounded-lg flex items-center justify-center'
      },
        React.createElement('div', { className: 'text-gray-500' }, 'Loading video...')
      )
    )
  ),

  SearchResults: () => (
    React.createElement('div', { className: 'space-y-4' },
      Array.from({ length: 8 }, (_, i) =>
        React.createElement('div', {
          key: i,
          className: 'animate-pulse flex items-center space-x-4'
        }, [
          React.createElement('div', {
            className: 'h-12 w-12 bg-gray-300 rounded-full'
          }),
          React.createElement('div', { className: 'flex-1 space-y-2' }, [
            React.createElement('div', {
              className: 'h-4 bg-gray-300 rounded w-3/4'
            }),
            React.createElement('div', {
              className: 'h-3 bg-gray-300 rounded w-1/2'
            })
          ])
        ])
      )
    )
  ),

  CategoryList: () => (
    React.createElement('div', {
      className: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
    },
      Array.from({ length: 12 }, (_, i) =>
        React.createElement('div', { key: i, className: 'animate-pulse' }, [
          React.createElement('div', {
            className: 'h-20 bg-gray-300 rounded-lg mb-2'
          }),
          React.createElement('div', {
            className: 'h-3 bg-gray-300 rounded w-2/3 mx-auto'
          })
        ])
      )
    )
  ),
};

// Progressive loading hook
export function useProgressiveLoading<T>(
  loadFn: () => Promise<T>,
  options?: {
    skeleton?: React.ComponentType;
    cacheKey?: string;
    priority?: 'low' | 'high';
  }
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Try cache first
        if (options?.cacheKey) {
          smartCache.get<T>(options.cacheKey).then(cached => {
            if (cached) {
              setData(cached);
              setLoading(false);
              return;
            }
          });
        }

        // Load data
        const result = await loadFn();
        setData(result);

        // Cache result
        if (options?.cacheKey) {
          smartCache.set(options.cacheKey, result);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (options?.priority === 'high') {
      load();
    } else {
      // Use requestIdleCallback for low priority
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(load);
      } else {
        setTimeout(load, 1);
      }
    }
  }, [loadFn, options?.cacheKey, options?.priority]);

  return { data, loading, error };
}

// Instant loading utilities
export class InstantLoader {
  private static preloadQueue: Array<() => Promise<void>> = [];
  private static isProcessing = false;

  static async preloadResource(url: string, as: 'image' | 'script' | 'style' | 'font' = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = as;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  static async instantLoad<T>(
    loader: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    // Try to load instantly with timeout
    const timeoutPromise = new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback as T), 100);
    });

    try {
      return await Promise.race([loader(), timeoutPromise]);
    } catch {
      return fallback as T;
    }
  }

  static queuePreload(loader: () => Promise<void>): void {
    this.preloadQueue.push(loader);
    this.processQueue();
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const loader = this.preloadQueue.shift();
      if (loader) {
        try {
          await loader();
        } catch (error) {
          console.warn('Preload failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }
}

// Lazy loading hook with intersection observer
export function useLazyLoading<T extends HTMLElement>(
  loadFn: () => Promise<any>,
  options?: {
    rootMargin?: string;
    threshold?: number;
    fallback?: React.ComponentType;
  }
) {
  const [loaded, setLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loaded && !loading) {
          try {
            setLoading(true);
            await loadFn();
            setLoaded(true);
          } catch (err) {
            setError(err as Error);
          } finally {
            setLoading(false);
          }
          observer.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin || '50px',
        threshold: options?.threshold || 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [loadFn, loaded, loading, options?.rootMargin, options?.threshold]);

  const FallbackComponent = options?.fallback;

  return {
    ref,
    loaded,
    loading,
    error,
    LazyComponent: loaded ? null : FallbackComponent ? React.createElement(FallbackComponent) : null,
  };
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement | null = null;
  private items: any[] = [];
  private itemHeight: number = 100;
  private containerHeight: number = 400;
  private scrollTop: number = 0;
  private visibleItems: any[] = [];

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number = 100,
    containerHeight: number = 400
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.setupScrollListener();
    this.updateVisibleItems();
  }

  private setupScrollListener(): void {
    if (!this.container) return;

    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container!.scrollTop;
      this.updateVisibleItems();
    });
  }

  private updateVisibleItems(): void {
    if (!this.container) return;

    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.items.length
    );

    this.visibleItems = this.items.slice(startIndex, endIndex);
  }

  getVisibleItems(): any[] {
    return this.visibleItems;
  }

  getOffset(): number {
    return Math.floor(this.scrollTop / this.itemHeight) * this.itemHeight;
  }

  updateItems(items: any[]): void {
    this.items = items;
    this.updateVisibleItems();
  }
}

// Progressive enhancement utilities
export const progressiveEnhancement = {
  // Load non-critical JavaScript
  loadNonCriticalJS: (src: string) => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        progressiveLoader.loadScript(src, true);
      }, 100);
    });
  },

  // Load non-critical CSS
  loadNonCriticalCSS: (href: string) => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        progressiveLoader.loadStyle(href);
      }, 100);
    });
  },

  // Enhance with JavaScript features
  enhanceWithJS: (featureLoader: () => Promise<void>) => {
    if (typeof window === 'undefined') return;

    // Load after initial render
    requestAnimationFrame(() => {
      featureLoader().catch(console.warn);
    });
  },
};

// Fast navigation utilities
export const fastNavigation = {
  // Prefetch on hover
  prefetchOnHover: (selector: string, prefetchFn: () => Promise<void>) => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;

    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches(selector) || target.closest(selector)) {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          prefetchFn().catch(console.warn);
        }, 100);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches(selector) || target.closest(selector)) {
        clearTimeout(timeoutId);
      }
    });
  },

  // Instant page transitions
  instantTransition: (to: string, transitionFn: () => Promise<void>) => {
    // Use the View Transitions API if available
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        transitionFn();
      });
    } else {
      transitionFn();
    }
  },
};

// Performance-first rendering
export function usePerformanceFirstRender() {
  const [isFast, setIsFast] = React.useState(true);

  React.useEffect(() => {
    // Detect if device can handle heavy rendering
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData
    );

    const isLowEndDevice = !window.requestIdleCallback ||
                          navigator.hardwareConcurrency <= 2;

    setIsFast(!isSlowConnection && !isLowEndDevice);
  }, []);

  return isFast;
}

// Critical resource prioritization
export class CriticalResourceLoader {
  private static loaded = new Set<string>();

  static async loadCriticalResource(url: string, as: string = 'script'): Promise<void> {
    if (this.loaded.has(url)) return;

    return new Promise((resolve, reject) => {
      let element: HTMLElement;

      if (as === 'script') {
        element = document.createElement('script');
        (element as HTMLScriptElement).src = url;
        (element as HTMLScriptElement).async = false; // Critical, so load synchronously
      } else if (as === 'style') {
        element = document.createElement('link');
        (element as HTMLLinkElement).rel = 'stylesheet';
        (element as HTMLLinkElement).href = url;
      } else {
        throw new Error(`Unsupported resource type: ${as}`);
      }

      element.onload = () => {
        this.loaded.add(url);
        resolve();
      };
      element.onerror = reject;

      document.head.appendChild(element);
    });
  }

  static preloadCriticalResource(url: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as as any;
    document.head.appendChild(link);
  }
}