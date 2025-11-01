'use client';

import { VideoCard } from '@/components/video-card';
import { Flame } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { type Video } from '@/lib/types';

export default function TrendingPage() {
  const firestore = useFirestore();
  const videosRef = collection(firestore, 'videos');

  const trendingQuery = query(
    videosRef,
    where('status', '==', 'Approved'),
    orderBy('views', 'desc'),
    limit(20)
  );

  const { data: trendingVideos, loading } = useCollection(trendingQuery);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Flame className="h-10 w-10 text-accent" />
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Trending Now
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            The most popular videos on PlayNite right now.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trendingVideos?.map((video) => (
            <VideoCard key={video.id} video={video as Video} />
          ))}
        </div>
      )}
    </div>
  );
}
