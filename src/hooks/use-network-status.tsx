'use client';

import { useState, useEffect, useCallback } from 'react';
import { NetworkError } from '@/lib/errors';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  lastOnlineCheck: Date | null;
  lastOfflineTime: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    lastOnlineCheck: null,
    lastOfflineTime: null,
  });

  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setStatus(prev => ({
        ...prev,
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        isSlowConnection: connection.effectiveType === 'slow-2g' ||
                        connection.effectiveType === '2g' ||
                        connection.downlink < 1,
      }));
    }
  }, []);

  const checkOnlineStatus = useCallback(async () => {
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const isOnline = response.ok;
      setStatus(prev => ({
        ...prev,
        isOnline,
        lastOnlineCheck: new Date(),
        lastOfflineTime: isOnline ? null : prev.lastOfflineTime,
      }));

      return isOnline;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastOnlineCheck: new Date(),
        lastOfflineTime: prev.lastOfflineTime || new Date(),
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial connection info
    updateConnectionInfo();

    // Set up event listeners
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineCheck: new Date(),
        lastOfflineTime: null,
      }));
      // Verify the connection is actually working
      setTimeout(checkOnlineStatus, 1000);
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastOfflineTime: new Date(),
      }));
    };

    const handleConnectionChange = () => {
      updateConnectionInfo();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic connectivity checks when online
    const intervalId = setInterval(() => {
      if (status.isOnline) {
        checkOnlineStatus();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', handleConnectionChange);
      }

      clearInterval(intervalId);
    };
  }, [updateConnectionInfo, checkOnlineStatus, status.isOnline]);

  const forceCheck = useCallback(() => {
    return checkOnlineStatus();
  }, [checkOnlineStatus]);

  return {
    ...status,
    forceCheck,
  };
}

// Hook for network-aware operations
export function useNetworkAwareOperation() {
  const { isOnline, isSlowConnection, forceCheck } = useNetworkStatus();

  const executeWithNetworkCheck = useCallback(async function <T>(
    operation: () => Promise<T>,
    options: {
      requireOnline?: boolean;
      fallback?: () => Promise<T>;
      retryOnReconnect?: boolean;
    } = {}
  ): Promise<T> {
    const { requireOnline = true, fallback, retryOnReconnect = true } = options;

    if (requireOnline && !isOnline) {
      if (fallback) {
        return fallback();
      }
      throw new NetworkError('No internet connection available');
    }

    try {
      return await operation();
    } catch (error) {
      // If operation fails and we're offline, try fallback
      if (!isOnline && fallback) {
        return fallback();
      }

      // If it's a network error and we should retry on reconnect
      if (error instanceof NetworkError && retryOnReconnect) {
        // Wait for reconnection and retry
        return new Promise((resolve, reject) => {
          const checkAndRetry = async () => {
            const online = await forceCheck();
            if (online) {
              try {
                const result = await operation();
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
            } else {
              // Check again in 5 seconds
              setTimeout(checkAndRetry, 5000);
            }
          };

          // Start checking in 2 seconds
          setTimeout(checkAndRetry, 2000);
        });
      }

      throw error;
    }
  }, [isOnline, forceCheck]);

  return {
    executeWithNetworkCheck,
    isOnline,
    isSlowConnection,
  };
}