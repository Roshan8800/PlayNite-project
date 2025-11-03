'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Filter, Search } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import { fetchVideosPaginated } from '@/lib/videos';
import { useVideoFilters } from '@/hooks/use-video-filters';
import { VideoFilters } from '@/components/video-filters';
import dynamic from 'next/dynamic';
import type { Video } from '@/lib/types';

// Dynamic imports for performance
const VideoCard = dynamic(() => import('@/components/video-card').then(mod => ({ default: mod.VideoCard })), {
  loading: () => <Skeleton className="h-40 w-full" />,
  ssr: false,
});
import { Skeleton } from '@/components/ui/skeleton';

export default function AdvancedSearchPage() {
  const videoFilters = useVideoFilters({ syncWithUrl: true });

  const [videos, setVideos] = useState<Video[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const pagination = usePagination({
    initialPageSize: 20,
    totalItems,
    syncWithUrl: true,
  });

  // Available options for filters
  const availableCategories = ['Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News', 'Technology', 'Comedy'];
  const availableTags = ['HD', '4K', 'Live', 'Trending', 'New', 'Popular', 'Educational', 'Funny', 'Music Video', 'Tutorial'];
  const availablePornstars = ['Pornstar1', 'Pornstar2', 'Pornstar3']; // This should be fetched from API in production

  const performSearch = useCallback(async () => {
    setLoading(true);

    try {
      // Build filters for paginated search
      const searchFilters: any = {
        status: 'Approved',
        sortBy: videoFilters.filters.sortBy === 'date' ? 'uploadedAt' : videoFilters.filters.sortBy === 'views' ? 'views' : 'views',
        sortOrder: 'desc',
      };

      // Apply filters
      if (videoFilters.filters.category) {
        searchFilters.category = videoFilters.filters.category;
      }

      if (videoFilters.filters.categories.length > 0) {
        searchFilters.categories = videoFilters.filters.categories;
      }

      if (videoFilters.filters.tags.length > 0) {
        searchFilters.tags = videoFilters.filters.tags;
      }

      if (videoFilters.filters.pornstars.length > 0) {
        searchFilters.pornstars = videoFilters.filters.pornstars;
      }

      // Apply duration filter
      if (videoFilters.filters.duration) {
        if (videoFilters.filters.duration === 'short') {
          searchFilters.maxDuration = 240; // 4 minutes
        } else if (videoFilters.filters.duration === 'medium') {
          searchFilters.minDuration = 240; // 4 minutes
          searchFilters.maxDuration = 1200; // 20 minutes
        } else if (videoFilters.filters.duration === 'long') {
          searchFilters.minDuration = 1200; // 20 minutes
        }
      }

      // Apply views filter
      if (videoFilters.filters.minViews > 0) {
        searchFilters.minViews = videoFilters.filters.minViews;
      }
      if (videoFilters.filters.maxViews < 1000000) {
        searchFilters.maxViews = videoFilters.filters.maxViews;
      }

      // Apply date filters
      if (videoFilters.filters.uploadedAfter) {
        searchFilters.uploadedAfter = videoFilters.filters.uploadedAfter.toISOString();
      }
      if (videoFilters.filters.uploadedBefore) {
        searchFilters.uploadedBefore = videoFilters.filters.uploadedBefore.toISOString();
      }

      const { videos: searchResults, pagination: paginationInfo } = await fetchVideosPaginated(
        pagination.currentPage,
        pagination.pageSize,
        searchFilters
      );

      setVideos(searchResults as Video[]);
      setTotalItems(paginationInfo.totalItems);
    } catch (error) {
      console.error('Search error:', error);
      setVideos([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [videoFilters.filters, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Advanced Search</h1>
          <p className="text-muted-foreground mt-1">
            Find exactly what you're looking for with powerful filters and search options.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {videoFilters.activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {videoFilters.activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for videos..."
                value={videoFilters.filters.query}
                onChange={(e) => videoFilters.updateFilters({ ...videoFilters.filters, query: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>
            <Button onClick={performSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <VideoFilters
              filters={videoFilters.filters}
              onFiltersChange={videoFilters.updateFilters}
              availableCategories={availableCategories}
              availableTags={availableTags}
              availablePornstars={availablePornstars}
              loading={loading}
            />
          </div>
        )}

        {/* Results */}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Search Results {videos.length > 0 && `(${videos.length})`}
            </h2>
          </div>

          {loading && videos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
}