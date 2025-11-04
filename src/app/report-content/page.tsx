'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, FileText } from 'lucide-react';

export default function ReportContentPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    contentUrl: '',
    contentType: '',
    violationType: '',
    description: '',
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Report submitted successfully!',
        description: 'Thank you for helping us maintain a safe platform. We\'ll review your report within 24 hours.',
      });

      // Reset form
      setFormData({
        reporterName: '',
        reporterEmail: '',
        contentUrl: '',
        contentType: '',
        violationType: '',
        description: '',
        anonymous: false,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit report',
        description: 'Please try again later or contact support directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline mb-4">Report Content</h1>
        <p className="text-lg text-muted-foreground">
          Help us maintain a safe and compliant platform by reporting inappropriate or violating content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Information Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Why Report Content?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your reports help us identify and remove content that violates our community guidelines
                or applicable laws. We take all reports seriously and investigate them promptly.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Illegal content</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Child exploitation material</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Non-consensual content</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Copyright infringement</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Spam or misleading content</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-primary">1.</span>
                  <span>Your report is logged and assigned to our moderation team.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary">2.</span>
                  <span>We review the content within 24 hours for urgent issues.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary">3.</span>
                  <span>Appropriate action is taken (removal, disabling embed, etc.).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary">4.</span>
                  <span>You may receive a follow-up if additional information is needed.</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>DMCA Claims:</strong> For copyright infringement, please use our
                  <a href="/dmca-policy" className="text-primary hover:underline ml-1">DMCA Policy</a> page.
                </p>
                <p>
                  <strong>Third-Party Content:</strong> Most videos are embedded from external platforms.
                  We may need to forward your report to the original host.
                </p>
                <p>
                  <strong>False Reports:</strong> Please only report content you genuinely believe violates our policies.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Report</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us investigate quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentUrl">Content URL *</Label>
                <Input
                  id="contentUrl"
                  value={formData.contentUrl}
                  onChange={(e) => handleInputChange('contentUrl', e.target.value)}
                  placeholder="https://playnite.com/video/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The full URL of the video or content you want to report
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type *</Label>
                <Select value={formData.contentType} onValueChange={(value) => handleInputChange('contentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="thumbnail">Thumbnail/Image</SelectItem>
                    <SelectItem value="title">Title/Description</SelectItem>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="channel">Channel/Profile</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="violationType">Violation Type *</Label>
                <Select value={formData.violationType} onValueChange={(value) => handleInputChange('violationType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illegal">Illegal Content</SelectItem>
                    <SelectItem value="child">Child Exploitation</SelectItem>
                    <SelectItem value="non-consensual">Non-Consensual Content</SelectItem>
                    <SelectItem value="copyright">Copyright Infringement</SelectItem>
                    <SelectItem value="spam">Spam/Misleading</SelectItem>
                    <SelectItem value="harassment">Harassment/Abuse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please describe the issue in detail, including timestamps if applicable..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about what makes this content violate our policies
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => handleInputChange('anonymous', checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (we won't collect your contact information)
                  </Label>
                </div>
              </div>

              {!formData.anonymous && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterName">Your Name</Label>
                    <Input
                      id="reporterName"
                      value={formData.reporterName}
                      onChange={(e) => handleInputChange('reporterName', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reporterEmail">Your Email</Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      value={formData.reporterEmail}
                      onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          For urgent safety concerns, please contact local authorities or emergency services directly.
        </p>
      </div>
    </div>
  );
}