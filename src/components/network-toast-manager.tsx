'use client';

import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

export function NetworkToastManager() {
  const { isOnline, isSlowConnection, connectionType, downlink, rtt, lastOfflineTime } = useNetworkStatus();
  const { toast } = useToast();
  const [lastOnlineState, setLastOnlineState] = useState(isOnline);
  const [lastSlowConnectionState, setLastSlowConnectionState] = useState(isSlowConnection);

  // Handle online/offline state changes
  useEffect(() => {
    if (isOnline !== lastOnlineState) {
      if (isOnline) {
        // Came back online
        const offlineDuration = lastOfflineTime
          ? Math.floor((Date.now() - lastOfflineTime.getTime()) / 1000 / 60)
          : 0;

        toast({
          title: "Back Online",
          description: offlineDuration > 0
            ? `Connection restored after ${offlineDuration} minutes.`
            : "Internet connection restored.",
          duration: 4000,
        });
      } else {
        // Went offline
        toast({
          title: "Connection Lost",
          description: "You're currently offline. Some features may be limited.",
          variant: "destructive",
          duration: 0, // Keep visible until dismissed
        });
      }
      setLastOnlineState(isOnline);
    }
  }, [isOnline, lastOnlineState, lastOfflineTime, toast]);

  // Handle slow connection detection
  useEffect(() => {
    if (isSlowConnection !== lastSlowConnectionState) {
      if (isSlowConnection) {
        toast({
          title: "Slow Connection Detected",
          description: "Your connection is slow. Video quality may be reduced.",
          duration: 5000,
        });
      } else if (lastSlowConnectionState) {
        // Connection improved
        toast({
          title: "Connection Improved",
          description: "Connection speed has improved.",
          duration: 3000,
        });
      }
      setLastSlowConnectionState(isSlowConnection);
    }
  }, [isSlowConnection, lastSlowConnectionState, toast]);

  // Periodic connection quality updates (only show for significant changes)
  useEffect(() => {
    if (!isOnline) return;

    const checkConnectionQuality = () => {
      if (isSlowConnection && downlink < 1) {
        toast({
          title: "Poor Connection",
          description: `Very slow connection (${downlink} Mbps). Consider switching networks.`,
          variant: "destructive",
          duration: 6000,
        });
      }
    };

    // Check every 2 minutes if connection is slow
    const interval = setInterval(() => {
      if (isSlowConnection) {
        checkConnectionQuality();
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isOnline, isSlowConnection, downlink, toast]);

  // Network recovery suggestions when offline for extended periods
  useEffect(() => {
    if (!isOnline && lastOfflineTime) {
      const offlineDuration = Date.now() - lastOfflineTime.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      const fifteenMinutes = 15 * 60 * 1000;

      if (offlineDuration > fifteenMinutes) {
        toast({
          title: "Extended Offline Period",
          description: "You've been offline for over 15 minutes. Some cached content may be stale.",
          variant: "destructive",
          duration: 8000,
        });
      } else if (offlineDuration > fiveMinutes) {
        toast({
          title: "Still Offline",
          description: "Check your network settings or try switching to mobile data.",
          duration: 6000,
        });
      }
    }
  }, [isOnline, lastOfflineTime, toast]);

  return null; // This component only manages toasts, no UI
}

// Network status summary component for headers/toolbars
export function NetworkStatusSummary() {
  const { isOnline, isSlowConnection, connectionType, downlink } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Slow ({downlink > 0 ? `${downlink} Mbps` : 'Unknown'})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <Wifi className="h-4 w-4" />
      <span className="text-sm font-medium">
        {connectionType !== 'unknown' ? connectionType : 'Online'}
        {downlink > 0 && ` (${downlink} Mbps)`}
      </span>
    </div>
  );
}

// Network troubleshooting tips component
export function NetworkTroubleshootingTips({ isVisible }: { isVisible: boolean }) {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (!isVisible || isOnline) return null;

  const tips = [
    "Check if other websites load in your browser",
    "Try refreshing the page",
    "Check your Wi-Fi or mobile data connection",
    "Try switching between Wi-Fi and mobile data",
    "Restart your router or modem",
    "Contact your internet service provider if issues persist"
  ];

  return (
    <div className="p-4 bg-muted rounded-lg border">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        Network Troubleshooting Tips
      </h3>
      <ul className="space-y-1 text-sm">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}