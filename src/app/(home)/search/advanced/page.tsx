'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Video } from '@/lib/types';

// Dynamic imports for performance
const VideoCard = dynamic(() => import('@/components/video-card').then(mod => ({ default: mod.VideoCard })), {
  loading: () => <Skeleton className="h-40 w-full" />,
  ssr: false,
});
import { Skeleton } from '@/components/ui/skeleton';

interface SearchFilters {
  query: string;
  category: string;
  duration: string;
  quality: string;
  uploadedAfter: Date | undefined;
  uploadedBefore: Date | undefined;
  minViews: number;
  maxViews: number;
  sortBy: string;
  tags: string[];
}

export default function AdvancedSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    duration: searchParams.get('duration') || '',
    quality: searchParams.get('quality') || '',
    uploadedAfter: searchParams.get('uploadedAfter') ? new Date(searchParams.get('uploadedAfter')!) : undefined,
    uploadedBefore: searchParams.get('uploadedBefore') ? new Date(searchParams.get('uploadedBefore')!) : undefined,
    minViews: parseInt(searchParams.get('minViews') || '0'),
    maxViews: parseInt(searchParams.get('maxViews') || '1000000'),
    sortBy: searchParams.get('sortBy') || 'relevance',
    tags: searchParams.get('tags')?.split(',') || [],
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Available categories and tags
  const categories = ['Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News', 'Technology', 'Comedy'];
  const availableTags = ['HD', '4K', 'Live', 'Trending', 'New', 'Popular', 'Educational', 'Funny', 'Music Video', 'Tutorial'];

  const buildSearchQuery = useCallback(() => {
    const constraints = [];

    // Text search (basic implementation - in production, use Algolia or similar)
    if (filters.query) {
      // This is a simplified approach - real implementation would use full-text search
      constraints.push(where('title', '>=', filters.query));
      constraints.push(where('title', '<=', filters.query + '\uf8ff'));
    }

    // Category filter
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    // Duration filter
    if (filters.duration) {
      switch (filters.duration) {
        case 'short':
          constraints.push(where('duration', '<=', '00:04:00'));
          break;
        case 'medium':
          constraints.push(where('duration', '>=', '00:04:01'));
          constraints.push(where('duration', '<=', '00:20:00'));
          break;
        case 'long':
          constraints.push(where('duration', '>=', '00:20:01'));
          break;
      }
    }

    // Views filter
    if (filters.minViews > 0) {
      constraints.push(where('views', '>=', filters.minViews));
    }
    if (filters.maxViews < 1000000) {
      constraints.push(where('views', '<=', filters.maxViews));
    }

    // Date filters
    if (filters.uploadedAfter) {
      constraints.push(where('uploadedAt', '>=', filters.uploadedAfter.toISOString()));
    }
    if (filters.uploadedBefore) {
      constraints.push(where('uploadedBefore', '<=', filters.uploadedBefore.toISOString()));
    }

    // Status filter (only approved videos)
    constraints.push(where('status', '==', 'Approved'));

    return constraints;
  }, [filters]);

  const performSearch = useCallback(async (reset = false) => {
    setLoading(true);

    try {
      const constraints = buildSearchQuery();
      let searchQuery = query(collection(firestore, 'videos'), ...constraints);

      // Sorting
      switch (filters.sortBy) {
        case 'views':
          searchQuery = query(searchQuery, orderBy('views', 'desc'));
          break;
        case 'date':
          searchQuery = query(searchQuery, orderBy('uploadedAt', 'desc'));
          break;
        case 'relevance':
        default:
          searchQuery = query(searchQuery, orderBy('views', 'desc'));
          break;
      }

      if (!reset && lastDoc) {
        searchQuery = query(searchQuery, startAfter(lastDoc));
      } else {
        searchQuery = query(searchQuery, limit(20));
      }

      const snapshot = await getDocs(searchQuery);
      const newVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[];

      // Filter by tags (client-side since Firestore doesn't support array contains easily)
      let filteredVideos = newVideos;
      if (filters.tags.length > 0) {
        filteredVideos = newVideos.filter(video =>
          filters.tags.some(tag => video.tags?.includes(tag))
        );
      }

      setVideos(prev => reset ? filteredVideos : [...prev, ...filteredVideos]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, firestore, lastDoc, buildSearchQuery]);

  useEffect(() => {
    performSearch(true);
  }, [performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      duration: '',
      quality: '',
      uploadedAfter: undefined,
      uploadedBefore: undefined,
      minViews: 0,
      maxViews: 1000000,
      sortBy: 'relevance',
      tags: [],
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'query' || key === 'sortBy') return count;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && value !== '' && value !== 0 && value !== 1000000) return count + 1;
    return count;
  }, 0);

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
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for videos..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="text-lg"
              />
            </div>
            <Button onClick={() => performSearch(true)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Refine your search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={filters.duration} onValueChange={(value) => handleFilterChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any duration</SelectItem>
                      <SelectItem value="short">Short (< 4 minutes)</SelectItem>
                      <SelectItem value="medium">Medium (4-20 minutes)</SelectItem>
                      <SelectItem value="long">Long (> 20 minutes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Views Range */}
                <div className="space-y-2">
                  <Label>Views Range</Label>
                  <div className="px-2">
                    <Slider
                      value={[filters.minViews, filters.maxViews]}
                      onValueChange={([min, max]) => {
                        handleFilterChange('minViews', min);
                        handleFilterChange('maxViews', max);
                      }}
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{filters.minViews.toLocaleString()}</span>
                      <span>{filters.maxViews.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Upload Date */}
                <div className="space-y-2">
                  <Label>Upload Date</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.uploadedAfter ? format(filters.uploadedAfter, 'PPP') : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.uploadedAfter}
                          onSelect={(date) => handleFilterChange('uploadedAfter', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.uploadedBefore ? format(filters.uploadedBefore, 'PPP') : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.uploadedBefore}
                          onSelect={(date) => handleFilterChange('uploadedBefore', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="date">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
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

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => performSearch(false)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Results'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}