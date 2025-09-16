/**
 * Fallback Handler for LLM Provider Resilience
 *
 * Implements progressive fallback chain handling and resilience patterns with
 * constitutional compliance for graceful degradation and multi-LLM resilience.
 */

import type {
  LLMRequest,
  LLMResponse,
  LLMStreamChunk,
  ProviderName,
  ErrorInfo,
} from '../types/index.js';
import type { ProviderFactory } from '../providers/factory.js';

/**
 * Fallback attempt information
 */
interface FallbackAttempt {
  readonly provider: ProviderName;
  readonly attemptNumber: number;
  readonly startTime: number;
  readonly endTime?: number;
  readonly success: boolean;
  readonly error?: ErrorInfo;
  readonly latencyMs?: number;
}

/**
 * Fallback execution result
 */
interface FallbackResult {
  readonly response?: LLMResponse;
  readonly stream?: ReadableStream<LLMStreamChunk>;
  readonly finalProvider: ProviderName;
  readonly attempts: FallbackAttempt[];
  readonly totalLatencyMs: number;
  readonly fallbacksUsed: number;
  readonly degradedResponse: boolean;
}

/**
 * Fallback configuration
 */
interface FallbackConfig {
  readonly maxAttempts: number;
  readonly timeoutMs: number;
  readonly backoffMultiplier: number;
  readonly baseDelayMs: number;
  readonly retryableErrors: string[];
  readonly circuitBreakerThreshold: number;
  readonly degradationMode: 'fail_fast' | 'best_effort' | 'graceful';
}

/**
 * Circuit breaker state for provider health tracking
 */
interface CircuitBreakerState {
  readonly provider: ProviderName;
  readonly failures: number;
  readonly lastFailure: number;
  readonly state: 'closed' | 'open' | 'half_open';
  readonly nextRetryTime: number;
}

/**
 * Fallback handler for progressive resilience patterns
 * Constitutional requirement: Multi-LLM resilience with graceful degradation
 */
export class FallbackHandler {
  private readonly config: FallbackConfig;
  private readonly providerFactory: ProviderFactory;
  private readonly circuitBreakers = new Map<ProviderName, CircuitBreakerState>();

  constructor(providerFactory: ProviderFactory, config?: Partial<FallbackConfig>) {
    this.providerFactory = providerFactory;
    this.config = this.mergeConfig(config);
  }

  // =============================================================================
  // Main Fallback Execution Methods
  // =============================================================================

  /**
   * Execute request with fallback chain for resilience
   * Constitutional requirement: Progressive fallback with graceful degradation
   */
  async executeWithFallback(
    request: LLMRequest,
    primaryProvider: ProviderName,
    fallbackChain: ProviderName[]
  ): Promise<FallbackResult> {
    const attempts: FallbackAttempt[] = [];
    const startTime = Date.now();

    // Build complete provider chain (primary + fallbacks)
    const providerChain = [primaryProvider, ...fallbackChain];

    for (let i = 0; i < providerChain.length && i < this.config.maxAttempts; i++) {
      const providerName = providerChain[i];
      const attemptNumber = i + 1;

      // Check circuit breaker
      if (this.isCircuitOpen(providerName)) {
        attempts.push({
          provider: providerName,
          attemptNumber,
          startTime: Date.now(),
          endTime: Date.now(),
          success: false,
          error: {
            code: 'CIRCUIT_BREAKER_OPEN',
            message: `Circuit breaker open for provider ${providerName}`,
            timestamp: new Date().toISOString(),
            provider: providerName,
          },
        });
        continue;
      }

      try {
        const result = await this.attemptProviderRequest(request, providerName, attemptNumber);

        if (result.success) {
          // Success - reset circuit breaker and return
          this.resetCircuitBreaker(providerName);

          return {
            response: result.response,
            stream: result.stream,
            finalProvider: providerName,
            attempts: [...attempts, result.attempt],
            totalLatencyMs: Date.now() - startTime,
            fallbacksUsed: i,
            degradedResponse: i > 0, // Degraded if we used fallbacks
          };
        } else {
          // Failure - record attempt and continue
          attempts.push(result.attempt);
          this.recordFailure(providerName, result.attempt.error);

          // Apply backoff delay before next attempt
          if (i < providerChain.length - 1) {
            await this.applyBackoffDelay(attemptNumber);
          }
        }
      } catch (error) {
        // Unexpected error - record and continue
        const attempt: FallbackAttempt = {
          provider: providerName,
          attemptNumber,
          startTime: Date.now(),
          endTime: Date.now(),
          success: false,
          error: {
            code: 'UNEXPECTED_ERROR',
            message: `Unexpected error: ${(error as Error).message}`,
            timestamp: new Date().toISOString(),
            provider: providerName,
          },
        };

        attempts.push(attempt);
        this.recordFailure(providerName, attempt.error);
      }
    }

    // All providers failed - handle based on degradation mode
    return this.handleCompleteFailure(attempts, startTime, request);
  }

