/**
 * Resilient LLM Service
 *
 * Enhances the existing LLM routing service with comprehensive resilience features:
 * - Circuit breakers for provider failure detection
 * - Intelligent retry with exponential backoff
 * - Graceful degradation strategies
 * - Health monitoring and metrics
 */

import { circuitBreakerRegistry, CircuitState } from '../utils/circuitBreaker';
import { withRetry, LLMRetryConfig, shouldRetryLLMOperation, RetryMetrics } from '../utils/retry';

export interface ResilientLLMConfig {
  enableCircuitBreakers: boolean;
  enableRetries: boolean;
  enableGracefulDegradation: boolean;
  healthCheckInterval: number; // milliseconds
  degradationThreshold: number; // failure rate percentage
}

export interface ProviderHealth {
  name: string;
  available: boolean;
  circuitState: CircuitState;
  successRate: number;
  lastCheckTime: string;
  errorCount: number;
  responseTime: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  availableProviders: string[];
  totalProviders: number;
  healthyProviders: number;
  lastUpdate: string;
  providersHealth: ProviderHealth[];
}

export class ResilientLLMService {
  private config: ResilientLLMConfig;
  private healthMetrics = new Map<string, ProviderHealth>();
  private lastHealthCheck = 0;

  constructor(config: Partial<ResilientLLMConfig> = {}) {
    this.config = {
      enableCircuitBreakers: true,
      enableRetries: true,
      enableGracefulDegradation: true,
      healthCheckInterval: 30000, // 30 seconds
      degradationThreshold: 50, // 50% failure rate
      ...config,
    };
  }

