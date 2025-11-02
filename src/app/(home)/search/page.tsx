'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VideoCard } from '@/components/video-card';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const firestore = useFirestore();
  const { user } = useUser();
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest' | 'views'>('relevance');
  const [filterBy, setFilterBy] = useState<'all' | 'short' | 'long'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Check parental controls and age restrictions
  const isRestrictedContent = user?.parentalControlsEnabled && user?.ageRestriction && user.ageRestriction < 18;

  const applyFiltersAndSort = (videos: Video[]): Video[] => {
    let filtered = videos;

    // Apply duration filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(video => {
        const duration = parseInt(video.duration || '0');
        if (filterBy === 'short') return duration < 300; // Less than 5 minutes
        if (filterBy === 'long') return duration > 1800; // More than 30 minutes
        return true;
      });
    }

    // Apply parental controls filter
    if (isRestrictedContent) {
      filtered = filtered.filter(video => {
        const videoAgeRestriction = video.ageRestriction || 18;
        return user.ageRestriction && user.ageRestriction >= videoAgeRestriction;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
        case 'oldest':
          return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'relevance':
        default:
          // For relevance, prioritize videos with higher ratings and more recent uploads
          const aScore = (a.rating || 0) * 0.7 + (new Date(a.uploadedAt || 0).getTime() / 1000000000) * 0.3;
          const bScore = (b.rating || 0) * 0.7 + (new Date(b.uploadedAt || 0).getTime() / 1000000000) * 0.3;
          return bScore - aScore;
      }
    });

    return filtered;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      if (!queryParam) {
        setFilteredVideos([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const videosRef = collection(firestore, 'videos');
        // Enhanced search: search in title, description, and tags
        const queries = [];

        // Base query conditions
        const baseConditions = [where('status', '==', 'Approved')];

        // Add parental control filters if needed
        if (isRestrictedContent) {
          baseConditions.push(where('ageRestriction', '<=', user.ageRestriction || 18));
        }

        // Title search
        queries.push(query(
          videosRef,
          ...baseConditions,
          where('title', '>=', queryParam.toLowerCase()),
          where('title', '<=', queryParam.toLowerCase() + '\uf8ff'),
          orderBy('title'),
          limit(50)
        ));

        // Description search (basic implementation)
        queries.push(query(
          videosRef,
          ...baseConditions,
          where('description', '>=', queryParam.toLowerCase()),
          where('description', '<=', queryParam.toLowerCase() + '\uf8ff'),
          orderBy('description'),
          limit(50)
        ));

        // Tags search if available
        if (queryParam.length > 2) {
          queries.push(query(
            videosRef,
            ...baseConditions,
            where('tags', 'array-contains', queryParam.toLowerCase()),
            limit(50)
          ));
        }

        const results = await Promise.all(queries.map(q => getDocs(q)));
        const allVideos = new Map<string, Video>();

        results.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            const video = { ...doc.data(), id: doc.id } as Video;
            allVideos.set(video.id, video);
          });
        });

        const videos = Array.from(allVideos.values());
        const filteredAndSorted = applyFiltersAndSort(videos);
        setFilteredVideos(filteredAndSorted);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results. Please try again.');
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [queryParam, firestore, sortBy, filterBy, user, isRestrictedContent]);

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
          {filteredVideos.map((video, index) => (
            <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <VideoCard video={video} />
            </div>
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
