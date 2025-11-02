'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Play, Volume2, Settings, Monitor, Smartphone, Tv } from "lucide-react";

export default function PlaybackSettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    defaultQuality: 'auto',
    autoplay: true,
    autoplayNext: true,
    volume: 80,
    playbackSpeed: 1.0,
    captions: false,
    captionsLanguage: 'en',
    backgroundPlay: false,
    pictureInPicture: true,
    skipIntro: true,
    skipCredits: false,
    rememberPosition: true,
    maxBuffer: 30,
    preferredDevice: 'any',
  });

  useEffect(() => {
    if (user) {
      // Load user playback settings from Firestore
      setSettings(prev => ({
        ...prev,
        ...user.playbackSettings,
      }));
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        playbackSettings: settings,
      });

      toast({
        title: 'Playback settings saved',
        description: 'Your video playback preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving playback settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save playback settings. Please try again.',
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
          Playback Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Customize your video watching experience.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Video Quality</h2>
          <p className="text-muted-foreground">Set your preferred video quality and streaming options.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Default Video Quality</Label>
                <Select value={settings.defaultQuality} onValueChange={(value) => updateSetting('defaultQuality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="2160p">4K (2160p)</SelectItem>
                    <SelectItem value="1440p">1440p</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                    <SelectItem value="480p">SD (480p)</SelectItem>
                    <SelectItem value="360p">Low (360p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Maximum Buffer Size (seconds)</Label>
                <Slider
                  value={[settings.maxBuffer]}
                  onValueChange={(value) => updateSetting('maxBuffer', value[0])}
                  max={120}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{settings.maxBuffer} seconds</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-position"
                  checked={settings.rememberPosition}
                  onCheckedChange={(checked) => updateSetting('rememberPosition', checked === true)}
                />
                <Label htmlFor="remember-position">Remember playback position</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Playback Behavior</h2>
          <p className="text-muted-foreground">Control how videos play and behave.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autoplay</Label>
                  <p className="text-sm text-muted-foreground">Start playing videos automatically</p>
                </div>
                <Switch
                  checked={settings.autoplay}
                  onCheckedChange={(checked) => updateSetting('autoplay', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autoplay Next Video</Label>
                  <p className="text-sm text-muted-foreground">Play the next video automatically</p>
                </div>
                <Switch
                  checked={settings.autoplayNext}
                  onCheckedChange={(checked) => updateSetting('autoplayNext', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Background Playback</Label>
                  <p className="text-sm text-muted-foreground">Continue playing when app is in background</p>
                </div>
                <Switch
                  checked={settings.backgroundPlay}
                  onCheckedChange={(checked) => updateSetting('backgroundPlay', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Picture-in-Picture</Label>
                  <p className="text-sm text-muted-foreground">Enable picture-in-picture mode</p>
                </div>
                <Switch
                  checked={settings.pictureInPicture}
                  onCheckedChange={(checked) => updateSetting('pictureInPicture', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Audio & Captions</h2>
          <p className="text-muted-foreground">Configure audio and subtitle settings.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Default Volume</Label>
                <div className="flex items-center space-x-4">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[settings.volume]}
                    onValueChange={(value) => updateSetting('volume', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{settings.volume}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Playback Speed</Label>
                <Select value={settings.playbackSpeed.toString()} onValueChange={(value) => updateSetting('playbackSpeed', parseFloat(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25x</SelectItem>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1.0">Normal (1x)</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="1.75">1.75x</SelectItem>
                    <SelectItem value="2.0">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Captions/Subtitles</Label>
                  <p className="text-sm text-muted-foreground">Show captions when available</p>
                </div>
                <Switch
                  checked={settings.captions}
                  onCheckedChange={(checked) => updateSetting('captions', checked)}
                />
              </div>

              {settings.captions && (
                <div className="space-y-2">
                  <Label>Caption Language</Label>
                  <Select value={settings.captionsLanguage} onValueChange={(value) => updateSetting('captionsLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Smart Features</h2>
          <p className="text-muted-foreground">Enable intelligent playback features.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skip Intros</Label>
                  <p className="text-sm text-muted-foreground">Automatically skip video introductions</p>
                </div>
                <Switch
                  checked={settings.skipIntro}
                  onCheckedChange={(checked) => updateSetting('skipIntro', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skip Credits</Label>
                  <p className="text-sm text-muted-foreground">Automatically skip end credits</p>
                </div>
                <Switch
                  checked={settings.skipCredits}
                  onCheckedChange={(checked) => updateSetting('skipCredits', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Device Preferences</h2>
          <p className="text-muted-foreground">Set preferences for different devices.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Preferred Playback Device</Label>
                <Select value={settings.preferredDevice} onValueChange={(value) => updateSetting('preferredDevice', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Device</SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Desktop/Laptop
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile
                      </div>
                    </SelectItem>
                    <SelectItem value="tv">
                      <div className="flex items-center gap-2">
                        <Tv className="h-4 w-4" />
                        Smart TV
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          <Settings className="mr-2 h-4 w-4" />
          Save Playback Settings
        </Button>
      </div>
    </div>
  );
}