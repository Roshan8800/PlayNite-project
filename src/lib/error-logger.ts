// Error logging and monitoring service

import {
  ApplicationError,
  ErrorReportingService,
  ErrorLogEntry,
  ErrorType,
  ErrorSeverity
} from './errors';

export class ErrorLogger implements ErrorReportingService {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 1000;
  private reportingEndpoint?: string;

  constructor(options: {
    maxLogs?: number;
    reportingEndpoint?: string;
  } = {}) {
    this.maxLogs = options.maxLogs || 1000;
    this.reportingEndpoint = options.reportingEndpoint;
  }

  async logError(error: ApplicationError): Promise<void> {
    const logEntry: ErrorLogEntry = {
      ...error,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stackTrace: error.details instanceof Error ? error.details.stack : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Add to local logs
    this.logs.unshift(logEntry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Report to external service if configured
    if (this.reportingEndpoint) {
      try {
        await fetch(this.reportingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
        });
      } catch (reportingError) {
        console.warn('Failed to report error to external service:', reportingError);
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }
  }

  async logErrorBoundary(error: ApplicationError, errorInfo: any): Promise<void> {
    const boundaryError = new ApplicationError(
      error.type,
      error.message,
      {
        ...error,
        context: {
          ...error.context,
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      }
    );

    await this.logError(boundaryError);
  }

  async getErrorStats(timeRange: { start: Date; end: Date }): Promise<{
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
  }> {
    const filteredLogs = this.logs.filter(log =>
      log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
    );

    const byType = filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const bySeverity = filteredLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: filteredLogs.length,
      byType,
      bySeverity
    };
  }

  getLogs(options: {
    limit?: number;
    type?: ErrorType;
    severity?: ErrorSeverity;
    resolved?: boolean;
  } = {}): ErrorLogEntry[] {
    let filteredLogs = [...this.logs];

    if (options.type) {
      filteredLogs = filteredLogs.filter(log => log.type === options.type);
    }

    if (options.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === options.severity);
    }

    if (options.resolved !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.resolved === options.resolved);
    }

    return options.limit ? filteredLogs.slice(0, options.limit) : filteredLogs;
  }

  markResolved(logId: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.resolved = true;
      log.resolvedAt = new Date();
    }
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger({
  reportingEndpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT
});

// Global error handler for uncaught errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const error = new ApplicationError(
      ErrorType.UNKNOWN,
      event.message,
      {
        code: event.error?.code,
        details: event.error,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    );
    errorLogger.logError(error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = new ApplicationError(
      ErrorType.UNKNOWN,
      'Unhandled promise rejection',
      {
        details: event.reason,
        context: { unhandledRejection: true }
      }
    );
    errorLogger.logError(error);
  });
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getMetrics(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
    latest: number;
  } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return null;

    const sum = measurements.reduce((a, b) => a + b, 0);
    return {
      average: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length,
      latest: measurements[measurements.length - 1]
    };
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common error scenarios
export function logApiError(error: ApplicationError, endpoint: string, method: string): void {
  const apiError = new ApplicationError(
    error.type,
    error.message,
    {
      ...error,
      context: {
        ...error.context,
        endpoint,
        method,
        apiCall: true
      }
    }
  );
  errorLogger.logError(apiError);
}

export function logComponentError(error: ApplicationError, componentName: string): void {
  const componentError = new ApplicationError(
    error.type,
    error.message,
    {
      ...error,
      component: componentName,
      context: {
        ...error.context,
        componentError: true
      }
    }
  );
  errorLogger.logError(componentError);
}

export function logUserAction(action: string, context?: Record<string, any>): void {
  // Log successful user actions for analytics
  console.log('User action:', action, context);
}