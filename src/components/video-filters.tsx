'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

export interface VideoFiltersState {
  query: string;
  category: string;
  categories: string[];
  tags: string[];
  pornstars: string[];
  duration: string;
  quality: string;
  uploadedAfter: Date | undefined;
  uploadedBefore: Date | undefined;
  minViews: number;
  maxViews: number;
  sortBy: string;
}

interface VideoFiltersProps {
  filters: VideoFiltersState;
  onFiltersChange: (filters: VideoFiltersState) => void;
  availableCategories?: string[];
  availableTags?: string[];
  availablePornstars?: string[];
  loading?: boolean;
}

export function VideoFilters({
  filters,
  onFiltersChange,
  availableCategories = [],
  availableTags = [],
  availablePornstars = [],
  loading = false,
}: VideoFiltersProps) {
  const handleFilterChange = (key: keyof VideoFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      handleFilterChange('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleFilterChange('tags', filters.tags.filter(t => t !== tag));
  };

  const addCategory = (category: string) => {
    if (!filters.categories.includes(category)) {
      handleFilterChange('categories', [...filters.categories, category]);
    }
  };

  const removeCategory = (category: string) => {
    handleFilterChange('categories', filters.categories.filter(c => c !== category));
  };

  const addPornstar = (pornstar: string) => {
    if (!filters.pornstars.includes(pornstar)) {
      handleFilterChange('pornstars', [...filters.pornstars, pornstar]);
    }
  };

  const removePornstar = (pornstar: string) => {
    handleFilterChange('pornstars', filters.pornstars.filter(p => p !== pornstar));
  };

  const clearFilters = () => {
    onFiltersChange({
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
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'query' || key === 'sortBy') return count;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && value !== '' && value !== 0 && value !== 1000000) return count + 1;
    return count;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Refine your search results</CardDescription>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label>Search Query</Label>
          <Input
            placeholder="Search for videos..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Categories */}
        <MultiSelectFilter
          label="Categories"
          options={availableCategories}
          selected={filters.categories}
          onChange={(selected) => handleFilterChange('categories', selected)}
          placeholder="Select categories..."
        />

        {/* Tags */}
        <MultiSelectFilter
          label="Tags"
          options={availableTags}
          selected={filters.tags}
          onChange={(selected) => handleFilterChange('tags', selected)}
          placeholder="Select tags..."
        />

        {/* Pornstars */}
        <MultiSelectFilter
          label="Pornstars"
          options={availablePornstars}
          selected={filters.pornstars}
          onChange={(selected) => handleFilterChange('pornstars', selected)}
          placeholder="Select pornstars..."
        />

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select
            value={filters.duration}
            onValueChange={(value) => handleFilterChange('duration', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any duration</SelectItem>
              <SelectItem value="short">Short {'<'} 4 minutes</SelectItem>
              <SelectItem value="medium">Medium (4-20 minutes)</SelectItem>
              <SelectItem value="long">Long {'>'} 20 minutes</SelectItem>
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
              disabled={loading}
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
                <Button variant="outline" className="justify-start text-left font-normal" disabled={loading}>
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
                <Button variant="outline" className="justify-start text-left font-normal" disabled={loading}>
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

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="date">Most Recent</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}