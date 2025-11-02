'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Check,
  Share2
} from 'lucide-react';
import { useDoc, useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

function SharePageContent({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const videoRef = doc(firestore, 'videos', id);
  const { data: video, loading: videoLoading } = useDoc(videoRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/watch/${id}`);
    }
  }, [id]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'The video link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
      });
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `Check out this video: ${video?.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `Check out this video: ${video?.title} ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Check out this video: ${video?.title}`;
    const body = `${customMessage || 'I thought you might like this video!'}\n\n${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const shareOptions: ShareOption[] = [
    {
      name: 'Copy Link',
      icon: copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      action: copyToClipboard,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      action: shareToFacebook,
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      action: shareToTwitter,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      action: shareToWhatsApp,
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      action: shareViaEmail,
    },
  ];

  if (videoLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-32 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Video not found</h1>
        <p className="text-muted-foreground">This video may have been removed or is unavailable.</p>
      </div>
    );
  }

  const currentVideo = video as Video;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Share2 className="h-6 w-6" />
          Share Video
        </h1>
        <p className="text-muted-foreground">
          Share "{currentVideo.title}" with friends and followers
        </p>
      </div>

      {/* Video Preview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="h-24 w-32 rounded overflow-hidden bg-muted flex-shrink-0">
              <img
                src={currentVideo.thumbnailUrl}
                alt={currentVideo.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                {currentVideo.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {currentVideo.channel}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{currentVideo.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(currentVideo.uploadedAt || Date.now()), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share URL */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Share Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add a Message (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add a personal message to your share..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Share Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                onClick={option.action}
                className={`h-12 ${option.color} transition-colors`}
                variant="default"
              >
                {option.icon}
                <span className="ml-2">{option.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Embed Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copy and paste this code to embed the video on your website.
          </p>
          <div className="flex gap-2">
            <Input
              value={`<iframe width="560" height="315" src="${shareUrl}/embed" frameborder="0" allowfullscreen></iframe>`}
              readOnly
              className="flex-1 font-mono text-xs"
            />
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <SharePageContent id={id} />;
}