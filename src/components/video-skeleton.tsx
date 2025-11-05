'use client';

import React from 'react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface VideoSkeletonProps {
  className?: string;
  showTitle?: boolean;
  showMetadata?: boolean;
}

export function VideoSkeleton({
  className,
  showTitle = true,
  showMetadata = true
}: VideoSkeletonProps) {
  return (
    <div className={cn('space-y-3 min-h-[280px]', className)}>
      {/* Video thumbnail skeleton - fixed aspect ratio to prevent shifts */}
      <div className="aspect-video w-full">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Title skeleton */}
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {/* Metadata skeleton */}
      {showMetadata && (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="space-y-1 flex-1 min-w-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      )}
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoSkeleton key={i} />
      ))}
    </div>
  );
}

export function VideoListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex space-x-4 min-h-[120px]">
          <div className="w-40 flex-shrink-0">
            <div className="aspect-video">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-2 mt-2">
              <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}