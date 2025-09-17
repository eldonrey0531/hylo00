/**
 * Cerebras AI Provider Implementation
 *
 * Implements the LLMProvider interface for Cerebras AI integration
 * with constitutional compliance for edge-first architecture and resilience.
 */

import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMStreamChunk,
  ProviderMetrics,
  ProviderStatus,
  ComplexityLevel,
  TokenUsage,
  ErrorInfo,
} from '../types/index.js';
import type { CerebrasConfig } from '../types/providers.js';
import { validateLLMRequest } from '../types/requests.js';

/**
 * Mutable metrics interface for internal tracking
 */
interface MutableMetrics {
  requestCount: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalTokensProcessed: number;
  totalCostUsd: number;
  errorRate: number;
  availability: number;
  capacityUtilization: number;
  lastRequestTimestamp?: string;
}

/**
 * Cerebras AI provider implementation
 * Specialized for complex, long-context operations
 */
export class CerebrasProvider implements LLMProvider {
  readonly name = 'cerebras' as const;
  readonly preferredComplexity: ComplexityLevel = 'high';
  readonly maxConcurrentRequests = 10;
  readonly timeoutMs = 30000;
  readonly retryAttempts = 3;

  private readonly config: CerebrasConfig;
  private metrics: MutableMetrics = {
    requestCount: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatencyMs: 0,
    totalTokensProcessed: 0,
    totalCostUsd: 0,
    errorRate: 0,
    availability: 1,
    capacityUtilization: 0,
  };

  constructor(config: CerebrasConfig) {
    this.config = config;

    if (!config.enabled) {
      throw new Error('Cerebras provider is not enabled');
    }
  }

  // =============================================================================
  // Core LLMProvider Interface Implementation
  // =============================================================================

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    this.metrics.requestCount++;

    try {
      // Constitutional requirement: Input validation
      const validatedRequest = validateLLMRequest(request);

      // Mock implementation for now - replace with actual Cerebras API calls
      const response: LLMResponse = {
        response: `Cerebras response for: ${validatedRequest.query}`,
        metadata: {
          providerUsed: 'cerebras',
          complexityDetected: 'high',
          routingDecision: {
            selectedProvider: 'cerebras',
            reasoning: 'High complexity query routed to Cerebras',
            candidateProviders: [],
            complexityScore: 0.8,
            fallbackChain: ['gemini', 'groq'],
          },
          latencyMs: Date.now() - startTime,
          requestId: validatedRequest.metadata?.requestId || 'cerebras-' + Date.now(),
          timestamp: new Date().toISOString(),
        },
        usage: {
          inputTokens: Math.ceil(validatedRequest.query.length / 4),
          outputTokens: 100,
          totalTokens: Math.ceil(validatedRequest.query.length / 4) + 100,
          estimatedCostUsd: 0.001,
        },
      };

      this.metrics.successfulRequests++;
      this.updateMetrics(startTime, response.usage!);

      return response;
    } catch (error) {
      this.metrics.failedRequests++;
      this.updateErrorMetrics();
      throw this.createErrorInfo(error as Error, request);
    }
  }

  async generateStream(request: LLMRequest): Promise<ReadableStream<LLMStreamChunk>> {
    const validatedRequest = validateLLMRequest(request);

    return new ReadableStream<LLMStreamChunk>({
      start(controller) {
        // Mock streaming implementation
        const response = `Cerebras streaming response for: ${validatedRequest.query}`;
        const chunks = response.split(' ');

        let index = 0;
        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue({
              content: chunks[index] + ' ',
              isComplete: false,
            });
            index++;
            setTimeout(sendChunk, 50); // 50ms delay between chunks
          } else {
            controller.enqueue({
              content: '',
              isComplete: true,
              metadata: {
                providerUsed: 'cerebras',
                complexityDetected: 'high',
                latencyMs: index * 50,
                requestId: validatedRequest.metadata?.requestId || 'cerebras-stream-' + Date.now(),
                timestamp: new Date().toISOString(),
              },
            });
            controller.close();
          }
        };

        sendChunk();
      },
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Mock availability check - replace with actual health endpoint
      return this.config.enabled;
    } catch {
      return false;
    }
  }

  async hasCapacity(): Promise<boolean> {
    // Mock capacity check - Cerebras typically has good capacity for high-complexity tasks
    return this.config.enabled && this.metrics.capacityUtilization < 0.8;
  }

  async getStatus(): Promise<ProviderStatus> {
    const available = await this.isAvailable();
    const hasCapacity = await this.hasCapacity();

    return {
      provider: 'cerebras',
      isEnabled: this.config.enabled,
      isHealthy: available && this.metrics.errorRate < 0.1,
      isAvailable: available,
      hasCapacity,
      keys: [
        {
          keyId: 'primary',
          type: 'primary',
          isActive: true,
          quotaUsed: 0,
          quotaLimit: 1000000,
          quotaResetTime: Date.now() + 86400000,
          lastUsed: Date.now(),
          errorCount: this.metrics.failedRequests,
          successRate:
            this.metrics.requestCount > 0
              ? this.metrics.successfulRequests / this.metrics.requestCount
              : 1,
          avgLatency: this.metrics.averageLatencyMs,
        },
      ],
      activeKeyId: 'primary',
      metrics: {
        totalRequests: this.metrics.requestCount,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        avgLatency: this.metrics.averageLatencyMs,
        totalCost: this.metrics.totalCostUsd,
        tokensUsed: this.metrics.totalTokensProcessed,
      },
      rateLimits: {
        requestsPerMinute: this.config.rateLimits.requestsPerMinute,
        currentRpm: 0, // Would need to track this in real implementation
        tokensPerMinute: this.config.rateLimits.tokensPerMinute,
        currentTpm: 0, // Would need to track this in real implementation
      },
      lastHealthCheck: Date.now(),
      nextQuotaReset: Date.now() + 86400000, // 24 hours
    };
  }

  async getMetrics(): Promise<ProviderMetrics> {
    return {
      ...this.metrics,
    } as ProviderMetrics;
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      requestCount: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatencyMs: 0,
      totalTokensProcessed: 0,
      totalCostUsd: 0,
      errorRate: 0,
      availability: 1,
      capacityUtilization: 0,
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private updateMetrics(startTime: number, usage: TokenUsage): void {
    const latency = Date.now() - startTime;

    // Update average latency
    this.metrics.averageLatencyMs =
      (this.metrics.averageLatencyMs * (this.metrics.requestCount - 1) + latency) /
      this.metrics.requestCount;

    // Update token and cost tracking
    this.metrics.totalTokensProcessed += usage.totalTokens;
    this.metrics.totalCostUsd += usage.estimatedCostUsd;

    // Update error rate
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.requestCount;

    // Update capacity utilization (mock calculation)
    this.metrics.capacityUtilization = Math.min(this.metrics.requestCount / 100, 1);
  }

  private updateErrorMetrics(): void {
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.requestCount;
    this.metrics.availability = this.metrics.successfulRequests / this.metrics.requestCount;
  }

  private createErrorInfo(error: Error, request: LLMRequest): ErrorInfo {
    return {
      code: 'CEREBRAS_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: request.metadata?.requestId,
      provider: 'cerebras',
      details: {
        originalError: error.name,
        stack: error.stack,
      },
    };
  }
}

