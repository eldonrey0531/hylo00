/**
 * Retry Utility with Exponential Backoff
 *
 * Provides intelligent retry mechanisms for failed operations with:
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - Circuit breaker integration
 * - Comprehensive logging
 */

export interface RetryConfig {
  maxAttempts: number; // Maximum retry attempts
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  exponentialBase: number; // Exponential backoff base (e.g., 2)
  jitter: boolean; // Add random jitter to prevent thundering herd
  retryCondition?: (error: any) => boolean; // Custom retry condition
}

export interface RetryMetrics {
  attempt: number;
  totalAttempts: number;
  delay: number;
  error: any;
  timestamp: string;
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly isRetryable: boolean = true,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

/**
 * Execute an operation with exponential backoff retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (metrics: RetryMetrics) => void
): Promise<T> {
  const finalConfig = buildRetryConfig(config);

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await operation();

      if (attempt > 1) {
        console.log(`✅ RETRY_SUCCESS: Operation succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      const shouldContinue = await handleRetryAttempt(error, attempt, finalConfig, onRetry);

      if (!shouldContinue) {
        throw error;
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Retry logic error');
}

/**
 * Build final retry configuration with defaults
 */
function buildRetryConfig(config: Partial<RetryConfig>): RetryConfig {
  return {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    exponentialBase: 2,
    jitter: true,
    retryCondition: (error) => shouldRetry(error),
    ...config,
  };
}

/**
 * Handle a single retry attempt
 */
async function handleRetryAttempt(
  error: unknown,
  attempt: number,
  config: RetryConfig,
  onRetry?: (metrics: RetryMetrics) => void
): Promise<boolean> {
  // Check if we should retry this error
  if (!config.retryCondition!(error)) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ RETRY_ABORT: Error not retryable:`, errorMessage);
    return false;
  }

  // Don't delay on the last attempt
  if (attempt === config.maxAttempts) {
    console.log(`❌ RETRY_EXHAUSTED: All ${config.maxAttempts} attempts failed`);
    return false;
  }

  // Calculate delay and log metrics
  const delay = calculateDelay(attempt, config);
  const metrics: RetryMetrics = {
    attempt,
    totalAttempts: config.maxAttempts,
    delay,
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  };

  console.log(`🔄 RETRY_ATTEMPT:`, metrics);

  // Call retry callback if provided
  if (onRetry) {
    onRetry(metrics);
  }

  // Wait before retrying
  await sleep(delay);
  return true;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * (exponentialBase ^ (attempt - 1))
  const exponentialDelay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);

  // Cap at maxDelay
  let delay = Math.min(exponentialDelay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.jitter) {
    // Random jitter: ±25% of calculated delay
    const jitterAmount = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
    delay = Math.max(0, delay + jitter);
  }

  return Math.round(delay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error should be retried
 */
export function shouldRetry(error: any): boolean {
  // Don't retry RetryableError marked as non-retryable
  if (error instanceof RetryableError && !error.isRetryable) {
    return false;
  }

  // Don't retry client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    // Exception: rate limiting (429) is retryable
    return error.status === 429;
  }

  // Retry server errors (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Retry network errors
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /econnreset/i,
    /enotfound/i,
    /econnrefused/i,
    /rate.?limit/i,
    /quota.?exceeded/i,
    /service.?unavailable/i,
    /internal.?server.?error/i,
    /bad.?gateway/i,
    /gateway.?timeout/i,
  ];

  const errorMessage = error.message || error.toString();
  return retryablePatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Retry with circuit breaker integration
 */
export async function withRetryAndCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreaker: any, // Import from circuitBreaker.ts
  retryConfig: Partial<RetryConfig> = {},
  onRetry?: (metrics: RetryMetrics) => void
): Promise<T> {
  return withRetry(() => circuitBreaker.execute(operation), retryConfig, onRetry);
}

/**
 * Retry specific operations for LLM providers
 */
export const LLMRetryConfig: Record<string, Partial<RetryConfig>> = {
  // Fast provider (Groq) - quick retries
  groq: {
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 5000,
    exponentialBase: 2,
    jitter: true,
  },

  // Balanced provider (Google) - moderate retries
  google: {
    maxAttempts: 4,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
    jitter: true,
  },

  // Complex provider (Cerebras) - patient retries
  cerebras: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 20000,
    exponentialBase: 1.5,
    jitter: true,
  },
};

/**
 * Custom retry condition for LLM operations
 */
export function shouldRetryLLMOperation(error: any): boolean {
  // Standard retry conditions
  if (!shouldRetry(error)) {
    return false;
  }

  // LLM-specific non-retryable errors
  const nonRetryablePatterns = [
    /invalid.?api.?key/i,
    /authentication/i,
    /unauthorized/i,
    /forbidden/i,
    /invalid.?request/i,
    /malformed/i,
    /content.?policy/i,
    /safety.?filter/i,
  ];

  const errorMessage = error.message || error.toString();
  const isNonRetryable = nonRetryablePatterns.some((pattern) => pattern.test(errorMessage));

  return !isNonRetryable;
}
