'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Smartphone, Tv, Tablet, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'tv';
  userAgent: string;
  lastActive: string;
  currentVideo?: {
    videoId: string;
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: string;
  };
}

interface CrossDeviceSyncProps {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  onSyncFromDevice: (time: number, isPlaying: boolean) => void;
  className?: string;
}

export function CrossDeviceSync({
  videoId,
  currentTime,
  isPlaying,
  onSyncFromDevice,
  className
}: CrossDeviceSyncProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(true);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef({ time: currentTime, playing: isPlaying });

  // Generate device ID
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId') ||
      `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
    setCurrentDeviceId(deviceId);
  }, []);

  // Detect device type
  const getDeviceType = (): Device['type'] => {
    const ua = navigator.userAgent;
    if (ua.includes('TV') || ua.includes('SmartTV')) return 'tv';
    if (ua.includes('Tablet') || ua.includes('iPad')) return 'tablet';
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'mobile';
    return 'desktop';
  };

  const getDeviceName = (): string => {
    const type = getDeviceType();
    switch (type) {
      case 'tv': return 'Smart TV';
      case 'tablet': return 'Tablet';
      case 'mobile': return 'Mobile';
      default: return 'Desktop';
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  // Register current device
  useEffect(() => {
    if (!user || !currentDeviceId) return;

    const deviceData: Device = {
      id: currentDeviceId,
      name: getDeviceName(),
      type: getDeviceType(),
      userAgent: navigator.userAgent,
      lastActive: new Date().toISOString(),
    };

    const deviceRef = doc(firestore, 'users', user.uid, 'devices', currentDeviceId);
    setDoc(deviceRef, deviceData, { merge: true }).catch(console.error);
  }, [user, currentDeviceId, firestore]);

  // Listen for device changes
  useEffect(() => {
    if (!user) return;

    const devicesRef = doc(firestore, 'users', user.uid, 'devices');
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const devicesData = snapshot.data();
        const deviceList = Object.values(devicesData || {}) as Device[];
        setDevices(deviceList.filter(d => d.id !== currentDeviceId));
      }
    });

    return unsubscribe;
  }, [user, currentDeviceId, firestore]);

  // Sync playback state
  useEffect(() => {
    if (!user || !currentDeviceId || !syncEnabled) return;

    // Debounce sync updates
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const deviceRef = doc(firestore, 'users', user.uid, 'devices', currentDeviceId);
      updateDoc(deviceRef, {
        lastActive: serverTimestamp(),
        currentVideo: {
          videoId,
          currentTime,
          isPlaying,
          lastUpdate: new Date().toISOString(),
        },
      }).catch(console.error);

      setLastSyncTime(new Date());
    }, 1000);

    lastUpdateRef.current = { time: currentTime, playing: isPlaying };
  }, [user, currentDeviceId, videoId, currentTime, isPlaying, syncEnabled, firestore]);

  // Listen for sync from other devices
  useEffect(() => {
    if (!user || !currentDeviceId || !syncEnabled) return;

    const deviceRef = doc(firestore, 'users', user.uid, 'devices', currentDeviceId);
    const unsubscribe = onSnapshot(deviceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Device;
        const currentVideo = data.currentVideo;

        if (currentVideo && currentVideo.videoId === videoId) {
          const lastUpdate = new Date(currentVideo.lastUpdate);
          const now = new Date();

          // Only sync if update is recent (within 5 seconds) and from another device
          if (now.getTime() - lastUpdate.getTime() < 5000) {
            // Check if this is significantly different from our current state
            const timeDiff = Math.abs(currentVideo.currentTime - lastUpdateRef.current.time);
            const playingDiff = currentVideo.isPlaying !== lastUpdateRef.current.playing;

            if (timeDiff > 5 || playingDiff) {
              onSyncFromDevice(currentVideo.currentTime, currentVideo.isPlaying);
              toast({
                title: 'Synced from another device',
                description: 'Playback state updated from your other device.',
              });
            }
          }
        }
      }
    });

    return unsubscribe;
  }, [user, currentDeviceId, videoId, syncEnabled, onSyncFromDevice, toast, firestore]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSync = () => {
    setSyncEnabled(!syncEnabled);
    toast({
      title: syncEnabled ? 'Sync disabled' : 'Sync enabled',
      description: syncEnabled
        ? 'Cross-device sync has been turned off.'
        : 'Cross-device sync has been turned on.',
    });
  };

  const syncFromDevice = (device: Device) => {
    if (device.currentVideo) {
      onSyncFromDevice(device.currentVideo.currentTime, device.currentVideo.isPlaying);
      toast({
        title: 'Synced from device',
        description: `Playback synced from ${device.name}.`,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sync Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {syncEnabled && (
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync {lastSyncTime ? `• ${Math.floor((Date.now() - lastSyncTime.getTime()) / 1000)}s ago` : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSync}
          disabled={!isOnline}
        >
          {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
        </Button>
      </div>

      {/* Current Device */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getDeviceIcon(getDeviceType())}
              <span className="font-medium">{getDeviceName()}</span>
              <Badge variant="default" className="text-xs">
                Current
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Active now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Devices */}
      {devices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Other Devices</h4>
          {devices.map((device) => (
            <Card key={device.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active {new Date(device.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {device.currentVideo && device.currentVideo.videoId === videoId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncFromDevice(device)}
                      disabled={!syncEnabled || !isOnline}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                  )}
                </div>
                {device.currentVideo && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Watching • {Math.floor(device.currentVideo.currentTime / 60)}:{(device.currentVideo.currentTime % 60).toString().padStart(2, '0')}
                    {device.currentVideo.isPlaying ? ' (playing)' : ' (paused)'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sync Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Cross-device sync keeps your playback position in sync across all your devices</p>
        <p>• Changes are synced automatically when you're online</p>
        <p>• You can manually sync from any of your other active devices</p>
      </div>
    </div>
  );
}