# 6. Performance Optimization Features

## Core Web Vitals Optimization

### Largest Contentful Paint (LCP)

#### Image Optimization
```typescript
// src/components/optimized-image.js
import Image from 'next/image';
import { useState } from 'react';

export const OptimizedImage = ({ 
  src, 
  alt, 
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          priority={priority}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
};
```

#### Critical Resource Loading
```typescript
// src/lib/critical-resource-loader.ts
export class CriticalResourceLoader {
  static async loadCriticalResource(url: string, as: string = 'script'): Promise<void> {
    return new Promise((resolve, reject) => {
      let element: HTMLScriptElement | HTMLLinkElement;
      
      if (as === 'script') {
        element = document.createElement('script');
        element.src = url;
        element.async = false; // Load synchronously for critical resources
      } else {
        element = document.createElement('link');
        element.rel = 'stylesheet';
        element.href = url;
      }
      
      element.onload = () => resolve();
      element.onerror = () => reject(new Error(`Failed to load ${url}`));
      
      document.head.appendChild(element);
    });
  }
}
```

### First Input Delay (FID) & Interaction to Next Paint (INP)

#### Non-blocking Script Loading
```typescript
// src/lib/performance-optimization.ts
export function optimizeInteractionLatency(): void {
  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.src = script.getAttribute('src')!;
    newScript.defer = true;
    script.parentNode?.replaceChild(newScript, script);
  });
  
  // Use requestIdleCallback for non-urgent tasks
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Perform background tasks
      initializeAnalytics();
      warmUpCache();
    });
  }
}
```

#### Event Handler Optimization
```typescript
// src/hooks/use-debounced-callback.ts
import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}
```

### Cumulative Layout Shift (CLS)

#### Layout Stability
```typescript
// src/components/layout-stable-container.tsx
import { useEffect, useRef } from 'react';

export const LayoutStableContainer = ({ 
  children, 
  minHeight = '200px',
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Reserve space to prevent layout shift
    container.style.minHeight = minHeight;
    
    // Monitor layout shifts
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).value > 0.1) {
          console.warn('Layout shift detected:', entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    return () => observer.disconnect();
  }, [minHeight]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
```

## Bundle Optimization

### Code Splitting Strategies

#### Route-based Splitting
```typescript
// src/app/(home)/video/[id]/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <VideoSkeleton />,
  ssr: false // Disable SSR for client-only components
});

const CommentsSection = dynamic(() => import('@/components/comments-section'), {
  loading: () => <Skeleton className="h-96" />
});

export default function VideoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <VideoPlayer videoId={params.id} />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <CommentsSection videoId={params.id} />
      </Suspense>
    </div>
  );
}
```

#### Component-based Splitting
```typescript
// src/lib/dynamic-components.js
import dynamic from 'next/dynamic';

export const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => import('@/components/video-skeleton'),
  ssr: false
});

export const LiveStreamPlayer = dynamic(() => import('@/components/live-stream-player'), {
  loading: () => import('@/components/video-skeleton'),
  ssr: false
});

export const AnalyticsDashboard = dynamic(() => import('@/components/analytics-dashboard'), {
  loading: () => import('@/components/loading-overlay'),
  ssr: false
});
```

### Bundle Analysis & Monitoring

#### Webpack Bundle Analyzer Integration
```typescript
// next.config.ts
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Analyze bundle in production
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './bundle-analyzer-report.html',
            openAnalyzer: false,
          })
        );
      }
    }
    return config;
  }
};
```

