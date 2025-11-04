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
import { summarizeContent } from '@/ai/flows/content-summarization';
import { generateTags } from '@/ai/flows/ai-tag-generation';
import { contentRecommendationEngine } from '@/ai/flows/content-recommendation-engine';
import dynamic from 'next/dynamic';

// Dynamic imports for performance
const VideoCard = dynamic(() => import('@/components/video-card').then(mod => ({ default: mod.VideoCard })), {
  loading: () => <Skeleton className="h-24 w-40" />,
  ssr: false,
});
const VideoPlayer = dynamic(() => import('@/components/video-player').then(mod => ({ default: mod.VideoPlayer })), {
  loading: () => <Skeleton className="aspect-video w-full" />,
  ssr: false,
});

// Video analytics hook for monitoring playback
const useVideoAnalytics = (videoId: string, firestore: any) => {
  const [analytics, setAnalytics] = useState({
    views: 0,
    watchTime: 0,
    completionRate: 0,
    errorCount: 0,
  });

  useEffect(() => {
    // Fetch initial analytics
    const fetchAnalytics = async () => {
      try {
        const analyticsDoc = await getDoc(doc(firestore, 'videos', videoId, 'analytics', 'summary'));
        if (analyticsDoc.exists()) {
          setAnalytics(analyticsDoc.data() as typeof analytics);
        }
      } catch (error) {
        console.error('Failed to fetch video analytics:', error);
      }
    };

    fetchAnalytics();
  }, [videoId, firestore]);

  const updateAnalytics = useCallback(async (data: Partial<typeof analytics>) => {
    try {
      await updateDoc(doc(firestore, 'videos', videoId, 'analytics', 'summary'), {
        ...data,
        lastUpdated: serverTimestamp()
      } as any, { merge: true });
      setAnalytics(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to update video analytics:', error);
    }
  }, [videoId, firestore]);

  return { analytics, updateAnalytics };
};
import {
  Bell,
  Download,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Copy,
  MessageCircle,
  Flag,
} from 'lucide-react';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, limit, setDoc, serverTimestamp, updateDoc, getDocs, getDoc, addDoc, FieldPath } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Metadata } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

