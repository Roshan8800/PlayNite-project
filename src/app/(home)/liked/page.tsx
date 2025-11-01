'use client';

import { VideoCard } from '@/components/video-card';
import { Heart } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LikedVideosPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const likesCollectionRef = useMemo(
    () => (user ? collection(firestore, 'users', user.uid, 'likes') : null),
    [firestore, user]
  );
  
  const { data: likedVideos, loading, error } = useCollection(likesCollectionRef);

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
      )
    }

    if (error) {
      return <p className="text-destructive">Error: {error.message}</p>
    }

    if (likedVideos?.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Liked Videos</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven't liked any videos yet.
          </p>
        </div>
      )
    }
    
    // In a real app, `likedVideos` would contain video IDs.
    // You'd then fetch the full video details for each ID.
    // For this example, we assume the full video data is stored in the 'likes' subcollection.
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {likedVideos?.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    )
  }


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Liked Videos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Videos you've given a thumbs up.
        </p>
      </header>
      
      {renderContent()}
    </div>
  );
}
