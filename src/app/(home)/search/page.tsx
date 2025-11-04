'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VideoCard } from '@/components/video-card';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { fetchVideosPaginated } from '@/lib/videos';
import { useVideoFilters } from '@/hooks/use-video-filters';
import { VideoFilters } from '@/components/video-filters';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const firestore = useFirestore();
  const { user } = useUser();
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const pagination = usePagination({
    initialPageSize: 20,
    totalItems,
    syncWithUrl: true,
  });

  // Initialize video filters with basic search query
  const videoFilters = useVideoFilters({
    syncWithUrl: true,
    defaultFilters: {
      query: queryParam,
      sortBy: 'relevance',
    },
  });

  // Available options for filters
  const availableCategories = ['Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News', 'Technology', 'Comedy'];
  const availableTags = ['HD', '4K', 'Live', 'Trending', 'New', 'Popular', 'Educational', 'Funny', 'Music Video', 'Tutorial'];
  const availablePornstars = ['Pornstar1', 'Pornstar2', 'Pornstar3']; // This should be fetched from API in production

  // Check parental controls and age restrictions
  const isRestrictedContent = user?.parentalControlsEnabled && user?.ageRestriction && user.ageRestriction < 18;

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      if (!videoFilters.filters.query) {
        if (isMounted) {
          setFilteredVideos([]);
          setTotalItems(0);
          setLoading(false);
          setError(null);
        }
        return;
      }
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        // Build filters for paginated search
        const filters: any = {
          status: 'Approved',
          sortBy: videoFilters.filters.sortBy === 'date' ? 'uploadedAt' : videoFilters.filters.sortBy === 'views' ? 'views' : 'views',
          sortOrder: 'desc',
          query: videoFilters.filters.query, // Pass query for server-side filtering
        };

        // Add parental control filters if needed
        if (isRestrictedContent) {
          filters.ageRestriction = user?.ageRestriction || 18;
        }

        // Apply category filter
        if (videoFilters.filters.category) {
          filters.category = videoFilters.filters.category;
        }

        if (videoFilters.filters.categories.length > 0) {
          filters.categories = videoFilters.filters.categories;
        }

        if (videoFilters.filters.tags.length > 0) {
          filters.tags = videoFilters.filters.tags;
        }

        if (videoFilters.filters.pornstars.length > 0) {
          filters.pornstars = videoFilters.filters.pornstars;
        }

        // Apply duration filter
        if (videoFilters.filters.duration) {
          if (videoFilters.filters.duration === 'short') {
            filters.maxDuration = 240; // 4 minutes
          } else if (videoFilters.filters.duration === 'medium') {
            filters.minDuration = 240; // 4 minutes
            filters.maxDuration = 1200; // 20 minutes
          } else if (videoFilters.filters.duration === 'long') {
            filters.minDuration = 1200; // 20 minutes
          }
        }

        // Apply views filter
        if (videoFilters.filters.minViews > 0) {
          filters.minViews = videoFilters.filters.minViews;
        }
        if (videoFilters.filters.maxViews < 1000000) {
          filters.maxViews = videoFilters.filters.maxViews;
        }

        // Apply date filters
        if (videoFilters.filters.uploadedAfter) {
          filters.uploadedAfter = videoFilters.filters.uploadedAfter.toISOString();
        }
        if (videoFilters.filters.uploadedBefore) {
          filters.uploadedBefore = videoFilters.filters.uploadedBefore.toISOString();
        }

        const { videos: searchResults, pagination: paginationInfo } = await fetchVideosPaginated(
          pagination.currentPage,
          pagination.pageSize,
          filters
        );

        if (isMounted) {
          setFilteredVideos(searchResults as Video[]);
          setTotalItems(paginationInfo.totalItems);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        if (isMounted) {
          setError('Failed to load search results. Please try again.');
          setFilteredVideos([]);
          setTotalItems(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [videoFilters.filters, user, isRestrictedContent, pagination.currentPage, pagination.pageSize]);

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
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredVideos.map((video, index) => (
              <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
          {totalItems > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.setPage}
                showPageSizeSelector={true}
                pageSize={pagination.pageSize}
                pageSizeOptions={pagination.pageSizeOptions}
                onPageSizeChange={pagination.setPageSize}
              />
            </div>
          )}
        </>
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
