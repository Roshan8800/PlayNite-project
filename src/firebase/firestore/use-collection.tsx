'use client';
import {
  useCollection as useFirebaseCollection,
  useCollectionData as useFirebaseCollectionData,
} from 'react-firebase-hooks/firestore';
import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { retryFirestoreOperation } from '@/lib/retry';
import { fetchWithCache } from '@/lib/offline-cache';
import { FirestoreError, NetworkError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

export function useCollection<T extends DocumentData>(
  query: CollectionReference<T> | Query<T> | undefined | null,
  options: {
    enableOffline?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  } = {}
) {
  const { enableOffline = true, cacheKey, cacheTTL = 5 * 60 * 1000 } = options; // 5 minutes default
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { toast } = useToast();
  const [cachedData, setCachedData] = useState<T[] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const [snapshot, loading, error] = useFirebaseCollection(query);

  // Generate cache key if not provided
  const actualCacheKey = cacheKey || (query ? `firestore_collection_${(query as any).id || 'unknown'}` : null);

  // Handle offline mode and caching
  useEffect(() => {
    if (!query) return;

    const handleDataFetch = async () => {
      if (!isOnline && enableOffline && actualCacheKey) {
        // Try to load from cache when offline
        try {
          const cached = await fetchWithCache(
            actualCacheKey,
            () => Promise.resolve([]), // This won't be called if cached
            { ttl: cacheTTL, fallbackToCache: true }
          );
          if (cached && cached.length > 0) {
            setCachedData(cached);
            toast({
              title: "Offline Mode",
              description: "Showing cached data. Some features may be limited.",
              duration: 3000,
            });
          }
        } catch (cacheError) {
          console.warn('Failed to load cached data:', cacheError);
        }
      } else if (isOnline && snapshot && !loading && !error) {
        // Cache successful data when online
        const freshData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T));
        if (actualCacheKey && freshData.length > 0) {
          fetchWithCache(
            actualCacheKey,
            () => Promise.resolve(freshData),
            { ttl: cacheTTL }
          ).catch(console.warn);
        }
        setCachedData(null); // Clear cached data when we have fresh data
      }
    };

    handleDataFetch();
  }, [query, isOnline, snapshot, loading, error, enableOffline, actualCacheKey, cacheTTL, toast]);

  // Enhanced error handling with retry logic
  useEffect(() => {
    if (error && isOnline) {
      const handleFirestoreError = async () => {
        const firestoreError = new FirestoreError(
          'Failed to load data from database',
          {
            details: error,
            component: 'useCollection',
            action: 'fetch',
            context: { queryId: (query as any)?.id, isOnline, isSlowConnection }
          }
        );

        // Attempt retry with network-aware logic
        if (retryCount < 3) {
          try {
            await retryFirestoreOperation(async () => {
              // The Firebase hook will automatically retry, but we can add custom logic here
              return Promise.resolve();
            });
            setRetryCount(prev => prev + 1);
            setLastError(null);
          } catch (retryError) {
            setLastError(retryError as Error);
            toast({
              title: "Connection Issue",
              description: isSlowConnection
                ? "Slow connection detected. Data may load slowly."
                : "Failed to load data. Please check your connection.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      };

      handleFirestoreError();
    } else if (!isOnline && !cachedData) {
      toast({
        title: "Offline",
        description: "You're currently offline. Some data may not be available.",
        duration: 3000,
      });
    }
  }, [error, isOnline, isSlowConnection, retryCount, cachedData, query, toast]);

  const data = useMemo(() => {
    if (snapshot) {
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
    // Return cached data if available and no fresh data
    if (cachedData && !isOnline) {
      return cachedData;
    }
    return undefined;
  }, [snapshot, cachedData, isOnline]);

  const enhancedLoading = loading || (!isOnline && !cachedData);
  const enhancedError = error || lastError;

  return {
    data,
    loading: enhancedLoading,
    error: enhancedError,
    snapshot,
    isOffline: !isOnline,
    hasCachedData: !!cachedData,
    retryCount
  };
}

export function useCollectionData<T extends DocumentData>(
  query: CollectionReference<T> | Query<T> | undefined | null,
  options: {
    enableOffline?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  } = {}
) {
  const { enableOffline = true, cacheKey, cacheTTL = 5 * 60 * 1000 } = options;
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { toast } = useToast();
  const [cachedData, setCachedData] = useState<T[] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const [data, loading, error, snapshot] = useFirebaseCollectionData(query);

  // Generate cache key if not provided
  const actualCacheKey = cacheKey || (query ? `firestore_collection_data_${(query as any).id || 'unknown'}` : null);

  // Handle offline mode and caching
  useEffect(() => {
    if (!query) return;

    const handleDataFetch = async () => {
      if (!isOnline && enableOffline && actualCacheKey) {
        // Try to load from cache when offline
        try {
          const cached = await fetchWithCache(
            actualCacheKey,
            () => Promise.resolve([]),
            { ttl: cacheTTL, fallbackToCache: true }
          );
          if (cached && cached.length > 0) {
            setCachedData(cached);
            toast({
              title: "Offline Mode",
              description: "Showing cached data. Some features may be limited.",
              duration: 3000,
            });
          }
        } catch (cacheError) {
          console.warn('Failed to load cached data:', cacheError);
        }
      } else if (isOnline && data && !loading && !error) {
        // Cache successful data when online
        if (actualCacheKey && data.length > 0) {
          fetchWithCache(
            actualCacheKey,
            () => Promise.resolve(data),
            { ttl: cacheTTL }
          ).catch(console.warn);
        }
        setCachedData(null);
      }
    };

    handleDataFetch();
  }, [query, isOnline, data, loading, error, enableOffline, actualCacheKey, cacheTTL, toast]);

  // Enhanced error handling with retry logic
  useEffect(() => {
    if (error && isOnline) {
      const handleFirestoreError = async () => {
        const firestoreError = new FirestoreError(
          'Failed to load collection data',
          {
            details: error,
            component: 'useCollectionData',
            action: 'fetch',
            context: { queryId: (query as any)?.id, isOnline, isSlowConnection }
          }
        );

        if (retryCount < 3) {
          try {
            await retryFirestoreOperation(async () => Promise.resolve());
            setRetryCount(prev => prev + 1);
            setLastError(null);
          } catch (retryError) {
            setLastError(retryError as Error);
            toast({
              title: "Connection Issue",
              description: isSlowConnection
                ? "Slow connection detected. Data may load slowly."
                : "Failed to load data. Please check your connection.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      };

      handleFirestoreError();
    } else if (!isOnline && !cachedData) {
      toast({
        title: "Offline",
        description: "You're currently offline. Some data may not be available.",
        duration: 3000,
      });
    }
  }, [error, isOnline, isSlowConnection, retryCount, cachedData, query, toast]);

  const enhancedData = data || (cachedData && !isOnline ? cachedData : undefined);
  const enhancedLoading = loading || (!isOnline && !cachedData);
  const enhancedError = error || lastError;

  return {
    data: enhancedData,
    loading: enhancedLoading,
    error: enhancedError,
    snapshot,
    isOffline: !isOnline,
    hasCachedData: !!cachedData,
    retryCount
  };
}
