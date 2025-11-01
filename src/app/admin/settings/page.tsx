
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Admin Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Configure application-wide settings.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">Content Moderation</h2>
          <p className="text-muted-foreground">Set rules for content management.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center space-x-2">
                <Checkbox id="auto-approve" />
                <Label htmlFor="auto-approve">Automatically approve videos from trusted creators</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="ai-moderation" defaultChecked />
                <Label htmlFor="ai-moderation">Enable AI-powered content moderation</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-headline">User Settings</h2>
          <p className="text-muted-foreground">Default settings for new users.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>New User Default Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox id="require-verification" defaultChecked />
                <Label htmlFor="require-verification">Require email verification for new accounts</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
