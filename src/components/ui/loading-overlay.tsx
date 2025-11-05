'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  backdropClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  spinnerSize = 'md',
  backdropClassName,
  contentClassName,
  children
}: LoadingOverlayProps) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        backdropClassName
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center space-y-4 rounded-lg bg-background p-6 shadow-lg',
          contentClassName
        )}
      >
        <Loader2 className={cn('animate-spin text-primary', spinnerSizes[spinnerSize])} />
        {message && (
          <p className="text-center text-sm text-muted-foreground">{message}</p>
        )}
        {children}
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  isLoading: boolean;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function InlineLoading({
  isLoading,
  message,
  spinnerSize = 'sm',
  className,
  children
}: InlineLoadingProps) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', spinnerSizes[spinnerSize])} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingState({
  loading,
  error,
  loadingComponent,
  errorComponent,
  children
}: LoadingStateProps) {
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-2">Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}