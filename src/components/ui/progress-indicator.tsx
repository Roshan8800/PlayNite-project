'use client';

import React from 'react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2, Upload, Download } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  status?: 'idle' | 'uploading' | 'downloading' | 'completed' | 'error';
  message?: string;
  showPercentage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressIndicator({
  progress,
  status = 'idle',
  message,
  showPercentage = true,
  className,
  size = 'md'
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" />;
      case 'downloading':
        return <Download className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        )}
      </div>
      <Progress
        value={progress}
        className={cn(sizeClasses[size], getStatusColor())}
      />
    </div>
  );
}

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  className?: string;
}

export function UploadProgress({
  fileName,
  progress,
  status,
  error,
  className
}: UploadProgressProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'uploading' && <Upload className="h-4 w-4 animate-pulse" />}
          {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
          <span className="text-sm font-medium truncate max-w-xs">{fileName}</span>
        </div>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface DownloadProgressProps {
  fileName: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  speed?: string; // e.g., "2.5 MB/s"
  remainingTime?: string; // e.g., "2m 30s"
  className?: string;
}

export function DownloadProgress({
  fileName,
  progress,
  status,
  speed,
  remainingTime,
  className
}: DownloadProgressProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'downloading' && <Download className="h-4 w-4 animate-pulse" />}
          {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
          <span className="text-sm font-medium truncate max-w-xs">{fileName}</span>
        </div>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      {(speed || remainingTime) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {speed && <span>{speed}</span>}
          {remainingTime && <span>{remainingTime} remaining</span>}
        </div>
      )}
    </div>
  );
}

interface BulkProgressProps {
  total: number;
  completed: number;
  failed: number;
  currentFile?: string;
  className?: string;
}

export function BulkProgress({
  total,
  completed,
  failed,
  currentFile,
  className
}: BulkProgressProps) {
  const progress = total > 0 ? ((completed + failed) / total) * 100 : 0;

  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            Processing files ({completed + failed}/{total})
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      {currentFile && (
        <p className="text-xs text-muted-foreground truncate">
          Current: {currentFile}
        </p>
      )}

      <div className="flex justify-between text-xs">
        <span className="text-green-600">✓ {completed} completed</span>
        {failed > 0 && <span className="text-red-600">✗ {failed} failed</span>}
      </div>
    </div>
  );
}