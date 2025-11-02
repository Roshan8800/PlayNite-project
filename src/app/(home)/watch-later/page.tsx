'use client';

import { VideoCard } from '@/components/video-card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

export default function WatchLaterPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const watchLaterCollectionRef = useMemo(
    () => (user ? collection(firestore, 'users', user.uid, 'watchLater') : null),
    [firestore, user]
  );
  
  const { data: watchLaterVideos, loading, error } = useCollection(watchLaterCollectionRef);

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

   if (watchLaterVideos?.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
         <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
         <h3 className="mt-4 text-lg font-semibold">Your Watch Later List is Empty</h3>
         <p className="mb-4 mt-2 text-sm text-muted-foreground">
           Click the "Add to Watch Later" button on a video to save it here.
         </p>
       </div>
     )
   }

   return (
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
       {watchLaterVideos?.map((video: any, index) => (
         <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
           <VideoCard video={video} />
         </div>
       ))}
     </div>
   )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Watch Later
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your saved videos for future viewing.
        </p>
      </header>

      {renderContent()}
    </div>
  );
}
