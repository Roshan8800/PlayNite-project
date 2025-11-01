'use client';

import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { VideoCard } from '@/components/video-card';
import { summarizeContent } from '@/ai/flows/content-summarization';
import { generateTags } from '@/ai/flows/ai-tag-generation';
import {
  Bell,
  Download,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, limit, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState, Suspense } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function VideoPageContent({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const videoRef = doc(firestore, 'videos', id);
  const { data: video, loading: videoLoading } = useDoc(videoRef);

  const recommendedVideosQuery = query(
    collection(firestore, 'videos'),
    where('status', '==', 'Approved'),
    where('__name__', '!=', id),
    limit(10)
  );
  const { data: recommendedVideos, loading: recommendedLoading } = useCollection(recommendedVideosQuery);

  useEffect(() => {
    if (video) {
      if (user) {
        const historyRef = doc(firestore, 'users', user.uid, 'history', video.id);
        const historyData = { ...video, watchedAt: serverTimestamp() };
        setDoc(historyRef, historyData, { merge: true }).catch(e => {
            const permissionError = new FirestorePermissionError({
                path: historyRef.path,
                operation: 'update',
                requestResourceData: historyData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      }

      // Fetch AI content only if not already present
      if (!video.summary) {
        summarizeContent({ videoTitle: video.title, videoDescription: video.description })
          .then(res => {
            updateDoc(videoRef, { summary: res.summary });
          }).catch(() => {
            // Do not show error to user, just fail silently
            console.error("AI summary generation failed.");
          });
      }
      
      if (!video.tags || video.tags.length === 0) {
        generateTags({ videoTitle: video.title, videoDescription: video.description })
          .then(res => {
             updateDoc(videoRef, { tags: res.tags });
          }).catch(() => {
            // Do not show error to user, just fail silently
            console.error("AI tag generation failed.");
          });
      }
    }
  }, [video, firestore, user, videoRef]);

  if (videoLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-0 py-0 animate-fade-in">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <Skeleton className="aspect-video w-full" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="w-full space-y-4 lg:w-1/3">
            <Skeleton className="h-8 w-1/2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-40" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold">Video not found</h1>
        <p className="text-muted-foreground">This video may have been removed or is unavailable.</p>
      </div>
    );
  }
  
  const currentVideo = video as Video;

  const handleInteraction = (
    collectionName: string,
    successTitle: string,
    successDescription: string
  ) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to perform this action.',
      });
      return;
    }

    const docRef = doc(firestore, 'users', user.uid, collectionName, video.id);
    const interactionData = { ...video, addedAt: new Date().toISOString() };
    setDoc(docRef, interactionData, { merge: true })
      .then(() => {
        toast({
          title: successTitle,
          description: successDescription,
        });
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: interactionData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: `Could not complete the action.`,
        });
      });
  };


  return (
    <div className="container mx-auto max-w-7xl px-0 py-0 animate-fade-in">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <VideoPlayer video={currentVideo} />
          <div className="mt-4">
            <h1 className="text-3xl font-headline font-bold">{currentVideo.title}</h1>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentVideo.channelAvatarUrl} alt={currentVideo.channel} />
                  <AvatarFallback>{currentVideo.channel.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{currentVideo.channel}</p>
                  <p className="text-sm text-muted-foreground">2.3M subscribers</p>
                </div>
              </div>
              <Button variant="outline" className="flex-shrink-0" aria-label="Subscribe to channel">
                <Bell className="mr-2 h-4 w-4" /> Subscribed
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="secondary" onClick={() => handleInteraction('likes', 'Video Liked', `You liked "${currentVideo.title}".`)} aria-label="Like video"><ThumbsUp className="mr-2 h-4 w-4" /> {Math.floor(Math.random() * 1000)}K</Button>
                <Button variant="secondary" aria-label="Dislike video"><ThumbsDown className="h-4 w-4" /></Button>
                <Button variant="secondary" aria-label="Share video"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                <Button variant="secondary" aria-label="Download video"><Download className="mr-2 h-4 w-4" /> Download</Button>
              </div>
            </div>
            <Card className="mt-6 animate-fade-in-up" data-ai-hint="content summarization">
              <CardContent className="p-4">
                <p className="font-semibold">{currentVideo.views.toLocaleString()} views &bull; {formatDistanceToNow(new Date(currentVideo.uploadedAt), { addSuffix: true })}</p>
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{currentVideo.summary || <Skeleton className="h-16 w-full" />}</p>
                <p className="mt-2 text-sm">{currentVideo.description}</p>
              </CardContent>
            </Card>
            <div className="mt-6 animate-fade-in-up" data-ai-hint="tag generation" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-bold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {currentVideo.tags && currentVideo.tags.length > 0 ? currentVideo.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>) : <Skeleton className="h-6 w-48"/>}
                </div>
            </div>
            <Separator className="my-8" />
            <div className="space-y-6 animate-fade-in-up" data-ai-hint="sentiment analysis" style={{ animationDelay: '400ms' }}>
              <h2 className="text-2xl font-bold">Comments (1,345)</h2>
              <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src={user?.avatarUrl!} alt={user?.name!} data-ai-hint="person portrait"/>
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Input placeholder="Add a comment..." aria-label="Add a public comment"/>
                   <div className="mt-2 flex justify-end">
                     <Button>Comment</Button>
                   </div>
                </div>
              </div>
               {/* Comments section */}
            </div>
          </div>
        </div>
        <div className="w-full space-y-4 lg:w-1/3 animate-fade-in" data-ai-hint="content recommendation engine" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-headline font-bold">Up Next</h2>
          {recommendedLoading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-40" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )) : recommendedVideos?.map((recVideo, index) => (
            <div key={recVideo.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <VideoCard video={recVideo as Video} variant="horizontal" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function VideoPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <VideoPageContent id={id} />
    </Suspense>
  )
}