function WatchPageContent({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [userRating, setUserRating] = useState<'like' | 'dislike' | null>(null);
  const [commentText, setCommentText] = useState('');
  const { analytics, updateAnalytics } = useVideoAnalytics(id, firestore);

  const videoRef = doc(firestore, 'videos', id);
  const { data: video, loading: videoLoading, error: videoError } = useDoc(videoRef);

  const [aiRecommendations, setAiRecommendations] = useState<Video[]>([]);
  const [aiRecommendationsLoading, setAiRecommendationsLoading] = useState(false);

  const recommendedVideosQuery = query(
    collection(firestore, 'videos'),
    where('status', '==', 'Approved'),
    where('__name__', '!=', id),
    limit(5)
  );
  const { data: recommendedVideos, loading: recommendedLoading } = useCollection(recommendedVideosQuery);

  useEffect(() => {
    if (video) {
      if (user) {
        // Check parental controls before allowing access
        const videoAgeRestriction = video.ageRestriction || 18;
        if (user.parentalControlsEnabled && user.ageRestriction && user.ageRestriction < videoAgeRestriction) {
          toast({
            variant: 'destructive',
            title: 'Content restricted',
            description: 'This content is not available with your current parental control settings.',
          });
          router.push('/home');
          return;
        }

        const historyRef = doc(firestore, 'users', user.uid, 'history', video.id);
        const historyData = {
          ...video,
          watchedAt: serverTimestamp(),
          watchProgress: 0,
          completed: false
        };
        setDoc(historyRef, historyData, { merge: true }).catch(e => {
            const permissionError = new FirestorePermissionError({
                path: historyRef.path,
                operation: 'update',
                requestResourceData: historyData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        // Generate AI recommendations based on user history
        setAiRecommendationsLoading(true);
        // Get user's viewing history for recommendations
        const historyQuery = query(collection(firestore, 'users', user.uid, 'history'), limit(10));
        getDocs(historyQuery).then(snapshot => {
          const historyIds = snapshot.docs.map(doc => doc.id);
          if (historyIds.length > 0) {
            contentRecommendationEngine({
              viewingHistory: historyIds,
              userPreferences: video.tags?.join(', ') || video.description || 'general video content'
            }).then(result => {
              // Fetch recommended videos by IDs
              const recommendationPromises = result.recommendedVideos.slice(0, 3).map(videoId =>
                getDoc(doc(firestore, 'videos', videoId))
              );
              Promise.all(recommendationPromises).then(docs => {
                const recommended = docs
                  .filter(doc => doc.exists())
                  .map(doc => ({ id: doc.id, ...doc.data() } as Video))
                  .filter(v => {
                    // Apply parental controls to recommendations
                    if (user.parentalControlsEnabled && user.ageRestriction) {
                      const recAgeRestriction = v.ageRestriction || 18;
                      return user.ageRestriction >= recAgeRestriction && v.id !== id && v.status === 'Approved';
                    }
                    return v.id !== id && v.status === 'Approved';
                  });
                setAiRecommendations(recommended);
              }).catch(() => {
                // Silently fail for AI recommendations
              });
            }).catch(() => {
              // Silently fail for AI recommendations
            }).finally(() => {
              setAiRecommendationsLoading(false);
            });
          } else {
            setAiRecommendationsLoading(false);
          }
        }).catch(() => {
          setAiRecommendationsLoading(false);
        });
      }

      // Fetch AI content only if not already present
      if (!video.summary) {
        summarizeContent({ videoTitle: video.title, videoDescription: video.description })
          .then(res => {
            updateDoc(videoRef, { summary: res.summary });
          }).catch((error) => {
            console.error("AI summary generation failed:", error);
            // Silently fail for AI features
          });
      }

      if (!video.tags || video.tags.length === 0) {
        generateTags({ videoTitle: video.title, videoDescription: video.description })
          .then(res => {
              updateDoc(videoRef, { tags: res.tags });
          }).catch((error) => {
            console.error("AI tag generation failed:", error);
            // Silently fail for AI features
          });
      }
    }
  }, [video, firestore, user, videoRef, id, toast, router]);

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

  if (videoError || !video) {
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

    // Check if user is suspended
    if (user.status === 'Inactive') {
      toast({
        variant: 'destructive',
        title: 'Account suspended',
        description: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    // Check parental controls for certain interactions
    if (user.parentalControlsEnabled && ['likes', 'dislikes', 'watch-later'].includes(collectionName)) {
      const videoAgeRestriction = currentVideo.ageRestriction || 18;
      if (user.ageRestriction && user.ageRestriction < videoAgeRestriction) {
        toast({
          variant: 'destructive',
          title: 'Content restricted',
          description: 'This content is not available with your current parental control settings.',
        });
        return;
      }
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
          description: `Could not complete the action. Please try again.`,
        });
      });
  };

  const handleLike = () => {
    if (userRating === 'like') {
      setUserRating(null);
      // Remove like from database
    } else {
      setUserRating('like');
      handleInteraction('likes', 'Video Liked', `You liked "${currentVideo.title}".`);
    }
  };

  const handleDislike = () => {
    if (userRating === 'dislike') {
      setUserRating(null);
      // Remove dislike from database
    } else {
      setUserRating('dislike');
      handleInteraction('dislikes', 'Video Disliked', `You disliked "${currentVideo.title}".`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = currentVideo.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Video link has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Unable to copy link to clipboard.',
      });
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to report content.',
      });
      return;
    }

    // Check if user is suspended
    if (user.status === 'Inactive') {
      toast({
        variant: 'destructive',
        title: 'Account suspended',
        description: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    try {
      const reportData = {
        videoId: currentVideo.id,
        videoTitle: currentVideo.title,
        reportedBy: user.uid,
        reportedByName: user.name,
        reason: 'Inappropriate content', // Could be expanded with a modal for different reasons
        status: 'Open',
        reportedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      const reportsRef = collection(firestore, 'reports');
      await addDoc(reportsRef, reportData);

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe. We will review this content.',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: 'destructive',
        title: 'Report failed',
        description: 'Unable to submit report. Please try again.',
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to comment.',
      });
      return;
    }

    // Check if user is suspended
    if (user.status === 'Inactive') {
      toast({
        variant: 'destructive',
        title: 'Account suspended',
        description: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Comment required',
        description: 'Please enter a comment before submitting.',
      });
      return;
    }

    // Check comment length
    if (commentText.trim().length > 1000) {
      toast({
        variant: 'destructive',
        title: 'Comment too long',
        description: 'Comments must be 1000 characters or less.',
      });
      return;
    }

    try {
      const commentData = {
        text: commentText.trim(),
        userId: user.uid,
        userName: user.name,
        userAvatar: user.avatarUrl,
        createdAt: new Date().toISOString(),
        videoId: video.id,
        moderated: false,
        likes: 0,
      };

      const commentsRef = collection(firestore, 'videos', video.id, 'comments');
      await addDoc(commentsRef, commentData);

      setCommentText('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: 'destructive',
        title: 'Comment failed',
        description: 'Unable to post comment. Please try again.',
      });
    }
  };

  return (
    <>
      <Head>
        <title>{currentVideo.title} - Watch</title>
        <meta name="description" content={currentVideo.summary || currentVideo.description || 'Watch this video'} />
        <meta property="og:title" content={currentVideo.title} />
        <meta property="og:description" content={currentVideo.summary || currentVideo.description || 'Watch this video'} />
        <meta property="og:image" content={currentVideo.thumbnailUrl} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/watch/${id}`} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentVideo.title} />
        <meta name="twitter:description" content={currentVideo.summary || currentVideo.description || 'Watch this video'} />
        <meta name="twitter:image" content={currentVideo.thumbnailUrl} />
      </Head>
      <div className="container mx-auto max-w-7xl px-0 py-0 animate-fade-in">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <VideoPlayer video={currentVideo} enableAnalytics={true} />
            <div className="mt-4">
              <h1 className="text-3xl font-headline font-bold">{currentVideo.title}</h1>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentVideo.channelAvatarUrl} alt={currentVideo.channel} />
                    <AvatarFallback>{currentVideo.channel?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{currentVideo.channel || 'Unknown Channel'}</p>
                    <p className="text-sm text-muted-foreground">2.3M subscribers</p>
                  </div>
                </div>
                <Button variant="outline" className="flex-shrink-0" aria-label="Subscribe to channel">
                  <Bell className="mr-2 h-4 w-4" /> Subscribed
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant={userRating === 'like' ? 'default' : 'secondary'}
                    onClick={handleLike}
                    aria-label="Like video"
                    className={userRating === 'like' ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" /> {Math.floor(Math.random() * 1000)}K
                  </Button>
                  <Button
                    variant={userRating === 'dislike' ? 'default' : 'secondary'}
                    onClick={handleDislike}
                    aria-label="Dislike video"
                    className={userRating === 'dislike' ? 'bg-gray-500 hover:bg-gray-600' : ''}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" onClick={handleShare} aria-label="Share video">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button variant="secondary" onClick={handleReport} aria-label="Report video">
                    <Flag className="mr-2 h-4 w-4" /> Report
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleInteraction('downloads', 'Video Downloaded', `You can now watch "${currentVideo.title}" offline.`)}
                    aria-label="Download video"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
              <Card className="mt-6 animate-fade-in-up" data-ai-hint="content summarization">
                <CardContent className="p-4">
                  <p className="font-semibold">{currentVideo.views?.toLocaleString() || '0'} views • {currentVideo.duration} • {formatDistanceToNow(new Date(currentVideo.uploadedAt || Date.now()), { addSuffix: true })}</p>
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
                {user ? (
                  <div className="flex gap-4">
                    <Avatar>
                        <AvatarImage src={user?.avatarUrl!} alt={user?.name!} data-ai-hint="person portrait"/>
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <Input
                        placeholder="Add a comment..."
                        aria-label="Add a public comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        maxLength={1000}
                      />
                       <div className="mt-2 flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">
                           {commentText.length}/1000
                         </span>
                         <Button onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                           Comment
                         </Button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-2">Please log in to comment</p>
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
                 {/* Comments section */}
              </div>
            </div>
          </div>
          <div className="w-full space-y-4 lg:w-1/3 animate-fade-in" data-ai-hint="content recommendation engine" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl font-headline font-bold">Recommended for You</h2>
              {aiRecommendationsLoading ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">AI is personalizing recommendations...</div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-24 w-40" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : aiRecommendations.length > 0 ? (
                aiRecommendations.map((recVideo, index) => (
                  <div key={recVideo.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <VideoCard video={recVideo} variant="horizontal" />
                  </div>
                ))
              ) : (recommendedVideos && recommendedVideos.length > 0) ? (
                <>
                  <div className="text-sm text-muted-foreground">More videos you might like:</div>
                  {recommendedVideos.map((recVideo, index) => (
                    <div key={recVideo.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <VideoCard video={recVideo as Video} variant="horizontal" />
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No recommendations available</div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <WatchPageContent id={id} />
    </Suspense>
  );
}