  /**
   * Execute streaming request with fallback chain
   * Constitutional requirement: Streaming support with resilience
   */
  async executeStreamWithFallback(
    request: LLMRequest,
    primaryProvider: ProviderName,
    fallbackChain: ProviderName[]
  ): Promise<FallbackResult> {
    // For streaming, we try each provider until one succeeds
    // We don't implement partial fallback during streaming to avoid complexity
    const attempts: FallbackAttempt[] = [];
    const startTime = Date.now();
    const providerChain = [primaryProvider, ...fallbackChain];

    for (let i = 0; i < providerChain.length && i < this.config.maxAttempts; i++) {
      const providerName = providerChain[i];
      const attemptNumber = i + 1;

      if (this.isCircuitOpen(providerName)) {
        attempts.push({
          provider: providerName,
          attemptNumber,
          startTime: Date.now(),
          endTime: Date.now(),
          success: false,
          error: {
            code: 'CIRCUIT_BREAKER_OPEN',
            message: `Circuit breaker open for provider ${providerName}`,
            timestamp: new Date().toISOString(),
            provider: providerName,
          },
        });
        continue;
      }

      try {
        const result = await this.attemptStreamRequest(request, providerName, attemptNumber);

        if (result.success) {
          this.resetCircuitBreaker(providerName);

          return {
            stream: result.stream,
            finalProvider: providerName,
            attempts: [...attempts, result.attempt],
            totalLatencyMs: Date.now() - startTime,
            fallbacksUsed: i,
            degradedResponse: i > 0,
          };
        } else {
          attempts.push(result.attempt);
          this.recordFailure(providerName, result.attempt.error);
        }
      } catch (error) {
        const attempt: FallbackAttempt = {
          provider: providerName,
          attemptNumber,
          startTime: Date.now(),
          endTime: Date.now(),
          success: false,
          error: {
            code: 'STREAM_ERROR',
            message: `Stream error: ${(error as Error).message}`,
            timestamp: new Date().toISOString(),
            provider: providerName,
          },
        };

        attempts.push(attempt);
        this.recordFailure(providerName, attempt.error);
      }
    }

    // All streaming attempts failed
    throw new Error('All providers failed for streaming request');
  }

  // =============================================================================
  // Provider Attempt Methods
  // =============================================================================

  private async attemptProviderRequest(
    request: LLMRequest,
    providerName: ProviderName,
    attemptNumber: number
  ): Promise<{
    success: boolean;
    response?: LLMResponse;
    attempt: FallbackAttempt;
    stream?: never;
  }> {
    const startTime = Date.now();

    try {
      const provider = this.providerFactory.getProvider(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not available`);
      }

      // Check provider availability
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new Error(`Provider ${providerName} is not available`);
      }

      // Execute request with timeout
      const response = await this.executeWithTimeout(
        () => provider.generateResponse(request),
        this.config.timeoutMs
      );

      const endTime = Date.now();
      const attempt: FallbackAttempt = {
        provider: providerName,
        attemptNumber,
        startTime,
        endTime,
        success: true,
        latencyMs: endTime - startTime,
      };

      return { success: true, response, attempt };
    } catch (error) {
      const endTime = Date.now();
      const errorInfo: ErrorInfo = {
        code: this.categorizeError(error as Error),
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
        provider: providerName,
        details: {
          attemptNumber,
          originalError: (error as Error).name,
        },
      };

      const attempt: FallbackAttempt = {
        provider: providerName,
        attemptNumber,
        startTime,
        endTime,
        success: false,
        error: errorInfo,
        latencyMs: endTime - startTime,
      };

      return { success: false, attempt };
    }
  }

  private async attemptStreamRequest(
    request: LLMRequest,
    providerName: ProviderName,
    attemptNumber: number
  ): Promise<{
    success: boolean;
    stream?: ReadableStream<LLMStreamChunk>;
    attempt: FallbackAttempt;
  }> {
    const startTime = Date.now();

    try {
      const provider = this.providerFactory.getProvider(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not available`);
      }

      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new Error(`Provider ${providerName} is not available`);
      }

