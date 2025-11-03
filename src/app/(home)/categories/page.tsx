'use client';

import { useState, useEffect } from 'react';
import { CategoryCard } from '@/components/category-card';
import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Grid, List } from 'lucide-react';
import { categories } from '@/lib/data';
import { usePagination } from '@/hooks/use-pagination';
import { fetchVideosPaginated } from '@/lib/videos';
import { useVideoFilters } from '@/hooks/use-video-filters';
import { VideoFilters } from '@/components/video-filters';
import type { Video } from '@/lib/types';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'videos'>('categories');

  const pagination = usePagination({
    initialPageSize: 20,
    totalItems,
    syncWithUrl: true,
  });

  const videoFilters = useVideoFilters({
    syncWithUrl: true,
    defaultFilters: {
      sortBy: 'relevance',
    },
  });

  // Available options for filters
  const availableCategories = categories.map(cat => cat.name);
  const availableTags = ['HD', '4K', 'Live', 'Trending', 'New', 'Popular', 'Educational', 'Funny', 'Music Video', 'Tutorial'];
  const availablePornstars = ['Pornstar1', 'Pornstar2', 'Pornstar3']; // This should be fetched from API in production

  useEffect(() => {
    if (selectedCategory && viewMode === 'videos') {
      const fetchCategoryVideos = async () => {
        setLoading(true);
        try {
          const filters: any = {
            status: 'Approved',
            category: selectedCategory,
            sortBy: videoFilters.filters.sortBy === 'date' ? 'uploadedAt' : videoFilters.filters.sortBy === 'views' ? 'views' : 'views',
            sortOrder: 'desc',
          };

          // Apply additional filters
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

          setVideos(searchResults as Video[]);
          setTotalItems(paginationInfo.totalItems);
        } catch (error) {
          console.error('Error fetching category videos:', error);
          setVideos([]);
          setTotalItems(0);
        } finally {
          setLoading(false);
        }
      };
      fetchCategoryVideos();
    }
  }, [selectedCategory, viewMode, videoFilters.filters, pagination.currentPage, pagination.pageSize]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setViewMode('videos');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode('categories');
    setVideos([]);
    setTotalItems(0);
  };

  if (viewMode === 'videos' && selectedCategory) {
    return (
      <div className="space-y-8 animate-fade-in">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToCategories}>
              ← Back to Categories
            </Button>
            <div>
              <h1 className="text-4xl font-headline font-bold tracking-tight">
                {selectedCategory}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Explore videos in the {selectedCategory} category.
              </p>
            </div>
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
        </header>

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

          {/* Videos */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
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
            ) : videos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No videos found</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters to find videos in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          All Categories
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore videos across all our available categories.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleCategoryClick(category.name)}
          >
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}