/**
 * Factory function to create Cerebras provider from environment
 * Constitutional requirement: Configuration management
 */
export function createCerebrasProvider(env: Record<string, string | undefined>): CerebrasProvider {
  // Create a minimal config that matches the CerebrasConfig interface
  const config: CerebrasConfig = {
    provider: 'cerebras',
    modelName: env.CEREBRAS_MODEL || 'llama3.1-70b',
    endpoint: env.CEREBRAS_ENDPOINT || 'https://api.cerebras.ai/v1/chat/completions',
    enabled: env.CEREBRAS_ENABLED === 'true',
    apiKeys: {
      primary: env.CEREBRAS_API_KEY || '',
    },
    maxTokens: parseInt(env.CEREBRAS_MAX_TOKENS || '32768', 10),
    timeout: parseInt(env.CEREBRAS_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(env.CEREBRAS_RETRY_ATTEMPTS || '3', 10),
    rateLimits: {
      requestsPerMinute: parseInt(env.CEREBRAS_RATE_LIMIT_RPM || '60', 10),
      tokensPerMinute: parseInt(env.CEREBRAS_RATE_LIMIT_TPM || '100000', 10),
    },
    costs: {
      inputTokenCost: parseFloat(env.CEREBRAS_INPUT_TOKEN_COST || '0.000001'),
      outputTokenCost: parseFloat(env.CEREBRAS_OUTPUT_TOKEN_COST || '0.000001'),
      requestCost: parseFloat(env.CEREBRAS_REQUEST_COST || '0'),
    },
    routing: {
      weight: parseInt(env.CEREBRAS_WEIGHT || '10', 10),
      priority: parseInt(env.CEREBRAS_PRIORITY || '1', 10),
      preferredComplexity: 'high' as const,
    },
    keyRotation: {
      enabled: env.CEREBRAS_KEY_ROTATION === 'true',
      strategy: 'round-robin' as const,
      failoverThreshold: parseFloat(env.CEREBRAS_FAILOVER_THRESHOLD || '0.1'),
    },
    features: {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsSystemPrompts: true,
      maxContextTokens: parseInt(env.CEREBRAS_MAX_CONTEXT || '128000', 10),
      maxOutputTokens: parseInt(env.CEREBRAS_MAX_OUTPUT || '8192', 10),
    },
    optimization: {
      preferLargeContext: true,
      enableParallelProcessing: true,
      useAdvancedReasoning: true,
    },
  };

  return new CerebrasProvider(config);
}
