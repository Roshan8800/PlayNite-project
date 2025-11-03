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
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { fetchVideosPaginated } from '@/lib/videos';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const firestore = useFirestore();
  const { user } = useUser();
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest' | 'views'>('relevance');
  const [filterBy, setFilterBy] = useState<'all' | 'short' | 'long'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const pagination = usePagination({
    initialPageSize: 20,
    totalItems,
    syncWithUrl: true,
  });

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
        setTotalItems(0);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Build filters for paginated search
        const filters: any = {
          status: 'Approved',
          sortBy: sortBy === 'relevance' ? 'views' : sortBy === 'newest' ? 'uploadedAt' : sortBy === 'oldest' ? 'uploadedAt' : 'views',
          sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
        };

        // Add parental control filters if needed
        if (isRestrictedContent) {
          filters.ageRestriction = user.ageRestriction || 18;
        }

        // Add duration filter
        if (filterBy !== 'all') {
          if (filterBy === 'short') {
            filters.maxDuration = 300; // 5 minutes
          } else if (filterBy === 'long') {
            filters.minDuration = 1800; // 30 minutes
          }
        }

        // For text search, we'll use a simplified approach since Firestore doesn't support full-text search natively
        // In production, you'd want to use Algolia or similar service
        const { videos: searchResults, pagination: paginationInfo } = await fetchVideosPaginated(
          pagination.currentPage,
          pagination.pageSize,
          filters
        );

        // Client-side filtering for search query (simplified - in production use proper search service)
        let filtered = (searchResults as Video[]).filter(video =>
          video.title?.toLowerCase().includes(queryParam.toLowerCase()) ||
          video.description?.toLowerCase().includes(queryParam.toLowerCase()) ||
          video.tags?.some((tag: string) => tag.toLowerCase().includes(queryParam.toLowerCase()))
        );

        // Apply client-side sorting if needed
        filtered = applyFiltersAndSort(filtered);

        setFilteredVideos(filtered);
        setTotalItems(paginationInfo.totalItems);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results. Please try again.');
        setFilteredVideos([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [queryParam, firestore, sortBy, filterBy, user, isRestrictedContent, pagination.currentPage, pagination.pageSize]);

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
