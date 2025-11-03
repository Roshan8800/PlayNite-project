/**
 * Bundle loading optimization utilities
 * Dynamic imports, preload/prefetch strategies, and critical CSS inlining
 */

import { smartCache } from './cache';

// Dynamic import utilities with caching
export class DynamicImporter {
  private static cache = new Map<string, Promise<any>>();

  static async load<T = any>(
    importFn: () => Promise<T>,
    cacheKey?: string,
    options?: {
      preload?: boolean;
      prefetch?: boolean;
      timeout?: number;
    }
  ): Promise<T> {
    const key = cacheKey || importFn.toString();

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const loadPromise = this.loadWithTimeout(importFn, options?.timeout || 10000);
    this.cache.set(key, loadPromise);

    // Preload/prefetch if requested
    if (options?.preload) {
      this.preload(importFn);
    }
    if (options?.prefetch) {
      this.prefetch(importFn);
    }

    return loadPromise;
  }

  private static async loadWithTimeout<T>(
    importFn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      importFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout')), timeout)
      ),
    ]);
  }

  static preload<T>(importFn: () => Promise<T>): void {
    // Preload the module without awaiting
    importFn().catch(console.warn);
  }

  static prefetch<T>(importFn: () => Promise<T>): void {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedule = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 1);

    schedule(() => {
      importFn().catch(console.warn);
    });
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Preload/Prefetch strategies
export const preloadStrategies = {
  // Preload critical components
  criticalComponents: () => {
    const criticalComponents: Array<() => Promise<any>> = [
      () => import('../components/video-player'),
      () => import('../components/video-card'),
      () => import('../components/search-popover'),
    ];

    criticalComponents.forEach(DynamicImporter.preload);
  },

  // Prefetch likely next routes
  routePrefetch: (currentPath: string) => {
    const routeMap: Record<string, string[]> = {
      '/': ['/search', '/categories', '/trending'],
      '/search': ['/search/advanced', '/categories'],
      '/video/[id]': ['/watch/[id]'],
      '/watch/[id]': ['/video/[id]/comments'],
    };

    const likelyRoutes = routeMap[currentPath] || [];
    likelyRoutes.forEach(route => {
      // Prefetch route components
      DynamicImporter.prefetch(() => import(`../app/(home)${route}/page`));
    });
  },

  // Preload based on user behavior patterns
  behavioralPreload: (userActions: string[]) => {
    const preloadMap: Record<string, (() => Promise<any>)[]> = {
      'search': [
        () => import('../components/video-filters'),
        () => import('../hooks/use-video-filters'),
      ],
      'video_watch': [
        () => import('../components/video-player'),
        () => import('../components/video-analytics'),
      ],
      'category_browse': [
        () => import('../components/category-card'),
      ],
    };

    userActions.forEach(action => {
      const components = preloadMap[action];
      if (components) {
        components.forEach(DynamicImporter.preload);
      }
    });
  },
};

// Critical CSS inlining utilities
export class CriticalCSS {
  private static criticalStyles = new Set<string>();

  static addCriticalStyle(css: string): void {
    this.criticalStyles.add(css);
  }

  static getCriticalStyles(): string {
    return Array.from(this.criticalStyles).join('\n');
  }

  static inlineCriticalCSS(html: string): string {
    const criticalCSS = this.getCriticalStyles();
    if (!criticalCSS) return html;

    // Insert critical CSS in head
    const styleTag = `<style>${criticalCSS}</style>`;
    return html.replace('<head>', `<head>${styleTag}`);
  }

  static extractCriticalCSS(component: React.ComponentType): Promise<string> {
    // This would require a CSS extraction library in a real implementation
    // For now, return a placeholder
    return Promise.resolve(`
      .skeleton { background: #f0f0f0; animation: pulse 1.5s infinite; }
      .video-card { transition: transform 0.2s; }
      .video-player { width: 100%; height: auto; }
    `);
  }
}

// Bundle splitting utilities
export const bundleSplitters = {
  // Split by route
  byRoute: {
    home: () => import('../app/page'),
    search: () => import('../app/(home)/search/page'),
    video: () => import('../app/(home)/video/[id]/page'),
    watch: () => import('../app/(home)/watch/[id]/page'),
  },

  // Split by feature
  byFeature: {
    videoPlayer: () => import('../components/video-player'),
    analytics: () => import('../components/video-analytics'),
    filters: () => import('../components/video-filters'),
    liveStream: () => import('../components/live-stream-player'),
  },

  // Split by library
  byLibrary: {
    firebase: () => import('firebase/app'),
    radix: () => import('@radix-ui/react-dialog'),
    lucide: () => import('lucide-react'),
  },
};

// Lazy loading with intersection observer
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private elements = new Map<Element, () => void>();

  constructor(rootMargin = '50px') {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const callback = this.elements.get(entry.target);
              if (callback) {
                callback();
                this.elements.delete(entry.target);
                this.observer?.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin }
      );
    }
  }

  observe(element: Element, callback: () => void): void {
    if (this.observer) {
      this.elements.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      callback();
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.elements.clear();
  }
}

// Progressive loading utilities
export const progressiveLoader = {
  // Load images progressively
  loadImage: (src: string, placeholder?: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (placeholder) {
        img.src = placeholder;
        img.onload = () => {
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        };
      } else {
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      }
    });
  },

  // Load scripts progressively
  loadScript: (src: string, async = true): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Load styles progressively
  loadStyle: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  },
};

// Resource hints utilities
export const resourceHints = {
  // Add preload hints
  preload: (href: string, as: string, type?: string): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Add prefetch hints
  prefetch: (href: string): void => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Add preconnect hints
  preconnect: (href: string): void => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  },

  // Add dns-prefetch hints
  dnsPrefetch: (href: string): void => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
};

// Bundle size monitoring
export class BundleMonitor {
  private static sizes = new Map<string, number>();

  static recordBundleSize(name: string, size: number): void {
    this.sizes.set(name, size);
  }

  static getBundleSize(name: string): number | undefined {
    return this.sizes.get(name);
  }

  static getTotalSize(): number {
    return Array.from(this.sizes.values()).reduce((total, size) => total + size, 0);
  }

  static getSizeReport(): Record<string, number> {
    return Object.fromEntries(this.sizes);
  }
}

// Initialize critical optimizations on app start
export function initializeOptimizations(): void {
  if (typeof window === 'undefined') return;

  // Preload critical components
  preloadStrategies.criticalComponents();

  // Add resource hints for external resources
  resourceHints.preconnect('https://fonts.googleapis.com');
  resourceHints.preconnect('https://fonts.gstatic.com');
  resourceHints.dnsPrefetch('https://www.google-analytics.com');

  // Initialize lazy loader
  const lazyLoader = new LazyLoader();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    lazyLoader.disconnect();
    DynamicImporter.clearCache();
  });
}