'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ApplicationError,
  ErrorBoundaryState,
  ErrorRecoveryOptions,
  getUserFriendlyMessage,
  isRetryableError,
  createErrorFromUnknown
} from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: ApplicationError, errorInfo: ErrorInfo) => void;
  recoveryOptions?: ErrorRecoveryOptions;
  showDetails?: boolean;
  maxRetries?: number;
}

interface State extends ErrorBoundaryState {
  retryCount: number;
  isRetrying: boolean;
  recoveryAttempted: boolean;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private router: any;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      recoveryAttempted: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const appError = createErrorFromUnknown(error, { component: 'ErrorBoundary' });
    return {
      hasError: true,
      error: appError,
      errorId,
      errorInfo: { componentStack: error.stack || '' }
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = createErrorFromUnknown(error, {
      component: 'ErrorBoundary',
      ...errorInfo
    });

    console.error('Uncaught error:', appError, errorInfo);

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(appError, errorInfo);
    }

    this.setState(prevState => ({
      error: appError,
      errorInfo,
      retryCount: prevState.retryCount,
      isRetrying: false,
      recoveryAttempted: false,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, send to error tracking service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Send to error tracking service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Silently fail if error reporting fails
    });
  };

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState(prevState => ({
      isRetrying: true,
      retryCount: prevState.retryCount + 1
    }));

    // Attempt recovery with delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: undefined,
        errorId: '',
        isRetrying: false,
        recoveryAttempted: true
      });
    }, 1000);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/home';
  };

  private handleReportBug = () => {
    const errorId = this.state.errorId;
    const subject = `Bug Report: ${errorId}`;
    const body = `Error ID: ${errorId}\n\nPlease describe what you were doing when this error occurred:\n\n`;
    window.open(`mailto:support@playnite.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const isRetryable = isRetryableError(error);
      const userMessage = getUserFriendlyMessage(error);
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = isRetryable && this.state.retryCount < maxRetries;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {error.type === 'network' ? (
                  <WifiOff className="h-12 w-12 text-destructive" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl font-bold">
                {this.state.isRetrying ? 'Retrying...' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {userMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Please try the options below or contact support if the problem persists.</p>
                {this.state.errorId && (
                  <p className="mt-2 text-xs">
                    Error ID: <code className="bg-muted px-1 py-0.5 rounded">{this.state.errorId}</code>
                  </p>
                )}
                {this.state.retryCount > 0 && (
                  <p className="mt-2 text-xs text-orange-600">
                    Retry attempts: {this.state.retryCount}/{maxRetries}
                  </p>
                )}
                {(this.props.showDetails !== false && process.env.NODE_ENV === 'development') && (
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
                )}
                <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button onClick={this.handleReportBug} variant="outline" className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Report Bug
                </Button>
              </div>
              {this.props.recoveryOptions?.actions && (
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-1 gap-2">
                    {this.props.recoveryOptions.actions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.action}
                        variant={action.primary ? "default" : "outline"}
                        className="w-full"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}