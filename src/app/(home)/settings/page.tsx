'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PushNotificationManager } from "@/components/push-notification-manager";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [parentalControlsEnabled, setParentalControlsEnabled] = useState(false);
  const [ageRestriction, setAgeRestriction] = useState(18);

  useEffect(() => {
    if (user) {
      // Load user settings from Firestore
      setParentalControlsEnabled(user.parentalControlsEnabled || false);
      setAgeRestriction(user.ageRestriction || 18);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        parentalControlsEnabled,
        ageRestriction,
      });

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your account and app preferences.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Profile</h2>
          <p className="text-muted-foreground">Update your personal information.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Johnson" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex@example.com" disabled />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Playback</h2>
          <p className="text-muted-foreground">Customize your video viewing experience.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Default Video Quality</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="autoplay" defaultChecked />
                <Label htmlFor="autoplay">Autoplay next video</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator />

       <div className="grid gap-8 md:grid-cols-3">
         <div className="md:col-span-1">
           <h2 className="text-2xl font-headline">Privacy</h2>
           <p className="text-muted-foreground">Control your privacy settings.</p>
         </div>
         <div className="md:col-span-2">
           <Card>
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                 <Checkbox id="show-history" defaultChecked />
                 <Label htmlFor="show-history">Keep my viewing history</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox id="show-liked" />
                 <Label htmlFor="show-liked">Keep my liked videos private</Label>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>

       <Separator />

       <div className="grid gap-8 md:grid-cols-3">
         <div className="md:col-span-1">
           <h2 className="text-2xl font-headline">Notifications</h2>
           <p className="text-muted-foreground">Manage your notification preferences.</p>
         </div>
         <div className="md:col-span-2">
           <Card>
             <CardContent className="p-6 space-y-4">
               <PushNotificationManager />
               <div className="flex items-center space-x-2">
                 <Checkbox id="new-content" defaultChecked />
                 <Label htmlFor="new-content">Notify me about new content</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox id="recommendations" defaultChecked />
                 <Label htmlFor="recommendations">Send personalized recommendations</Label>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>

       <Separator />

       <div className="grid gap-8 md:grid-cols-3">
         <div className="md:col-span-1">
           <h2 className="text-2xl font-headline">Parental Controls</h2>
           <p className="text-muted-foreground">Set restrictions for content access.</p>
         </div>
         <div className="md:col-span-2">
           <Card>
             <CardContent className="p-6 space-y-4">
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="parental-controls"
                   checked={parentalControlsEnabled}
                   onCheckedChange={(checked) => setParentalControlsEnabled(checked === true)}
                 />
                 <Label htmlFor="parental-controls">Enable parental controls</Label>
               </div>
               {parentalControlsEnabled && (
                 <div className="space-y-2">
                   <Label htmlFor="age-restriction">Age Restriction</Label>
                   <Select
                     value={ageRestriction.toString()}
                     onValueChange={(value) => setAgeRestriction(parseInt(value))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select age restriction" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="13">13+</SelectItem>
                       <SelectItem value="16">16+</SelectItem>
                       <SelectItem value="18">18+</SelectItem>
                       <SelectItem value="21">21+</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               )}
               <Button onClick={handleSaveSettings}>Save Settings</Button>
             </CardContent>
           </Card>
         </div>
       </div>
    </div>
  )
}
