'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VideoCard } from '@/components/video-card';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const firestore = useFirestore();
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!queryParam) {
        setFilteredVideos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const videosRef = collection(firestore, 'videos');
        // Firestore doesn't support full-text search natively.
        // This is a basic "starts with" search.
        // For a real app, a third-party search service like Algolia or Typesense is recommended.
        const titleQuery = query(
          videosRef,
          where('title', '>=', queryParam),
          where('title', '<=', queryParam + '\uf8ff')
        );
        const snapshot = await getDocs(titleQuery);
        const videos = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as Video)
        );
        setFilteredVideos(videos.filter(v => v.status === 'Approved'));
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [queryParam, firestore]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Search Results
        </h1>
        {queryParam ? (
          <p className="mt-2 text-lg text-muted-foreground">
            Showing results for &quot;{queryParam}&quot;
          </p>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">
            Please enter a search term to see results.
          </p>
        )}
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find any videos matching your search. Try another
            term.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