      const stream = await provider.generateStream(request);
      const endTime = Date.now();

      const attempt: FallbackAttempt = {
        provider: providerName,
        attemptNumber,
        startTime,
        endTime,
        success: true,
        latencyMs: endTime - startTime,
      };

      return { success: true, stream, attempt };
    } catch (error) {
      const endTime = Date.now();
      const errorInfo: ErrorInfo = {
        code: this.categorizeError(error as Error),
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
        provider: providerName,
        details: {
          attemptNumber,
          originalError: (error as Error).name,
        },
      };

      const attempt: FallbackAttempt = {
        provider: providerName,
        attemptNumber,
        startTime,
        endTime,
        success: false,
        error: errorInfo,
        latencyMs: endTime - startTime,
      };

      return { success: false, attempt };
    }
  }

  // =============================================================================
  // Circuit Breaker Implementation
  // =============================================================================

  private isCircuitOpen(provider: ProviderName): boolean {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker) return false;

    const now = Date.now();

    if (breaker.state === 'open') {
      if (now >= breaker.nextRetryTime) {
        // Transition to half-open
        this.circuitBreakers.set(provider, {
          ...breaker,
          state: 'half_open',
        });
        return false;
      }
      return true;
    }

    return false;
  }

  private recordFailure(provider: ProviderName, error?: ErrorInfo): void {
    const now = Date.now();
    const current = this.circuitBreakers.get(provider) || {
      provider,
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
      nextRetryTime: 0,
    };

    const newFailures = current.failures + 1;
    const shouldOpen = newFailures >= this.config.circuitBreakerThreshold;

    this.circuitBreakers.set(provider, {
      provider,
      failures: newFailures,
      lastFailure: now,
      state: shouldOpen ? 'open' : current.state,
      nextRetryTime: shouldOpen ? now + 60000 : current.nextRetryTime, // 1 minute backoff
    });
  }

  private resetCircuitBreaker(provider: ProviderName): void {
    this.circuitBreakers.set(provider, {
      provider,
      failures: 0,
      lastFailure: 0,
      state: 'closed',
      nextRetryTime: 0,
    });
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private async executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private async applyBackoffDelay(attemptNumber: number): Promise<void> {
    const delay =
      this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attemptNumber - 1);
    const jitteredDelay = delay + Math.random() * 1000; // Add jitter

    await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (message.includes('rate limit') || message.includes('429')) return 'RATE_LIMIT_ERROR';
    if (message.includes('unauthorized') || message.includes('401')) return 'AUTH_ERROR';
    if (message.includes('not available') || message.includes('503')) return 'AVAILABILITY_ERROR';
    if (message.includes('capacity') || message.includes('overload')) return 'CAPACITY_ERROR';
    if (message.includes('network') || message.includes('fetch')) return 'NETWORK_ERROR';

    return 'UNKNOWN_ERROR';
  }

  private isRetryableError(error?: ErrorInfo): boolean {
    if (!error) return false;
    return this.config.retryableErrors.includes(error.code);
  }

  private handleCompleteFailure(
    attempts: FallbackAttempt[],
    startTime: number,
    request: LLMRequest
  ): FallbackResult {
    const totalLatencyMs = Date.now() - startTime;

    switch (this.config.degradationMode) {
      case 'fail_fast':
        throw new Error(`All providers failed after ${attempts.length} attempts`);

      case 'best_effort':
        // Return a degraded response
        return {
          response: this.generateDegradedResponse(request, attempts),
          finalProvider: attempts[0]?.provider || 'groq',
          attempts,
          totalLatencyMs,
          fallbacksUsed: attempts.length,
          degradedResponse: true,
        };

      case 'graceful':
        // Return a helpful error response
        return {
          response: this.generateGracefulFailureResponse(request, attempts),
          finalProvider: attempts[0]?.provider || 'groq',
          attempts,
          totalLatencyMs,
          fallbacksUsed: attempts.length,
          degradedResponse: true,
        };

      default:
        throw new Error(`All providers failed after ${attempts.length} attempts`);
    }
  }

  private generateDegradedResponse(request: LLMRequest, attempts: FallbackAttempt[]): LLMResponse {
    return {
      response: `I apologize, but I'm experiencing technical difficulties and cannot process your travel request at the moment. Our systems attempted to route your query through multiple providers but encountered issues. Please try again in a few moments.`,
      metadata: {
        providerUsed: attempts[0]?.provider || 'groq',
        complexityDetected: 'low',
        routingDecision: {
          selectedProvider: attempts[0]?.provider || 'groq',
          reasoning: 'Degraded response due to provider failures',
          candidateProviders: [],
          complexityScore: 0,
          fallbackChain: [],
        },
        latencyMs: 0,
        requestId: request.metadata?.requestId || 'fallback-' + Date.now(),
        timestamp: new Date().toISOString(),
        fallbackOccurred: true,
      },
      usage: {
        inputTokens: 0,
        outputTokens: 50,
        totalTokens: 50,
        estimatedCostUsd: 0,
      },
    };
  }

  private generateGracefulFailureResponse(
    request: LLMRequest,
    attempts: FallbackAttempt[]
  ): LLMResponse {
    const lastAttempt = attempts[attempts.length - 1];
    const errorSummary = attempts.map((a) => `${a.provider}: ${a.error?.code}`).join(', ');

    return {
      response: `I apologize, but I'm unable to assist with your travel planning request right now due to temporary service issues. Our team is working to resolve these problems. In the meantime, you might try: 1) Simplifying your request, 2) Trying again in a few minutes, or 3) Contacting our support team for immediate assistance.`,
      metadata: {
        providerUsed: lastAttempt?.provider || 'groq',
        complexityDetected: 'low',
        routingDecision: {
          selectedProvider: lastAttempt?.provider || 'groq',
          reasoning: `Graceful failure after attempting: ${errorSummary}`,
          candidateProviders: [],
          complexityScore: 0,
          fallbackChain: [],
        },
        latencyMs: 0,
        requestId: request.metadata?.requestId || 'graceful-failure-' + Date.now(),
        timestamp: new Date().toISOString(),
        fallbackOccurred: true,
      },
      usage: {
        inputTokens: 0,
        outputTokens: 80,
        totalTokens: 80,
        estimatedCostUsd: 0,
      },
    };
  }

  // =============================================================================
  // Configuration Management
  // =============================================================================

  private mergeConfig(userConfig?: Partial<FallbackConfig>): FallbackConfig {
    const defaultConfig: FallbackConfig = {
      maxAttempts: 3,
      timeoutMs: 30000,
      backoffMultiplier: 2,
      baseDelayMs: 1000,
      retryableErrors: [
        'TIMEOUT_ERROR',
        'RATE_LIMIT_ERROR',
        'AVAILABILITY_ERROR',
        'CAPACITY_ERROR',
        'NETWORK_ERROR',
      ],
      circuitBreakerThreshold: 5,
      degradationMode: 'graceful',
    };

    return {
      ...defaultConfig,
      ...userConfig,
    };
  }

  /**
   * Get current fallback configuration
   */
  getConfig(): FallbackConfig {
    return { ...this.config };
  }

  /**
   * Get circuit breaker states for all providers
   */
  getCircuitBreakerStates(): Map<ProviderName, CircuitBreakerState> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Reset circuit breaker for a specific provider
   */
  resetProviderCircuitBreaker(provider: ProviderName): void {
    this.resetCircuitBreaker(provider);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }
}

/**
 * Create a fallback handler instance
 * Constitutional requirement: Centralized resilience management
 */
export function createFallbackHandler(
  providerFactory: ProviderFactory,
  config?: Partial<FallbackConfig>
): FallbackHandler {
  return new FallbackHandler(providerFactory, config);
}

// Export types for external use
export type { FallbackResult, FallbackAttempt, FallbackConfig, CircuitBreakerState };
