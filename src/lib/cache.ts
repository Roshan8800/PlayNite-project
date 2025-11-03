/**
 * Advanced caching strategies for optimal performance
 * Includes memory caching, local storage optimization, and HTTP caching utilities
 */

import { getCookie, setCookie } from './cookies';

// Memory Cache Implementation
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, ttlMs: number = 300000): void { // 5 minutes default
    const expires = Date.now() + ttlMs;
    this.cache.set(key, { value, expires });
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    // Clean expired items
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Local Storage Cache with Compression
class LocalStorageCache {
  private prefix = 'app_cache_';
  private compressionEnabled = true;

  private compress(data: string): string {
    // Simple compression using base64 encoding for demo
    // In production, use a proper compression library like lz-string
    return btoa(encodeURIComponent(data));
  }

  private decompress(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }

  set(key: string, value: any, ttlMs: number = 3600000): boolean { // 1 hour default
    if (typeof localStorage === 'undefined') return false;

    try {
      const expires = Date.now() + ttlMs;
      const data = JSON.stringify({ value, expires });
      const compressed = this.compressionEnabled ? this.compress(data) : data;
      localStorage.setItem(this.prefix + key, compressed);
      return true;
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
      return false;
    }
  }

  get<T = any>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const compressed = localStorage.getItem(this.prefix + key);
      if (!compressed) return null;

      const data = this.compressionEnabled ? this.decompress(compressed) : compressed;
      const parsed = JSON.parse(data);

      if (Date.now() > parsed.expires) {
        this.delete(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      this.delete(key);
      return null;
    }
  }

  delete(key: string): boolean {
    if (typeof localStorage === 'undefined') return false;

    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    if (typeof localStorage === 'undefined') return false;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  get size(): number {
    if (typeof localStorage === 'undefined') return 0;

    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
}

// HTTP Cache Headers Utilities
export const httpCacheHeaders = {
  // Static assets - cache for 1 year
  staticAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // API responses - cache for 5 minutes
  apiResponse: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  },

  // User-specific data - no cache
  userData: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Video content - cache for 1 hour
  videoContent: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  },

  // Images - cache for 1 day
  images: {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  },
};

// Cache instances
export const memoryCache = new MemoryCache();
export const localStorageCache = new LocalStorageCache();

// Combined Cache Strategy
export class SmartCache {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();

  async get<T = any>(key: string, fetcher?: () => Promise<T>, options?: {
    memoryTtl?: number;
    storageTtl?: number;
    useMemory?: boolean;
    useStorage?: boolean;
  }): Promise<T | null> {
    const {
      memoryTtl = 300000, // 5 minutes
      storageTtl = 3600000, // 1 hour
      useMemory = true,
      useStorage = true,
    } = options || {};

    // Try memory cache first
    if (useMemory) {
      const memoryValue = this.memoryCache.get<T>(key);
      if (memoryValue !== null) {
        return memoryValue;
      }
    }

    // Try local storage cache
    if (useStorage) {
      const storageValue = this.localStorageCache.get<T>(key);
      if (storageValue !== null) {
        // Populate memory cache
        if (useMemory) {
          this.memoryCache.set(key, storageValue, memoryTtl);
        }
        return storageValue;
      }
    }

    // Fetch new data if fetcher provided
    if (fetcher) {
      try {
        const value = await fetcher();

        // Cache the result
        if (useMemory) {
          this.memoryCache.set(key, value, memoryTtl);
        }
        if (useStorage) {
          this.localStorageCache.set(key, value, storageTtl);
        }

        return value;
      } catch (error) {
        console.warn('Cache fetcher failed:', error);
        return null;
      }
    }

    return null;
  }

  set(key: string, value: any, options?: {
    memoryTtl?: number;
    storageTtl?: number;
    useMemory?: boolean;
    useStorage?: boolean;
  }): void {
    const {
      memoryTtl = 300000,
      storageTtl = 3600000,
      useMemory = true,
      useStorage = true,
    } = options || {};

    if (useMemory) {
      this.memoryCache.set(key, value, memoryTtl);
    }
    if (useStorage) {
      this.localStorageCache.set(key, value, storageTtl);
    }
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    this.localStorageCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.localStorageCache.clear();
  }

  has(key: string): boolean {
    return this.memoryCache.has(key) || this.localStorageCache.has(key);
  }
}

// Global smart cache instance
export const smartCache = new SmartCache();

// Cache warming utilities
export function warmCache(key: string, fetcher: () => Promise<any>, options?: Parameters<SmartCache['get']>[2]): void {
  // Fire and forget
  smartCache.get(key, fetcher, options).catch(console.warn);
}

// Cache invalidation strategies
export const cacheInvalidation = {
  // Invalidate by pattern
  invalidatePattern: (pattern: RegExp): void => {
    // This would require iterating all keys, which is expensive
    // For now, just clear all caches
    smartCache.clear();
  },

  // Invalidate user-specific data
  invalidateUserData: (): void => {
    // Clear memory cache for user-related keys
    // This is a simplified implementation
    smartCache.clear();
  },

  // Invalidate all caches
  invalidateAll: (): void => {
    smartCache.clear();
  },
};

// Cache statistics
export function getCacheStats() {
  return {
    memory: {
      size: memoryCache.size(),
    },
    localStorage: {
      size: localStorageCache.size,
    },
  };
}

// Service Worker cache integration (if available)
export const swCache = {
  async get(key: string): Promise<any | null> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cache = await caches.open('app-cache-v1');
        const response = await cache.match(key);
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.warn('SW cache get failed:', error);
      }
    }
    return null;
  },

  async set(key: string, value: any, ttlMs: number = 3600000): Promise<boolean> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cache = await caches.open('app-cache-v1');
        const expires = Date.now() + ttlMs;
        const response = new Response(JSON.stringify({ value, expires }), {
          headers: {
            'content-type': 'application/json',
            'sw-cache-expires': expires.toString(),
          },
        });
        await cache.put(key, response);
        return true;
      } catch (error) {
        console.warn('SW cache set failed:', error);
      }
    }
    return false;
  },
};