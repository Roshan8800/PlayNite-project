'use client';

import React from 'react';
import { Button, ButtonProps } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  loading = false,
  loadingText,
  spinnerSize = 'sm',
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <Loader2 className={cn('animate-spin mr-2', spinnerSizes[spinnerSize])} />
      )}
      {loading ? (loadingText || 'Loading...') : children}
    </Button>
  );
}