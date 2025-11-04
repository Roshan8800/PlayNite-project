'use client';

import React from 'react';
import { Toast, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  ApplicationError,
  getUserFriendlyMessage,
  isRetryableError,
  ErrorSeverity
} from '@/lib/errors';

interface ErrorToastProps {
  error: ApplicationError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  autoHide?: boolean;
  duration?: number;
}

export function ErrorToast({
  error,
  onRetry,
  onDismiss,
  showRetry = true,
  autoHide = true,
  duration = 5000
}: ErrorToastProps) {
  const userMessage = getUserFriendlyMessage(error);
  const canRetry = isRetryableError(error) && onRetry && showRetry;

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-5 w-5" />;
      case 'authentication':
      case 'authorization':
        return <AlertCircle className="h-5 w-5" />;
      case 'validation':
        return <Info className="h-5 w-5" />;
      case 'video_load':
      case 'video_playback':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'destructive';
      case ErrorSeverity.LOW:
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Toast
      variant={getVariant()}
      duration={autoHide ? duration : undefined}
      className="max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <ToastTitle className="text-sm font-semibold">
            {error.type === 'network' ? 'Connection Error' :
             error.type === 'authentication' ? 'Authentication Required' :
             error.type === 'authorization' ? 'Access Denied' :
             error.type === 'validation' ? 'Invalid Input' :
             error.type === 'video_load' ? 'Video Load Error' :
             error.type === 'video_playback' ? 'Playback Error' :
             'Error'}
          </ToastTitle>
          <ToastDescription className="text-sm mt-1">
            {userMessage}
          </ToastDescription>
          {error.context?.action && (
            <p className="text-xs text-muted-foreground mt-1">
              Action: {error.context.action}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {canRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Toast>
  );
}

// Hook for managing error toasts
import { useToast } from '@/hooks/use-toast';

export function useErrorToast() {
  const { toast } = useToast();

  const showErrorToast = (
    error: ApplicationError,
    options: {
      onRetry?: () => void;
      showRetry?: boolean;
      autoHide?: boolean;
      duration?: number;
    } = {}
  ) => {
    const { onRetry, showRetry = true, autoHide = true, duration = 5000 } = options;

    toast({
      duration: autoHide ? duration : undefined,
      children: (
        <ErrorToast
          error={error}
          onRetry={onRetry}
          onDismiss={() => {}}
          showRetry={showRetry}
          autoHide={autoHide}
          duration={duration}
        />
      ),
    });
  };

  return { showErrorToast };
}