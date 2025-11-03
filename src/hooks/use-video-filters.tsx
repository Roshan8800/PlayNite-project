'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VideoFiltersState } from '@/components/video-filters';

interface UseVideoFiltersOptions {
  syncWithUrl?: boolean;
  defaultFilters?: Partial<VideoFiltersState>;
}

export function useVideoFilters(options: UseVideoFiltersOptions = {}) {
  const { syncWithUrl = true, defaultFilters = {} } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = useCallback((): VideoFiltersState => {
    const initialFilters: VideoFiltersState = {
      query: '',
      category: '',
      categories: [],
      tags: [],
      pornstars: [],
      duration: '',
      quality: '',
      uploadedAfter: undefined,
      uploadedBefore: undefined,
      minViews: 0,
      maxViews: 1000000,
      sortBy: 'relevance',
      ...defaultFilters,
    };

    if (syncWithUrl) {
      // Parse URL parameters
      const query = searchParams.get('q') || '';
      const category = searchParams.get('category') || '';
      const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
      const pornstars = searchParams.get('pornstars')?.split(',').filter(Boolean) || [];
      const duration = searchParams.get('duration') || '';
      const quality = searchParams.get('quality') || '';
      const uploadedAfter = searchParams.get('uploadedAfter')
        ? new Date(searchParams.get('uploadedAfter')!)
        : undefined;
      const uploadedBefore = searchParams.get('uploadedBefore')
        ? new Date(searchParams.get('uploadedBefore')!)
        : undefined;
      const minViews = parseInt(searchParams.get('minViews') || '0');
      const maxViews = parseInt(searchParams.get('maxViews') || '1000000');
      const sortBy = searchParams.get('sortBy') || 'relevance';

      return {
        ...initialFilters,
        query,
        category,
        categories,
        tags,
        pornstars,
        duration,
        quality,
        uploadedAfter,
        uploadedBefore,
        minViews,
        maxViews,
        sortBy,
      };
    }

    return initialFilters;
  }, [searchParams, defaultFilters, syncWithUrl]);

  const [filters, setFilters] = useState<VideoFiltersState>(getInitialFilters);

  // Update filters when URL changes
  useEffect(() => {
    if (syncWithUrl) {
      setFilters(getInitialFilters());
    }
  }, [getInitialFilters, syncWithUrl]);

  const updateFilters = useCallback((newFilters: VideoFiltersState) => {
    setFilters(newFilters);

    if (syncWithUrl) {
      const params = new URLSearchParams();

      // Add non-empty filters to URL
      if (newFilters.query) params.set('q', newFilters.query);
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','));
      if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
      if (newFilters.pornstars.length > 0) params.set('pornstars', newFilters.pornstars.join(','));
      if (newFilters.duration) params.set('duration', newFilters.duration);
      if (newFilters.quality) params.set('quality', newFilters.quality);
      if (newFilters.uploadedAfter) params.set('uploadedAfter', newFilters.uploadedAfter.toISOString());
      if (newFilters.uploadedBefore) params.set('uploadedBefore', newFilters.uploadedBefore.toISOString());
      if (newFilters.minViews > 0) params.set('minViews', newFilters.minViews.toString());
      if (newFilters.maxViews < 1000000) params.set('maxViews', newFilters.maxViews.toString());
      if (newFilters.sortBy !== 'relevance') params.set('sortBy', newFilters.sortBy);

      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.replace(newUrl, { scroll: false });
    }
  }, [router, syncWithUrl]);

  const clearFilters = useCallback(() => {
    const clearedFilters: VideoFiltersState = {
      query: '',
      category: '',
      categories: [],
      tags: [],
      pornstars: [],
      duration: '',
      quality: '',
      uploadedAfter: undefined,
      uploadedBefore: undefined,
      minViews: 0,
      maxViews: 1000000,
      sortBy: 'relevance',
      ...defaultFilters,
    };
    updateFilters(clearedFilters);
  }, [updateFilters, defaultFilters]);

  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'query' || key === 'sortBy') return false;
      if (Array.isArray(value) && value.length > 0) return true;
      if (value && value !== '' && value !== 0 && value !== 1000000) return true;
      return false;
    });
  }, [filters]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'query' || key === 'sortBy') return count;
      if (Array.isArray(value) && value.length > 0) return count + 1;
      if (value && value !== '' && value !== 0 && value !== 1000000) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount(),
  };
}