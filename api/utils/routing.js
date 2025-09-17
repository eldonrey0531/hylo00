// LLM routing decision engine
import { estimateCost } from './observability.js';

export class RoutingEngine {
  constructor() {
    this.providerHealth = {
      groq: { available: true, latency: 100, quota: 1000 },
      cerebras: { available: true, latency: 200, quota: 500 },
      google: { available: true, latency: 150, quota: 750 },
    };
  }

  /**
   * Select the best provider based on complexity and availability
   */
  selectProvider(complexity = 'medium') {
    const routes = {
      high: ['cerebras', 'groq', 'google'],
      medium: ['groq', 'cerebras', 'google'],
      low: ['groq', 'google', 'cerebras'],
    };

    const fallbackChain = routes[complexity] || routes.medium;

    for (const provider of fallbackChain) {
      if (this.isProviderAvailable(provider)) {
        return {
          primary: provider,
          fallbacks: fallbackChain.filter((p) => p !== provider && this.isProviderAvailable(p)),
          complexity,
        };
      }
    }

    // If no provider is available, return the first one anyway with warning
    console.warn('⚠️ No providers available, using fallback');
    return {
      primary: fallbackChain[0],
      fallbacks: fallbackChain.slice(1),
      complexity,
    };
  }

  /**
   * Check if a provider is currently available
   */
  isProviderAvailable(provider) {
    const health = this.providerHealth[provider];
    return health && health.available && health.quota > 0;
  }

  /**
   * Update provider health status
   */
  updateProviderHealth(provider, status) {
    if (this.providerHealth[provider]) {
      this.providerHealth[provider] = { ...this.providerHealth[provider], ...status };
    }
  }

  /**
   * Get current provider health status
   */
  getProviderHealth() {
    return this.providerHealth;
  }

  /**
   * Determine complexity based on query characteristics
   */
  analyzeComplexity(query, context = {}) {
    // Simple heuristics for complexity analysis
    const queryLength = query.length;
    const hasMultipleSteps =
      query.includes('step') || query.includes('then') || query.includes('next');
    const hasComplexReasoning =
      query.includes('analyze') || query.includes('compare') || query.includes('evaluate');
    const isCreativeTask =
      query.includes('create') || query.includes('generate') || query.includes('design');

    // Travel-specific complexity indicators
    const isComplexTravel =
      query.includes('itinerary') || query.includes('multiple') || query.includes('budget');
    const hasConstraints = context.groups?.length > 1 || context.inclusions?.length > 3;

    let complexityScore = 0;

    if (queryLength > 500) complexityScore += 2;
    else if (queryLength > 200) complexityScore += 1;

    if (hasMultipleSteps) complexityScore += 2;
    if (hasComplexReasoning) complexityScore += 2;
    if (isCreativeTask) complexityScore += 1;
    if (isComplexTravel) complexityScore += 2;
    if (hasConstraints) complexityScore += 1;

    if (complexityScore >= 5) return 'high';
    if (complexityScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Get the appropriate model for a provider and complexity
   */
  getModelForProvider(provider, complexity = 'medium') {
    const models = {
      groq: {
        high: 'llama-3.3-70b-versatile',
        medium: 'llama-3.3-70b-versatile',
        low: 'llama-3.1-8b-instant',
      },
      cerebras: {
        high: 'llama3.1-70b',
        medium: 'llama3.1-70b',
        low: 'llama3.1-8b',
      },
      google: {
        high: 'gemini-1.5-pro',
        medium: 'gemini-1.5-flash',
        low: 'gemini-1.5-flash',
      },
    };

    return models[provider]?.[complexity] || models[provider]?.medium;
  }

  /**
   * Log routing decisions for monitoring
   */
  logRoutingDecision(decision, query, context) {
    console.log('🎯 ROUTING_DECISION:', {
      primary_provider: decision.primary,
      fallback_chain: decision.fallbacks,
      complexity: decision.complexity,
      query_length: query.length,
      context_size: Object.keys(context).length,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const router = new RoutingEngine();

// Fallback chain handler
export class FallbackHandler {
  constructor(router) {
    this.router = router;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  /**
   * Execute LLM call with automatic fallback
   */
  async executeWithFallback(operation, context, fallbackChain) {
    let lastError = null;
    let attemptCount = 0;

    for (const provider of [context.primary, ...context.fallbacks]) {
      try {
        attemptCount++;
        console.log(`🔄 Attempting provider: ${provider} (attempt ${attemptCount})`);

        const result = await operation(provider);

        // Update provider health on success
        this.router.updateProviderHealth(provider, { available: true });

        return {
          result,
          provider_used: provider,
          attempt_count: attemptCount,
          fallback_chain: [context.primary, ...context.fallbacks],
        };
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Provider ${provider} failed:`, error.message);

        // Update provider health on failure
        this.router.updateProviderHealth(provider, {
          available: false,
          lastError: error.message,
        });

        // Add delay before next attempt
        if (attemptCount < fallbackChain.length) {
          await this.delay(this.retryDelay * attemptCount);
        }
      }
    }

    // All providers failed
    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Delay utility for retry backoff
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const fallbackHandler = new FallbackHandler(router);
