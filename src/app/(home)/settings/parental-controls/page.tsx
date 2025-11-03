'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Eye, Clock, Users, AlertTriangle } from "lucide-react";

export default function ParentalControlsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [settings, setSettings] = useState<{
    enabled: boolean;
    pinCode: string;
    ageRestriction: number;
    blockMatureContent: boolean;
    blockViolence: boolean;
    blockAdultThemes: boolean;
    timeLimits: {
      enabled: boolean;
      dailyLimit: number;
      sessionLimit: number;
    };
    contentFilters: {
      keywords: string[];
      channels: string[];
    };
    monitoring: {
      viewReports: boolean;
      activityLogs: boolean;
    };
  }>({
    enabled: false,
    pinCode: '',
    ageRestriction: 13,
    blockMatureContent: true,
    blockViolence: true,
    blockAdultThemes: true,
    timeLimits: {
      enabled: false,
      dailyLimit: 120, // minutes
      sessionLimit: 60, // minutes
    },
    contentFilters: {
      keywords: [],
      channels: [],
    },
    monitoring: {
      viewReports: false,
      activityLogs: false,
    },
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newChannel, setNewChannel] = useState('');

  useEffect(() => {
    if (user) {
      // Load user parental control settings from Firestore
      setSettings(prev => ({
        ...prev,
        ...(user as any).parentalControls,
      }));
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    // Validate PIN if enabled
    if (settings.enabled && (!settings.pinCode || settings.pinCode.length !== 4)) {
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'Please enter a 4-digit PIN code.',
      });
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        parentalControls: settings,
      });

      toast({
        title: 'Parental controls saved',
        description: 'Your parental control settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving parental controls:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save parental controls. Please try again.',
      });
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTimeLimits = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      timeLimits: { ...prev.timeLimits, [key]: value }
    }));
  };

  const updateMonitoring = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      monitoring: { ...prev.monitoring, [key]: value }
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.contentFilters.keywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        contentFilters: {
          ...prev.contentFilters,
          keywords: [...prev.contentFilters.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      contentFilters: {
        ...prev.contentFilters,
        keywords: prev.contentFilters.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const addChannel = () => {
    if (newChannel.trim() && !settings.contentFilters.channels.includes(newChannel.trim())) {
      setSettings(prev => ({
        ...prev,
        contentFilters: {
          ...prev.contentFilters,
          channels: [...prev.contentFilters.channels, newChannel.trim()]
        }
      }));
      setNewChannel('');
    }
  };

  const removeChannel = (channel: string) => {
    setSettings(prev => ({
      ...prev,
      contentFilters: {
        ...prev.contentFilters,
        channels: prev.contentFilters.channels.filter(c => c !== channel)
      }
    }));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Parental Controls
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Set restrictions and monitor content for younger users.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Main Controls</h2>
          <p className="text-muted-foreground">Enable and configure parental controls.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Parental Controls</Label>
                  <p className="text-sm text-muted-foreground">Activate content restrictions and monitoring</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSetting('enabled', checked)}
                />
              </div>

              {settings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN Code (4 digits)</Label>
                    <Input
                      id="pin"
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      value={settings.pinCode}
                      onChange={(e) => updateSetting('pinCode', e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-xs text-muted-foreground">Required to access blocked content</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Age Restriction</Label>
                    <Select value={settings.ageRestriction.toString()} onValueChange={(value) => updateSetting('ageRestriction', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age restriction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7+</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                        <SelectItem value="13">13+</SelectItem>
                        <SelectItem value="16">16+</SelectItem>
                        <SelectItem value="18">18+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {settings.enabled && (
        <>
          <Separator />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-headline">Content Filtering</h2>
              <p className="text-muted-foreground">Block inappropriate content types.</p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Block Mature Content</Label>
                      <p className="text-sm text-muted-foreground">Restrict content with mature themes</p>
                    </div>
                    <Switch
                      checked={settings.blockMatureContent}
                      onCheckedChange={(checked) => updateSetting('blockMatureContent', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Block Violence</Label>
                      <p className="text-sm text-muted-foreground">Restrict violent or graphic content</p>
                    </div>
                    <Switch
                      checked={settings.blockViolence}
                      onCheckedChange={(checked) => updateSetting('blockViolence', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Block Adult Themes</Label>
                      <p className="text-sm text-muted-foreground">Restrict content with adult themes</p>
                    </div>
                    <Switch
                      checked={settings.blockAdultThemes}
                      onCheckedChange={(checked) => updateSetting('blockAdultThemes', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-headline">Time Limits</h2>
              <p className="text-muted-foreground">Set daily and session time restrictions.</p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Time Limits</Label>
                      <p className="text-sm text-muted-foreground">Set restrictions on usage time</p>
                    </div>
                    <Switch
                      checked={settings.timeLimits.enabled}
                      onCheckedChange={(checked) => updateTimeLimits('enabled', checked)}
                    />
                  </div>

                  {settings.timeLimits.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Daily Time Limit (minutes)</Label>
                        <Select value={settings.timeLimits.dailyLimit.toString()} onValueChange={(value) => updateTimeLimits('dailyLimit', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select daily limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Session Time Limit (minutes)</Label>
                        <Select value={settings.timeLimits.sessionLimit.toString()} onValueChange={(value) => updateTimeLimits('sessionLimit', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-headline">Content Filters</h2>
              <p className="text-muted-foreground">Block specific keywords and channels.</p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <Label>Blocked Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword to block"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.contentFilters.keywords.map((keyword) => (
                        <div key={keyword} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Blocked Channels</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add channel to block"
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addChannel()}
                      />
                      <Button onClick={addChannel} disabled={!newChannel.trim()}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.contentFilters.channels.map((channel) => (
                        <div key={channel} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          {channel}
                          <button
                            onClick={() => removeChannel(channel)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-headline">Monitoring</h2>
              <p className="text-muted-foreground">Track and monitor usage.</p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>View Activity Reports</Label>
                      <p className="text-sm text-muted-foreground">Generate reports of viewing activity</p>
                    </div>
                    <Switch
                      checked={settings.monitoring.viewReports}
                      onCheckedChange={(checked) => updateMonitoring('viewReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Activity Logs</Label>
                      <p className="text-sm text-muted-foreground">Keep detailed logs of all activity</p>
                    </div>
                    <Switch
                      checked={settings.monitoring.activityLogs}
                      onCheckedChange={(checked) => updateMonitoring('activityLogs', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg" disabled={!user}>
          <Shield className="mr-2 h-4 w-4" />
          Save Parental Controls
        </Button>
      </div>
    </div>
  );
}