// Standardized error types and interfaces for consistent error handling across the application

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  CLIENT = 'client',
  VIDEO_LOAD = 'video_load',
  VIDEO_PLAYBACK = 'video_playback',
  FIRESTORE = 'firestore',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  retryable: boolean;
  severity: ErrorSeverity;
  context?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number;
  };
  fallback?: {
    enabled: boolean;
    component?: React.ComponentType;
    data?: any;
  };
  userMessage?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

export class ApplicationError extends Error implements AppError {
  public readonly type: ErrorType;
  public readonly code?: string | number;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly userId?: string;
  public readonly sessionId?: string;
  public readonly component?: string;
  public readonly action?: string;
  public readonly retryable: boolean;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      code?: string | number;
      details?: any;
      userId?: string;
      sessionId?: string;
      component?: string;
      action?: string;
      retryable?: boolean;
      severity?: ErrorSeverity;
      context?: Record<string, any>;
    } = {}
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.code = options.code;
    this.details = options.details;
    this.timestamp = new Date();
    this.userId = options.userId;
    this.sessionId = options.sessionId;
    this.component = options.component;
    this.action = options.action;
    this.retryable = options.retryable ?? false;
    this.severity = options.severity ?? ErrorSeverity.MEDIUM;
    this.context = options.context;
  }

  toJSON(): AppError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      userId: this.userId,
      sessionId: this.sessionId,
      component: this.component,
      action: this.action,
      retryable: this.retryable,
      severity: this.severity,
      context: this.context
    };
  }
}

// Specific error classes for different domains
export class NetworkError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.NETWORK, message, {
      retryable: true,
      severity: ErrorSeverity.MEDIUM,
      ...options
    });
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.AUTHENTICATION, message, {
      retryable: false,
      severity: ErrorSeverity.HIGH,
      ...options
    });
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.AUTHORIZATION, message, {
      retryable: false,
      severity: ErrorSeverity.HIGH,
      ...options
    });
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.VALIDATION, message, {
      retryable: false,
      severity: ErrorSeverity.LOW,
      ...options
    });
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.NOT_FOUND, message, {
      retryable: false,
      severity: ErrorSeverity.LOW,
      ...options
    });
  }
}

export class VideoLoadError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.VIDEO_LOAD, message, {
      retryable: true,
      severity: ErrorSeverity.MEDIUM,
      ...options
    });
  }
}

export class VideoPlaybackError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.VIDEO_PLAYBACK, message, {
      retryable: true,
      severity: ErrorSeverity.MEDIUM,
      ...options
    });
  }
}

export class FirestoreError extends ApplicationError {
  constructor(message: string, options: Partial<{
    code?: string | number;
    details?: any;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
  }> = {}) {
    super(ErrorType.FIRESTORE, message, {
      retryable: true,
      severity: ErrorSeverity.MEDIUM,
      ...options
    });
  }
}

// Error boundary state interface
export interface ErrorBoundaryState {
  error: ApplicationError | null;
  errorId: string;
  hasError: boolean;
  retryCount: number;
}

// Error logging interface
export interface ErrorLogEntry extends AppError {
  id: string;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  resolved?: boolean;
  resolvedAt?: Date;
}

// Error reporting service interface
export interface ErrorReportingService {
  logError(error: ApplicationError): Promise<void>;
  logErrorBoundary(error: ApplicationError, errorInfo: any): Promise<void>;
  getErrorStats(timeRange: { start: Date; end: Date }): Promise<{
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
  }>;
}

// Utility functions
export function isRetryableError(error: ApplicationError): boolean {
  return error.retryable;
}

export function getErrorSeverity(error: ApplicationError): ErrorSeverity {
  return error.severity;
}

export function createErrorFromUnknown(error: unknown, context?: Record<string, any>): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      ErrorType.UNKNOWN,
      error.message,
      {
        details: error,
        context,
        severity: ErrorSeverity.MEDIUM
      }
    );
  }

  return new ApplicationError(
    ErrorType.UNKNOWN,
    'An unknown error occurred',
    {
      details: error,
      context,
      severity: ErrorSeverity.MEDIUM
    }
  );
}

export function getUserFriendlyMessage(error: ApplicationError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Connection problem. Please check your internet and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested content was not found.';
    case ErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorType.VIDEO_LOAD:
      return 'Unable to load video. Please try refreshing the page.';
    case ErrorType.VIDEO_PLAYBACK:
      return 'Video playback failed. Please try again.';
    case ErrorType.FIRESTORE:
      return 'Database error. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}