#### Bundle Size Monitoring
```typescript
// src/lib/bundle-monitor.ts
export class BundleMonitor {
  private static sizes: Record<string, number> = {};
  
  static recordBundleSize(name: string, size: number): void {
    this.sizes[name] = size;
    
    // Alert if bundle exceeds threshold
    if (size > 500 * 1024) { // 500KB
      console.warn(`Bundle ${name} is too large: ${(size / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  static getBundleReport(): Record<string, number> {
    return { ...this.sizes };
  }
}
```

## Caching Strategies

### Multi-layer Caching

#### Memory Cache
```typescript
// src/lib/cache.ts
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  
  set(key: string, value: any, ttlMs: number = 300000): void { // 5 minutes default
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }
  
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

#### Service Worker Caching
```typescript
// public/sw.js
const CACHE_NAME = 'playnite-v1';
const STATIC_CACHE = 'playnite-static-v1';
const DYNAMIC_CACHE = 'playnite-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - network first for dynamic content, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API calls - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets - cache first
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Default - network first with cache fallback
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}
```

### API Response Caching
```typescript
// src/lib/smart-cache.ts
export class SmartCache {
  async get<T>(
    key: string, 
    fetcher?: () => Promise<T>, 
    options: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
    } = {}
  ): Promise<T | null> {
    const { ttl = 300000, staleWhileRevalidate = false } = options;
    
    // Try memory cache first
    const memoryResult = memoryCache.get<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }
    
    // Try localStorage cache
    const localResult = localStorageCache.get<T>(key);
    if (localResult !== null) {
      // Background refresh if stale-while-revalidate
      if (staleWhileRevalidate && fetcher) {
        fetcher().then(result => {
          this.set(key, result, { ttl });
        }).catch(console.error);
      }
      return localResult;
    }
    
    // Fetch from network
    if (fetcher) {
      const result = await fetcher();
      this.set(key, result, { ttl });
      return result;
    }
    
    return null;
  }
  
  set(key: string, value: any, options: { ttl?: number } = {}): void {
    const { ttl = 300000 } = options;
    
    memoryCache.set(key, value, ttl);
    localStorageCache.set(key, value, ttl);
  }
}
```

## Image Optimization

### Responsive Images
```typescript
// src/lib/image-optimization.ts
export const generateResponsiveImages = (
  src: string, 
  sizes: number[]
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN || '';
  
  return sizes
    .map(size => `${baseUrl}${src}?w=${size} ${size}w`)
    .join(', ');
};

export const getOptimalImageSrc = (
  src: string, 
  width: number, 
  format: 'webp' | 'avif' | 'jpg' = 'webp'
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN || '';
  return `${baseUrl}${src}?w=${width}&f=${format}`;
};
```

### Lazy Loading
```typescript
// src/hooks/use-lazy-image.ts
import { useState, useRef, useEffect } from 'react';

export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);
  
  return { imageSrc, isLoading, hasError, imgRef };
}
```

## Network Optimization

### Resource Hints
```typescript
// src/lib/resource-hints.ts
export class ResourceHintsManager {
  static addPreconnect(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
  
  static addPrefetch(href: string, as: string = 'fetch'): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
  
  static addPreload(href: string, as: string, type?: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  }
  
  static initialize(): void {
    // Preconnect to critical third parties
    this.addPreconnect('https://fonts.googleapis.com');
    this.addPreconnect('https://fonts.gstatic.com');
    
    // Preload critical resources
    this.addPreload('/api/config', 'fetch');
    this.addPreload('/fonts/main.woff2', 'font', 'font/woff2');
  }
}
```

### Connection Optimization
```typescript
// src/lib/connection-optimization.ts
export class ConnectionOptimizer {
  static getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null {
    const connection = (navigator as any).connection;
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }
  
  static isSlowConnection(): boolean {
    const info = this.getConnectionInfo();
    if (!info) return false;
    
    return info.effectiveType === 'slow-2g' || 
           info.effectiveType === '2g' || 
           info.downlink < 1; // Less than 1 Mbps
  }
  
  static adaptToConnection(): void {
    if (this.isSlowConnection()) {
      // Reduce image quality
      document.documentElement.classList.add('low-bandwidth');
      
      // Disable non-essential features
      disableAutoPlay();
      reduceAnimationComplexity();
    }
  }
}
```

## Performance Monitoring

### Real-time Performance Tracking
```typescript
// src/lib/performance-monitoring.ts
export class PerformanceMonitor {
  private static metrics: CoreWebVitals = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  };
  
  static initialize(): void {
    this.setupCoreWebVitals();
    this.setupNavigationTiming();
    this.setupResourceTiming();
  }
  
  private static setupCoreWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.reportMetric('FID', this.metrics.fid);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  private static reportMetric(name: string, value: number): void {
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value}`);
    }
  }
}
```

### Performance Budget
```typescript
// src/lib/performance-budget.ts
export class PerformanceBudget {
  private static budgets = {
    'main-bundle': 200 * 1024, // 200KB
    'vendor-bundle': 300 * 1024, // 300KB
    'css-bundle': 50 * 1024, // 50KB
    'lcp': 2500, // 2.5s
    'fid': 100, // 100ms
    'cls': 0.1 // 0.1
  };
  