  /**
   * Execute LLM request with full resilience features
   */
  async executeWithResilience<T>(
    providerName: string,
    operation: () => Promise<T>,
    complexity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Get circuit breaker for this provider
      const circuitBreaker = this.config.enableCircuitBreakers
        ? circuitBreakerRegistry.getBreaker(
            providerName,
            this.getCircuitBreakerConfig(providerName)
          )
        : null;

      // Prepare retry configuration
      const retryConfig = this.config.enableRetries
        ? { ...LLMRetryConfig[providerName], retryCondition: shouldRetryLLMOperation }
        : { maxAttempts: 1 };

      let result: T;

      if (circuitBreaker && this.config.enableRetries) {
        // Use both circuit breaker and retry
        result = await withRetry(
          () => circuitBreaker.execute(operation),
          retryConfig,
          (metrics: RetryMetrics) => this.onRetryAttempt(providerName, metrics)
        );
      } else if (circuitBreaker) {
        // Use only circuit breaker
        result = await circuitBreaker.execute(operation);
      } else if (this.config.enableRetries) {
        // Use only retry
        result = await withRetry(operation, retryConfig, (metrics: RetryMetrics) =>
          this.onRetryAttempt(providerName, metrics)
        );
      } else {
        // No resilience features
        result = await operation();
      }

      // Update health metrics on success
      this.updateHealthMetrics(providerName, true, Date.now() - startTime);

      return result;
    } catch (error) {
      // Update health metrics on failure
      this.updateHealthMetrics(providerName, false, Date.now() - startTime, error);

      // Attempt graceful degradation if enabled
      if (this.config.enableGracefulDegradation) {
        const degradedResult = await this.attemptGracefulDegradation(
          providerName,
          operation,
          complexity,
          error
        );
        if (degradedResult) {
          return degradedResult;
        }
      }

      throw error;
    }
  }

  /**
   * Get circuit breaker configuration for a provider
   */
  private getCircuitBreakerConfig(providerName: string) {
    const configs = {
      groq: {
        failureThreshold: 3, // Fast failure detection
        recoveryTimeout: 15000, // Quick recovery attempts
        successThreshold: 2,
        monitoringWindow: 60000,
      },
      google: {
        failureThreshold: 5, // More tolerant
        recoveryTimeout: 30000, // Moderate recovery
        successThreshold: 3,
        monitoringWindow: 120000,
      },
      cerebras: {
        failureThreshold: 4, // Balanced approach
        recoveryTimeout: 45000, // Patient recovery
        successThreshold: 2,
        monitoringWindow: 180000,
      },
    };

    return configs[providerName as keyof typeof configs] || configs.google;
  }

  /**
   * Handle retry attempt logging
   */
  private onRetryAttempt(providerName: string, metrics: RetryMetrics): void {
    console.log(
      `🔄 RESILIENT_RETRY: Provider ${providerName} retry attempt ${metrics.attempt}/${metrics.totalAttempts}`
    );
  }

  /**
   * Update health metrics for a provider
   */
  private updateHealthMetrics(
    providerName: string,
    success: boolean,
    responseTime: number,
    _error?: unknown
  ): void {
    const existing = this.healthMetrics.get(providerName);
    const circuitBreaker = circuitBreakerRegistry.getBreaker(providerName);
    const circuitMetrics = circuitBreaker.getMetrics();

    const updated: ProviderHealth = {
      name: providerName,
      available: circuitMetrics.state !== CircuitState.OPEN,
      circuitState: circuitMetrics.state,
      successRate: circuitMetrics.successRate,
      lastCheckTime: new Date().toISOString(),
      errorCount: existing
        ? success
          ? existing.errorCount
          : existing.errorCount + 1
        : success
        ? 0
        : 1,
      responseTime,
    };

    this.healthMetrics.set(providerName, updated);
  }

  /**
   * Attempt graceful degradation when primary provider fails
   */
  private async attemptGracefulDegradation<T>(
    failedProvider: string,
    operation: () => Promise<T>,
    complexity: 'low' | 'medium' | 'high',
    _originalError: unknown
  ): Promise<T | null> {
    console.log(`🔄 GRACEFUL_DEGRADATION: Attempting fallback from ${failedProvider}`);

    // Get alternative providers based on complexity
    const alternatives = this.getAlternativeProviders(failedProvider, complexity);

    for (const altProvider of alternatives) {
      try {
        console.log(`🔄 FALLBACK_ATTEMPT: Trying ${altProvider} as fallback`);

        // Check if alternative provider is available
        const altHealth = this.healthMetrics.get(altProvider);
        if (altHealth && !altHealth.available) {
          console.log(`⚠️ FALLBACK_SKIP: ${altProvider} is unavailable`);
          continue;
        }

        // Execute with the alternative provider
        const result = await this.executeWithResilience(altProvider, operation, complexity);

        console.log(`✅ FALLBACK_SUCCESS: ${altProvider} succeeded as fallback`);
        return result;
      } catch (fallbackError) {
        console.log(
          `❌ FALLBACK_FAILED: ${altProvider} also failed:`,
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        );
      }
    }

    console.log(`❌ GRACEFUL_DEGRADATION_FAILED: All fallback providers exhausted`);
    return null;
  }

  /**
   * Get alternative providers for fallback
   */
  private getAlternativeProviders(
    failedProvider: string,
    complexity: 'low' | 'medium' | 'high'
  ): string[] {
    const providerPriority = {
      high: ['cerebras', 'groq', 'google'],
      medium: ['groq', 'cerebras', 'google'],
      low: ['groq', 'google', 'cerebras'],
    };

    return providerPriority[complexity].filter((p) => p !== failedProvider);
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const now = Date.now();

    // Refresh health metrics if needed
    if (now - this.lastHealthCheck > this.config.healthCheckInterval) {
      await this.refreshHealthMetrics();
      this.lastHealthCheck = now;
    }

    const providersHealth = Array.from(this.healthMetrics.values());
    const healthyProviders = providersHealth.filter((p) => p.available);
    const totalProviders = providersHealth.length;

    let status: 'healthy' | 'degraded' | 'critical';
    if (healthyProviders.length === totalProviders) {
      status = 'healthy';
    } else if (healthyProviders.length > 0) {
      status = 'degraded';
    } else {
      status = 'critical';
    }

    return {
      status,
      availableProviders: healthyProviders.map((p) => p.name),
      totalProviders,
      healthyProviders: healthyProviders.length,
      lastUpdate: new Date().toISOString(),
      providersHealth,
    };
  }

  /**
   * Refresh health metrics for all providers
   */
  private async refreshHealthMetrics(): Promise<void> {
    const providers = ['groq', 'cerebras', 'google'];

    for (const provider of providers) {
      try {
        const circuitBreaker = circuitBreakerRegistry.getBreaker(provider);
        const metrics = circuitBreaker.getMetrics();

        const health: ProviderHealth = {
          name: provider,
          available: metrics.state !== CircuitState.OPEN,
          circuitState: metrics.state,
          successRate: metrics.successRate,
          lastCheckTime: new Date().toISOString(),
          errorCount: metrics.failureCount,
          responseTime: 0, // Would be updated during actual requests
        };

        this.healthMetrics.set(provider, health);
      } catch (error) {
        console.error(`Failed to refresh health metrics for ${provider}:`, error);
      }
    }
  }

  /**
   * Reset all resilience components
   */
  reset(): void {
    circuitBreakerRegistry.resetAll();
    this.healthMetrics.clear();
    this.lastHealthCheck = 0;
    console.log('🔄 RESILIENCE_RESET: All resilience components reset');
  }

  /**
   * Get circuit breaker metrics for monitoring
   */
  getCircuitBreakerMetrics() {
    return circuitBreakerRegistry.getAllMetrics();
  }
}

// Global resilient service instance
export const resilientLLMService = new ResilientLLMService();
