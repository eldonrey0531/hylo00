/**
 * Provider Factory for LLM Provider Management
 *
 * Centralized factory for creating and managing LLM providers with
 * constitutional compliance for configuration management and type safety.
 */

import type { LLMProvider, ProviderName, ProviderMetrics } from '../types/index.js';
import { CerebrasProvider, createCerebrasProvider } from './cerebras.js';
import { GeminiProvider, createGeminiProvider } from './gemini.js';
import { GroqProvider, createGroqProvider } from './groq.js';

/**
 * Provider registry for tracking active providers
 */
interface ProviderRegistry {
  cerebras?: CerebrasProvider;
  gemini?: GeminiProvider;
  groq?: GroqProvider;
}

/**
 * Provider factory configuration
 */
interface ProviderFactoryConfig {
  readonly enableCerebras: boolean;
  readonly enableGemini: boolean;
  readonly enableGroq: boolean;
  readonly defaultProvider: ProviderName;
  readonly fallbackChain: ProviderName[];
  readonly healthCheckInterval: number;
  readonly autoFailover: boolean;
}

/**
 * Provider factory class for managing LLM provider lifecycle
 * Constitutional requirement: Multi-LLM resilience and configuration management
 */
export class ProviderFactory {
  private readonly config: ProviderFactoryConfig;
  private readonly registry: ProviderRegistry = {};
  private readonly environment: Record<string, string | undefined>;
  private healthCheckTimer?: ReturnType<typeof setInterval>;

  constructor(environment: Record<string, string | undefined>) {
    this.environment = environment;
    this.config = this.loadFactoryConfig(environment);
  }

  // =============================================================================
  // Provider Creation and Management
  // =============================================================================

  /**
   * Initialize all enabled providers
   * Constitutional requirement: Multi-LLM resilience
   */
  async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    if (this.config.enableCerebras) {
      initPromises.push(this.initializeCerebras());
    }

    if (this.config.enableGemini) {
      initPromises.push(this.initializeGemini());
    }

    if (this.config.enableGroq) {
      initPromises.push(this.initializeGroq());
    }

    await Promise.allSettled(initPromises);

