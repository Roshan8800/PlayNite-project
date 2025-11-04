// Retry mechanisms for API calls and operations

import { ApplicationError, ErrorType, createErrorFromUnknown } from './errors';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  jitter: boolean;
  retryCondition?: (error: ApplicationError, attempt: number) => boolean;
  onRetry?: (error: ApplicationError, attempt: number) => void;
  networkAware?: boolean;
  offlineRetryDelay?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: ApplicationError;
  attempts: number;
  totalDuration: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffStrategy: 'exponential',
  jitter: true,
  networkAware: false,
  offlineRetryDelay: 5000,
  retryCondition: (error, attempt) => {
    // Default retry condition: retry on network errors and some server errors
    return (
      error.type === ErrorType.NETWORK ||
      error.type === ErrorType.TIMEOUT ||
      (error.type === ErrorType.SERVER && attempt < 2) ||
      error.retryable
    );
  }
};

function calculateDelay(
  attempt: number,
  options: RetryOptions
): number {
  let delay: number;

  switch (options.backoffStrategy) {
    case 'linear':
      delay = options.baseDelay * attempt;
      break;
    case 'exponential':
      delay = options.baseDelay * Math.pow(2, attempt - 1);
      break;
    case 'fixed':
      delay = options.baseDelay;
      break;
    default:
      delay = options.baseDelay;
  }

  // Apply maximum delay limit
  delay = Math.min(delay, options.maxDelay);

  // Add jitter to prevent thundering herd
  if (options.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: ApplicationError | undefined;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalDuration: Date.now() - startTime
      };
    } catch (error) {
      lastError = createErrorFromUnknown(error);

      // Check if we should retry
      const shouldRetry = config.retryCondition!(lastError, attempt);

      if (!shouldRetry || attempt === config.maxAttempts) {
        break;
      }

      // Network-aware retry: if offline and network-aware is enabled, wait for reconnection
      if (config.networkAware && lastError.type === ErrorType.NETWORK && typeof navigator !== 'undefined' && !navigator.onLine) {
        // Wait for online event or timeout
        await new Promise<void>((resolve) => {
          const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            resolve();
          };

          window.addEventListener('online', handleOnline);

          // Fallback timeout in case online event doesn't fire
          setTimeout(() => {
            window.removeEventListener('online', handleOnline);
            resolve();
          }, config.offlineRetryDelay);
        });
      }

      // Call retry callback if provided
      if (config.onRetry) {
        config.onRetry(lastError, attempt);
      }

      // Wait before next attempt
      const delay = calculateDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: config.maxAttempts,
    totalDuration: Date.now() - startTime
  };
}

// Specialized retry functions for different types of operations

export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const result = await withRetry(apiCall, {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffStrategy: 'exponential',
    networkAware: true,
    offlineRetryDelay: 3000,
    retryCondition: (error) => {
      return error.type === ErrorType.NETWORK ||
             error.type === ErrorType.TIMEOUT ||
             (error.type === ErrorType.SERVER && error.code !== 400 && error.code !== 401 && error.code !== 403);
    },
    ...options
  });

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

export async function retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const result = await withRetry(operation, {
    maxAttempts: 5,
    baseDelay: 500,
    backoffStrategy: 'exponential',
    retryCondition: (error) => {
      // Retry on transient Firestore errors
      return error.type === ErrorType.FIRESTORE ||
             error.type === ErrorType.NETWORK ||
             error.code === 'unavailable' ||
             error.code === 'deadline-exceeded';
    },
    ...options
  });

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

export async function retryVideoLoad<T>(
  loadOperation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const result = await withRetry(loadOperation, {
    maxAttempts: 3,
    baseDelay: 2000,
    backoffStrategy: 'linear',
    networkAware: true,
    offlineRetryDelay: 5000,
    retryCondition: (error) => {
      return error.type === ErrorType.VIDEO_LOAD ||
             error.type === ErrorType.NETWORK ||
             error.type === ErrorType.TIMEOUT;
    },
    ...options
  });

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

// Circuit breaker pattern for preventing cascade failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000,
    private monitoringPeriod: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new ApplicationError(
          ErrorType.SERVER,
          'Circuit breaker is open - service temporarily unavailable',
          { retryable: true }
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

// Debounced retry for user actions
export function createDebouncedRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 1000
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const debouncedFn = ((...args: Parameters<T>) => {
    lastArgs = args;
    const now = Date.now();

    if (now - lastCallTime < delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          lastCallTime = Date.now();
          const result = await fn(...(lastArgs || args));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }) as T;

  return debouncedFn;
}