  static checkBudget(): { exceeded: string[]; withinBudget: string[] } {
    const exceeded: string[] = [];
    const withinBudget: string[] = [];
    
    // Check bundle sizes
    const bundles = BundleMonitor.getBundleReport();
    Object.entries(bundles).forEach(([name, size]) => {
      const budget = this.budgets[`${name}-bundle` as keyof typeof this.budgets];
      if (budget && size > budget) {
        exceeded.push(`${name}: ${(size / 1024).toFixed(1)}KB (budget: ${(budget / 1024).toFixed(1)}KB)`);
      } else {
        withinBudget.push(`${name}: ${(size / 1024).toFixed(1)}KB`);
      }
    });
    
    // Check Core Web Vitals
    const metrics = PerformanceMonitor.getMetrics();
    Object.entries(metrics).forEach(([metric, value]) => {
      const budget = this.budgets[metric as keyof typeof this.budgets];
      if (budget && value > budget) {
        exceeded.push(`${metric.toUpperCase()}: ${value} (budget: ${budget})`);
      } else {
        withinBudget.push(`${metric.toUpperCase()}: ${value}`);
      }
    });
    
    return { exceeded, withinBudget };
  }
}
```

## Memory Management

### Garbage Collection Optimization
```typescript
// src/lib/memory-optimization.ts
export class MemoryOptimizer {
  static forceGarbageCollection(): void {
    if ((window as any).gc) {
      (window as any).gc();
    }
  }
  
  static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedPercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
      
      if (usedPercent > 80) {
        console.warn(`High memory usage: ${usedPercent.toFixed(1)}%`);
        this.cleanupUnusedResources();
      }
    }
  }
  
  private static cleanupUnusedResources(): void {
    // Clear unused caches
    imageCache.clear();
    
    // Remove unused event listeners
    this.removeOrphanedEventListeners();
    
    // Force garbage collection if available
    this.forceGarbageCollection();
  }
  
  private static removeOrphanedEventListeners(): void {
    // Implementation to remove orphaned listeners
    const elements = document.querySelectorAll('[data-has-listeners]');
    elements.forEach(element => {
      // Remove listeners that are no longer needed
    });
  }
}
```

## Progressive Enhancement

### Feature Detection
```typescript
// src/lib/feature-detection.ts
export const featureSupport = {
  webgl: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
                canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  })(),
  
  indexeddb: (() => {
    return !!(window.indexedDB || (window as any).mozIndexedDB || 
              (window as any).webkitIndexedDB || (window as any).msIndexedDB);
  })(),
  
  serviceWorker: 'serviceWorker' in navigator,
  
  webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
  
  intersectionObserver: 'IntersectionObserver' in window,
  
  requestIdleCallback: 'requestIdleCallback' in window
};

export function getSupportedFeatures(): string[] {
  return Object.entries(featureSupport)
    .filter(([_, supported]) => supported)
    .map(([feature, _]) => feature);
}

export function degradeGracefully(): void {
  // Disable features that aren't supported
  if (!featureSupport.serviceWorker) {
    console.warn('Service Worker not supported, offline features disabled');
  }
  
  if (!featureSupport.indexeddb) {
    console.warn('IndexedDB not supported, local caching disabled');
  }
  
  if (!featureSupport.intersectionObserver) {
    // Fallback to scroll-based lazy loading
    console.warn('IntersectionObserver not supported, using scroll-based lazy loading');
  }
}
```

This comprehensive performance optimization system ensures the PlayNite platform delivers exceptional user experience across all devices and network conditions, while maintaining monitorable and maintainable code architecture.