    // Start health monitoring if enabled
    if (this.config.healthCheckInterval > 0) {
      this.startHealthMonitoring();
    }
  }

  /**
   * Get a provider by name
   * Constitutional requirement: Type safety
   */
  getProvider(name: ProviderName): LLMProvider | null {
    return this.registry[name] || null;
  }

  /**
   * Get all available providers
   */
  getAllProviders(): Record<ProviderName, LLMProvider> {
    const providers: Partial<Record<ProviderName, LLMProvider>> = {};

    for (const [name, provider] of Object.entries(this.registry)) {
      if (provider) {
        providers[name as ProviderName] = provider;
      }
    }

    return providers as Record<ProviderName, LLMProvider>;
  }

  /**
   * Get healthy providers only
   * Constitutional requirement: Graceful degradation
   */
  async getHealthyProviders(): Promise<Record<ProviderName, LLMProvider>> {
    const allProviders = this.getAllProviders();
    const healthyProviders: Partial<Record<ProviderName, LLMProvider>> = {};

    const healthChecks = Object.entries(allProviders).map(async ([name, provider]) => {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          healthyProviders[name as ProviderName] = provider;
        }
      } catch (error) {
        // Log error but continue with other providers
        console.warn(`Health check failed for provider ${name}:`, error);
      }
    });

    await Promise.allSettled(healthChecks);
    return healthyProviders as Record<ProviderName, LLMProvider>;
  }

  /**
   * Get the best available provider based on complexity and health
   * Constitutional requirement: Intelligent routing
   */
  async getBestProvider(complexity: 'low' | 'medium' | 'high'): Promise<LLMProvider | null> {
    const healthyProviders = await this.getHealthyProviders();
    const providerList = Object.values(healthyProviders);

    if (providerList.length === 0) {
      return null;
    }

    // Sort providers by preferred complexity match and availability
    const providersCopy = [...providerList];
    providersCopy.sort((a, b) => {
      // Exact complexity match gets highest priority
      const aMatch = a.preferredComplexity === complexity ? 2 : 0;
      const bMatch = b.preferredComplexity === complexity ? 2 : 0;

      if (aMatch !== bMatch) {
        return bMatch - aMatch;
      }

      // Secondary sort by timeout (faster providers preferred)
      return a.timeoutMs - b.timeoutMs;
    });

    return providersCopy[0];
  }

  /**
   * Get fallback providers for a given primary provider
   * Constitutional requirement: Progressive fallback
   */
  async getFallbackProviders(primaryProvider: ProviderName): Promise<LLMProvider[]> {
    const healthyProviders = await this.getHealthyProviders();
    const fallbackChain = this.config.fallbackChain.filter(
      (name) => name !== primaryProvider && healthyProviders[name]
    );

    return fallbackChain.map((name) => healthyProviders[name]).filter(Boolean);
  }

  /**
   * Get aggregated metrics from all providers
   * Constitutional requirement: Observable operations
   */
  async getAggregatedMetrics(): Promise<AggregatedMetrics> {
    const allProviders = this.getAllProviders();
    const metricsPromises = Object.entries(allProviders).map(async ([name, provider]) => {
      try {
        const metrics = await provider.getMetrics();
        return { name: name as ProviderName, metrics };
      } catch (error) {
        console.warn(`Failed to get metrics for provider ${name}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(metricsPromises);
    const successfulResults = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          name: ProviderName;
          metrics: ProviderMetrics;
        } | null> => result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value!);

    return this.calculateAggregatedMetrics(successfulResults);
  }

  /**
   * Shutdown all providers and cleanup resources
   */
  async shutdown(): Promise<void> {
    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    // Reset all providers
    const resetPromises = Object.values(this.registry).map(async (provider) => {
      if (provider) {
        try {
          await provider.resetMetrics();
        } catch (error) {
          console.warn('Error resetting provider metrics:', error);
        }
      }
    });

    await Promise.allSettled(resetPromises);

    // Clear registry
    Object.keys(this.registry).forEach((key) => {
      delete this.registry[key as ProviderName];
    });
  }

  // =============================================================================
  // Private Provider Initialization Methods
  // =============================================================================

  private async initializeCerebras(): Promise<void> {
    try {
      const provider = createCerebrasProvider(this.environment);
      this.registry.cerebras = provider;
    } catch (error) {
      console.warn('Failed to initialize Cerebras provider:', error);
    }
  }

  private async initializeGemini(): Promise<void> {
    try {
      const provider = createGeminiProvider(this.environment);
      this.registry.gemini = provider;
    } catch (error) {
      console.warn('Failed to initialize Gemini provider:', error);
    }
  }

  private async initializeGroq(): Promise<void> {
    try {
      const provider = createGroqProvider(this.environment);
      this.registry.groq = provider;
    } catch (error) {
      console.warn('Failed to initialize Groq provider:', error);
    }
  }

  private loadFactoryConfig(env: Record<string, string | undefined>): ProviderFactoryConfig {
    return {
      enableCerebras: env.ENABLE_CEREBRAS !== 'false',
      enableGemini: env.ENABLE_GEMINI !== 'false',
      enableGroq: env.ENABLE_GROQ !== 'false',
      defaultProvider: (env.DEFAULT_PROVIDER as ProviderName) || 'groq',
      fallbackChain: (env.FALLBACK_CHAIN?.split(',') as ProviderName[]) || [
        'groq',
        'gemini',
        'cerebras',
      ],
      healthCheckInterval: parseInt(env.HEALTH_CHECK_INTERVAL || '60000', 10), // 1 minute
      autoFailover: env.AUTO_FAILOVER !== 'false',
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.warn('Health check cycle failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const providers = this.getAllProviders();
    const healthPromises = Object.entries(providers).map(async ([name, provider]) => {
      try {
        const isAvailable = await provider.isAvailable();
        const hasCapacity = await provider.hasCapacity();
        const status = await provider.getStatus();

        return {
          name: name as ProviderName,
          available: isAvailable,
          hasCapacity,
          status,
        };
      } catch (error) {
        return {
          name: name as ProviderName,
          available: false,
          hasCapacity: false,
          status: null,
          error: error as Error,
        };
      }
    });

    const results = await Promise.allSettled(healthPromises);

    // Log health status (in production, this would go to observability system)
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { name, available } = result.value;
        if (!available) {
          console.warn(`Provider ${name} is not available`);
        }
      }
    });
  }

  private calculateAggregatedMetrics(
    providerMetrics: { name: ProviderName; metrics: ProviderMetrics }[]
  ): AggregatedMetrics {
    if (providerMetrics.length === 0) {
      return {
        totalRequests: 0,
        totalSuccessful: 0,
        totalFailed: 0,
        overallSuccessRate: 0,
        averageLatency: 0,
        totalTokensProcessed: 0,
        totalCost: 0,
        providerBreakdown: {} as Record<ProviderName, ProviderSummary>,
      };
    }

    const totals = providerMetrics.reduce(
      (acc, { metrics }) => ({
        requests: acc.requests + metrics.requestCount,
        successful: acc.successful + metrics.successfulRequests,
        failed: acc.failed + metrics.failedRequests,
        tokens: acc.tokens + metrics.totalTokensProcessed,
        cost: acc.cost + metrics.totalCostUsd,
        latency: acc.latency + metrics.averageLatencyMs * metrics.requestCount,
      }),
      { requests: 0, successful: 0, failed: 0, tokens: 0, cost: 0, latency: 0 }
    );

    const providerBreakdown = {} as Record<ProviderName, ProviderSummary>;
    providerMetrics.forEach(({ name, metrics }) => {
      providerBreakdown[name] = {
        requestCount: metrics.requestCount,
        successRate:
          metrics.requestCount > 0 ? metrics.successfulRequests / metrics.requestCount : 0,
        averageLatency: metrics.averageLatencyMs,
        tokensProcessed: metrics.totalTokensProcessed,
        cost: metrics.totalCostUsd,
      };
    });

    return {
      totalRequests: totals.requests,
      totalSuccessful: totals.successful,
      totalFailed: totals.failed,
      overallSuccessRate: totals.requests > 0 ? totals.successful / totals.requests : 0,
      averageLatency: totals.requests > 0 ? totals.latency / totals.requests : 0,
      totalTokensProcessed: totals.tokens,
      totalCost: totals.cost,
      providerBreakdown,
    };
  }
}

// =============================================================================
// Supporting Interfaces
// =============================================================================

interface AggregatedMetrics {
  readonly totalRequests: number;
  readonly totalSuccessful: number;
  readonly totalFailed: number;
  readonly overallSuccessRate: number;
  readonly averageLatency: number;
  readonly totalTokensProcessed: number;
  readonly totalCost: number;
  readonly providerBreakdown: Record<ProviderName, ProviderSummary>;
}

interface ProviderSummary {
  readonly requestCount: number;
  readonly successRate: number;
  readonly averageLatency: number;
  readonly tokensProcessed: number;
  readonly cost: number;
}

// =============================================================================
// Factory Singleton and Exports
// =============================================================================

let factoryInstance: ProviderFactory | null = null;

/**
 * Get or create the provider factory singleton
 * Constitutional requirement: Centralized configuration management
 */
export function getProviderFactory(
  environment?: Record<string, string | undefined>
): ProviderFactory {
  if (!factoryInstance) {
    if (!environment) {
      throw new Error('Environment must be provided for first-time factory creation');
    }
    factoryInstance = new ProviderFactory(environment);
  }
  return factoryInstance;
}

/**
 * Reset the factory singleton (mainly for testing)
 */
export function resetProviderFactory(): void {
  if (factoryInstance) {
    factoryInstance.shutdown().catch(console.warn);
    factoryInstance = null;
  }
}

/**
 * Create a new provider factory instance (for testing or specific use cases)
 */
export function createProviderFactory(
  environment: Record<string, string | undefined>
): ProviderFactory {
  return new ProviderFactory(environment);
}
