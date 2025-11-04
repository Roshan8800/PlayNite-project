'use client';

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkStatus } from '@/hooks/use-network-status';

interface NetworkStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
  compact?: boolean;
}

export function NetworkStatusIndicator({
  showDetails = false,
  className = '',
  compact = false
}: NetworkStatusIndicatorProps) {
  const {
    isOnline,
    isSlowConnection,
    connectionType,
    effectiveType,
    downlink,
    rtt,
    lastOnlineCheck,
    lastOfflineTime
  } = useNetworkStatus();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-destructive" />;
    }
    if (isSlowConnection) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    if (isSlowConnection) {
      return 'Slow connection';
    }
    return 'Online';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isSlowConnection) return 'secondary';
    return 'default';
  };

  const getConnectionDetails = () => {
    if (!isOnline) {
      const offlineDuration = lastOfflineTime
        ? Math.floor((Date.now() - lastOfflineTime.getTime()) / 1000 / 60)
        : 0;
      return `Offline for ${offlineDuration} minutes`;
    }

    const details = [];
    if (effectiveType !== 'unknown') {
      details.push(`Type: ${effectiveType}`);
    }
    if (downlink > 0) {
      details.push(`Speed: ${downlink} Mbps`);
    }
    if (rtt > 0) {
      details.push(`Latency: ${rtt}ms`);
    }
    if (lastOnlineCheck) {
      const minutesAgo = Math.floor((Date.now() - lastOnlineCheck.getTime()) / 1000 / 60);
      details.push(`Checked: ${minutesAgo}m ago`);
    }

    return details.length > 0 ? details.join(' • ') : 'Connection details unavailable';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 ${className}`}>
              {getStatusIcon()}
              {!isOnline && <span className="text-xs text-destructive">Offline</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{getStatusText()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {getConnectionDetails()}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getStatusColor() as any}
            className={`flex items-center gap-2 cursor-help ${className}`}
          >
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
            {showDetails && (
              <span className="text-xs opacity-75">
                {effectiveType !== 'unknown' ? effectiveType : ''}
                {downlink > 0 ? ` ${downlink}M` : ''}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm max-w-xs">
            <div className="font-medium mb-1">{getStatusText()}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{getConnectionDetails()}</div>
              {connectionType !== 'unknown' && (
                <div>Network: {connectionType}</div>
              )}
              {!isOnline && lastOfflineTime && (
                <div className="text-destructive">
                  Went offline at {lastOfflineTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Network status banner for offline mode
export function NetworkStatusBanner() {
  const { isOnline, lastOfflineTime } = useNetworkStatus();

  if (isOnline) return null;

  const offlineDuration = lastOfflineTime
    ? Math.floor((Date.now() - lastOfflineTime.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>
          You're currently offline
          {offlineDuration > 0 && ` (${offlineDuration} minutes)`}.
          Some features may be limited.
        </span>
      </div>
    </div>
  );
}

// Network quality indicator
export function NetworkQualityIndicator({ className = '' }: { className?: string }) {
  const { isOnline, effectiveType, downlink } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className={`flex items-center gap-1 text-destructive ${className}`}>
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Offline</span>
      </div>
    );
  }

  const getQualityBars = () => {
    if (effectiveType === '4g' && downlink >= 10) return 4;
    if (effectiveType === '4g' && downlink >= 5) return 3;
    if (effectiveType === '4g' || (effectiveType === '3g' && downlink >= 2)) return 2;
    if (effectiveType === '3g' || effectiveType === '2g' || downlink >= 0.5) return 1;
    return 0;
  };

  const bars = getQualityBars();
  const qualityText = bars >= 3 ? 'Good' : bars >= 2 ? 'Fair' : bars >= 1 ? 'Poor' : 'Very Poor';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 h-3 rounded-sm ${
              bar <= bars
                ? bars >= 3
                  ? 'bg-green-500'
                  : bars >= 2
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{qualityText}</span>
    </div>
  );
}