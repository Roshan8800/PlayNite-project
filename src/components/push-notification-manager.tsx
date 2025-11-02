'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export function PushNotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user && isSupported) {
      // Check if user has push notifications enabled in their profile
      const userRef = doc(firestore, 'users', user.uid);
      // This would be set when user enables/disables notifications
    }
  }, [user, isSupported, firestore]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive push notifications for updates.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Permission denied',
          description: 'Push notifications are disabled. You can enable them in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to request notification permission.',
      });
    }
  };

  const subscribeToNotifications = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to server
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          subscription,
        }),
      });

      // Update user profile
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        pushNotificationsEnabled: true,
      });

      setIsSubscribed(true);
      toast({
        title: 'Subscribed to notifications',
        description: 'You will receive notifications for new content and updates.',
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription failed',
        description: 'Failed to subscribe to push notifications.',
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Update user profile
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        pushNotificationsEnabled: false,
      });

      setIsSubscribed(false);
      toast({
        title: 'Unsubscribed from notifications',
        description: 'You will no longer receive push notifications.',
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unsubscribe from notifications.',
      });
    }
  };

  if (!isSupported) {
    return null; // Push notifications not supported
  }

  return (
    <div className="flex items-center gap-2">
      {permission === 'default' && (
        <Button variant="outline" size="sm" onClick={requestPermission}>
          <Bell className="mr-2 h-4 w-4" />
          Enable Notifications
        </Button>
      )}

      {permission === 'granted' && !isSubscribed && (
        <Button variant="outline" size="sm" onClick={subscribeToNotifications}>
          <Bell className="mr-2 h-4 w-4" />
          Subscribe to Updates
        </Button>
      )}

      {permission === 'granted' && isSubscribed && (
        <Button variant="outline" size="sm" onClick={unsubscribeFromNotifications}>
          <BellOff className="mr-2 h-4 w-4" />
          Unsubscribe
        </Button>
      )}

      {permission === 'denied' && (
        <div className="text-sm text-muted-foreground">
          Notifications blocked. Enable in browser settings.
        </div>
      )}
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}