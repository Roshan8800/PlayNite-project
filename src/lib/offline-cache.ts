// Offline caching and sync management

import { ApplicationError, ErrorType } from './errors';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: number;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export class OfflineCache {
  private cache = new Map<string, CacheEntry>();
  private pendingOperations: SyncOperation[] = [];
  private readonly CACHE_PREFIX = 'offline_cache_';
  private readonly SYNC_PREFIX = 'sync_ops_';
  private readonly CACHE_VERSION = 1;

  constructor(private dbName = 'playnite_offline') {
    this.initializeStorage();
  }

  private async initializeStorage() {
    if (typeof window === 'undefined') return;

    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, falling back to localStorage');
        return;
      }

      // Initialize IndexedDB
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Create sync operations store
        if (!db.objectStoreNames.contains('syncOperations')) {
          const syncStore = db.createObjectStore('syncOperations', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.loadFromStorage();
      };

      request.onerror = () => {
        console.warn('Failed to initialize IndexedDB, using localStorage fallback');
      };
    } catch (error) {
      console.warn('Storage initialization failed:', error);
    }
  }

  private async loadFromStorage() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache', 'syncOperations'], 'readonly');

      // Load cache entries
      const cacheRequest = transaction.objectStore('cache').getAll();
      cacheRequest.onsuccess = () => {
        cacheRequest.result.forEach((entry: CacheEntry) => {
          this.cache.set(entry.key, entry);
        });
      };

      // Load pending operations
      const syncRequest = transaction.objectStore('syncOperations').getAll();
      syncRequest.onsuccess = () => {
        this.pendingOperations = syncRequest.result;
      };
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
      version: this.CACHE_VERSION,
    };

    this.cache.set(key, entry);

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(entry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      // Fallback to localStorage
      try {
        localStorage.setItem(
          this.CACHE_PREFIX + key,
          JSON.stringify(entry)
        );
      } catch (storageError) {
        console.warn('Failed to cache data:', storageError);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      // Try localStorage fallback
      try {
        const stored = localStorage.getItem(this.CACHE_PREFIX + key);
        if (stored) {
          const parsedEntry: CacheEntry<T> = JSON.parse(stored);
          if (!parsedEntry.expiresAt || parsedEntry.expiresAt > Date.now()) {
            this.cache.set(key, parsedEntry);
            return parsedEntry.data;
          } else {
            localStorage.removeItem(this.CACHE_PREFIX + key);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve cached data:', error);
      }
      return null;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      // Fallback to localStorage
      try {
        localStorage.removeItem(this.CACHE_PREFIX + key);
      } catch (storageError) {
        console.warn('Failed to delete cached data:', storageError);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      // Fallback to localStorage
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith(this.CACHE_PREFIX))
          .forEach(key => localStorage.removeItem(key));
      } catch (storageError) {
        console.warn('Failed to clear cache:', storageError);
      }
    }
  }

  // Sync operations management
  async addSyncOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncOp: SyncOperation = {
      ...operation,
      id: `${operation.type}_${operation.collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingOperations.push(syncOp);

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['syncOperations'], 'readwrite');
      const store = transaction.objectStore('syncOperations');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(syncOp);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to store sync operation:', error);
    }
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    return [...this.pendingOperations];
  }

  async removeSyncOperation(id: string): Promise<void> {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['syncOperations'], 'readwrite');
      const store = transaction.objectStore('syncOperations');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to remove sync operation:', error);
    }
  }

  async incrementRetryCount(id: string): Promise<void> {
    const operation = this.pendingOperations.find(op => op.id === id);
    if (operation) {
      operation.retryCount++;

      try {
        const db = await this.openDB();
        const transaction = db.transaction(['syncOperations'], 'readwrite');
        const store = transaction.objectStore('syncOperations');
        await new Promise<void>((resolve, reject) => {
          const request = store.put(operation);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn('Failed to update sync operation retry count:', error);
      }
    }
  }

  // Utility methods
  async cleanupExpired(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingOperations: this.pendingOperations.length,
      storageUsed: this.estimateStorageSize(),
    };
  }

  private estimateStorageSize(): number {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length;
    }
    for (const operation of this.pendingOperations) {
      size += JSON.stringify(operation).length;
    }
    return size;
  }
}

// Global offline cache instance
export const offlineCache = new OfflineCache();

// Offline-aware data fetching with caching
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    forceRefresh?: boolean;
    fallbackToCache?: boolean;
  } = {}
): Promise<T> {
  const { ttl, forceRefresh = false, fallbackToCache = true } = options;

  // Try to get from cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await offlineCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();
    // Cache the result
    await offlineCache.set(key, data, ttl);
    return data;
  } catch (error) {
    // If fetch fails and we have fallback to cache enabled
    if (fallbackToCache) {
      const cached = await offlineCache.get<T>(key);
      if (cached !== null) {
        console.warn('Using cached data due to fetch failure:', error);
        return cached;
      }
    }

    // If we get here, both fetch and cache failed
    throw new ApplicationError(
      ErrorType.NETWORK,
      'Failed to fetch data and no cached version available',
      { details: error }
    );
  }
}

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    offlineCache.cleanupExpired();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}