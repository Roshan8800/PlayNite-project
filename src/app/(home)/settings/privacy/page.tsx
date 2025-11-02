'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Lock, Trash2, Download, History, Users, Bell } from "lucide-react";

export default function PrivacySettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: false,
    allowDirectMessages: true,
    allowTagging: true,
    showWatchHistory: false,
    showLikedVideos: false,
    showSubscriptions: false,
    allowAnalytics: true,
    allowPersonalizedAds: false,
    dataRetention: '1year',
    activityTracking: true,
  });

  useEffect(() => {
    if (user) {
      // Load user privacy settings from Firestore
      setSettings(prev => ({
        ...prev,
        ...(user as any).privacySettings,
      }));
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        privacySettings: settings,
      });

      toast({
        title: 'Privacy settings saved',
        description: 'Your privacy preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save privacy settings. Please try again.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'
    );

    if (!confirmed) return;

    try {
      // Delete user data from Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await deleteDoc(userRef);

      // Note: In a real app, you'd also need to delete from Firebase Auth
      // and handle cleanup of related data (videos, comments, etc.)

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Redirect to home or logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account. Please contact support.',
      });
    }
  };

  const handleDownloadData = async () => {
    if (!user) return;

    try {
      // In a real app, this would trigger a data export process
      toast({
        title: 'Data export initiated',
        description: 'You will receive an email with your data export link.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initiate data export.',
      });
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Privacy Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Control your privacy and data sharing preferences.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Profile Privacy</h2>
          <p className="text-muted-foreground">Control who can see your profile and activity.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={settings.profileVisibility} onValueChange={(value) => updateSetting('profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                    <SelectItem value="friends">Friends Only - Only approved followers</SelectItem>
                    <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Last Seen</Label>
                  <p className="text-sm text-muted-foreground">Show when you were last active</p>
                </div>
                <Switch
                  checked={settings.showLastSeen}
                  onCheckedChange={(checked) => updateSetting('showLastSeen', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">Let others send you private messages</p>
                </div>
                <Switch
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Tagging</Label>
                  <p className="text-sm text-muted-foreground">Allow others to tag you in comments</p>
                </div>
                <Switch
                  checked={settings.allowTagging}
                  onCheckedChange={(checked) => updateSetting('allowTagging', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Activity Privacy</h2>
          <p className="text-muted-foreground">Control what others can see about your activity.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Watch History</Label>
                  <p className="text-sm text-muted-foreground">Let others see videos you've watched</p>
                </div>
                <Switch
                  checked={settings.showWatchHistory}
                  onCheckedChange={(checked) => updateSetting('showWatchHistory', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Liked Videos</Label>
                  <p className="text-sm text-muted-foreground">Let others see videos you've liked</p>
                </div>
                <Switch
                  checked={settings.showLikedVideos}
                  onCheckedChange={(checked) => updateSetting('showLikedVideos', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Subscriptions</Label>
                  <p className="text-sm text-muted-foreground">Let others see channels you subscribe to</p>
                </div>
                <Switch
                  checked={settings.showSubscriptions}
                  onCheckedChange={(checked) => updateSetting('showSubscriptions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Data & Analytics</h2>
          <p className="text-muted-foreground">Manage how your data is used and stored.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                </div>
                <Switch
                  checked={settings.allowAnalytics}
                  onCheckedChange={(checked) => updateSetting('allowAnalytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Personalized Ads</Label>
                  <p className="text-sm text-muted-foreground">Show ads based on your interests</p>
                </div>
                <Switch
                  checked={settings.allowPersonalizedAds}
                  onCheckedChange={(checked) => updateSetting('allowPersonalizedAds', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track your activity for recommendations</p>
                </div>
                <Switch
                  checked={settings.activityTracking}
                  onCheckedChange={(checked) => updateSetting('activityTracking', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select value={settings.dataRetention} onValueChange={(value) => updateSetting('dataRetention', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Data Management</h2>
          <p className="text-muted-foreground">Download or delete your data.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Download className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Download Your Data</h3>
                    <p className="text-sm text-muted-foreground">Get a copy of all your data</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDownloadData}>
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          <Shield className="mr-2 h-4 w-4" />
          Save Privacy Settings
        </Button>
      </div>
    </div>
  );
}