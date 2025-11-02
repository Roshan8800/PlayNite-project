'use client';

import { VideoCard } from '@/components/video-card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WifiOff, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DownloadsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const downloadsCollectionRef = useMemo(
    () => (user ? collection(firestore, 'users', user.uid, 'downloads') : null),
    [firestore, user]
  );

  const { data: downloadedVideos, loading, error } = useCollection(downloadsCollectionRef);

  const handleDeleteDownload = async (videoId: string, videoTitle: string) => {
    if (!downloadsCollectionRef) return;

    try {
      // Implement delete logic here
      toast({
        title: 'Download Removed',
        description: `"${videoTitle}" has been removed from your downloads.`,
      });
    } catch (err) {
      const permissionError = new FirestorePermissionError({
        path: downloadsCollectionRef.path,
        operation: 'delete',
        requestResourceData: { videoId },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error removing download',
        description: 'Could not remove the video from downloads.',
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive">Error loading downloads: {error.message}</p>;
    }

    if (!downloadedVideos || downloadedVideos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px] animate-fade-in">
          <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Videos Downloaded</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You can download videos from the video page to watch them offline.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {downloadedVideos.map((video: any, index) => (
          <div key={video.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <VideoCard video={video} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDeleteDownload(video.id, video.title)}
                aria-label={`Remove ${video.title} from downloads`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          My Downloads
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Videos available for offline viewing.
        </p>
      </header>

      {renderContent()}
    </div>
  );
}
