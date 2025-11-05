'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150); // Half of the transition duration

    return () => clearTimeout(timer);
  }, [pathname, searchParams, children]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0',
        className
      )}
    >
      {displayChildren}
    </div>
  );
}

export function PageLoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function RouteLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for Next.js router events
    window.addEventListener('beforeunload', handleStart);
    // For programmatic navigation, we can use a custom event
    window.addEventListener('navigationStart', handleStart);
    window.addEventListener('navigationComplete', handleComplete);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('navigationStart', handleStart);
      window.removeEventListener('navigationComplete', handleComplete);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-primary animate-pulse" style={{ width: '100%' }} />
    </div>
  );
}