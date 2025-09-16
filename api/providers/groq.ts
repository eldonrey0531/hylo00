/**
 * Groq Provider Implementation
 *
 * Implements the LLMProvider interface for Groq integration
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
import type { GroqConfig } from '../types/providers.js';
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
 * Groq provider implementation
 * Optimized for speed and low-complexity queries
 */
export class GroqProvider implements LLMProvider {
  readonly name = 'groq' as const;
  readonly preferredComplexity: ComplexityLevel = 'low';
  readonly maxConcurrentRequests = 20;
  readonly timeoutMs = 10000; // Shorter timeout for speed
  readonly retryAttempts = 2; // Fewer retries for speed

  private readonly config: GroqConfig;
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

  constructor(config: GroqConfig) {
    this.config = config;

    if (!config.enabled) {
      throw new Error('Groq provider is not enabled');
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

      // Mock implementation for now - replace with actual Groq API calls
      const response: LLMResponse = {
        response: `Groq fast response for: ${validatedRequest.query}`,
        metadata: {
          providerUsed: 'groq',
          complexityDetected: 'low',
          routingDecision: {
            selectedProvider: 'groq',
            reasoning: 'Low complexity query routed to Groq for maximum speed',
            candidateProviders: [],
            complexityScore: 0.2,
            fallbackChain: ['gemini', 'cerebras'],
          },
          latencyMs: Date.now() - startTime,
          requestId: validatedRequest.metadata?.requestId || 'groq-' + Date.now(),
          timestamp: new Date().toISOString(),
        },
        usage: {
          inputTokens: Math.ceil(validatedRequest.query.length / 4),
          outputTokens: 60,
          totalTokens: Math.ceil(validatedRequest.query.length / 4) + 60,
          estimatedCostUsd: 0.0003, // Lowest cost
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
        // Mock streaming implementation - fastest streaming
        const response = `Groq ultra-fast streaming response for: ${validatedRequest.query}`;
        const chunks = response.split(' ');

        let index = 0;
        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue({
              content: chunks[index] + ' ',
              isComplete: false,
            });
            index++;
            setTimeout(sendChunk, 10); // 10ms delay - fastest streaming
          } else {
            controller.enqueue({
              content: '',
              isComplete: true,
              metadata: {
                providerUsed: 'groq',
                complexityDetected: 'low',
                latencyMs: index * 10,
                requestId: validatedRequest.metadata?.requestId || 'groq-stream-' + Date.now(),
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
      // Mock availability check - replace with actual Groq health endpoint
      return this.config.enabled;
    } catch {
      return false;
    }
  }

  async hasCapacity(): Promise<boolean> {
    // Mock capacity check - Groq has excellent speed but may have capacity limits
    return this.config.enabled && this.metrics.capacityUtilization < 0.95;
  }

  async getStatus(): Promise<ProviderStatus> {
    const available = await this.isAvailable();
    const hasCapacity = await this.hasCapacity();

    if (!available) return 'unavailable';
    if (!hasCapacity || this.metrics.errorRate > 0.05) return 'degraded';
    return 'active';
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

    // Update capacity utilization (mock calculation - Groq handles high traffic but has limits)
    this.metrics.capacityUtilization = Math.min(this.metrics.requestCount / 200, 1);

    // Update timestamp
    this.metrics.lastRequestTimestamp = new Date().toISOString();
  }

  private updateErrorMetrics(): void {
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.requestCount;
    this.metrics.availability = this.metrics.successfulRequests / this.metrics.requestCount;
  }

  private createErrorInfo(error: Error, request: LLMRequest): ErrorInfo {
    return {
      code: 'GROQ_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: request.metadata?.requestId,
      provider: 'groq',
      details: {
        originalError: error.name,
        stack: error.stack,
      },
    };
  }
}

/**
 * Factory function to create Groq provider from environment
 * Constitutional requirement: Configuration management
 */
export function createGroqProvider(env: Record<string, string | undefined>): GroqProvider {
  // Create a minimal config that matches the GroqConfig interface
  const config: GroqConfig = {
    enabled: env.GROQ_ENABLED !== 'false', // Default to enabled
    apiKeys: {
      primary: env.GROQ_API_KEY || '',
      secondary: env.GROQ_API_KEY_2,
      tertiary: env.GROQ_API_KEY_3,
    },
    maxTokens: parseInt(env.GROQ_MAX_TOKENS || '4096', 10),
    timeout: parseInt(env.GROQ_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(env.GROQ_RETRY_ATTEMPTS || '2', 10),
    rateLimits: {
      requestsPerMinute: parseInt(env.GROQ_RATE_LIMIT_RPM || '200', 10),
      tokensPerMinute: parseInt(env.GROQ_RATE_LIMIT_TPM || '300000', 10),
    },
    costs: {
      inputTokenCost: parseFloat(env.GROQ_INPUT_TOKEN_COST || '0.0000003'),
      outputTokenCost: parseFloat(env.GROQ_OUTPUT_TOKEN_COST || '0.0000006'),
      requestCost: parseFloat(env.GROQ_REQUEST_COST || '0'),
    },
    routing: {
      weight: parseFloat(env.GROQ_WEIGHT || '1.0'),
      priority: parseInt(env.GROQ_PRIORITY || '3', 10),
      preferredComplexity: 'low',
    },
    keyRotation: {
      enabled: env.GROQ_KEY_ROTATION !== 'false',
      strategy: (env.GROQ_KEY_STRATEGY as any) || 'quota-based',
      failoverThreshold: parseFloat(env.GROQ_FAILOVER_THRESHOLD || '0.9'),
    },
    provider: 'groq',
    modelName: env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    features: {
      supportsStreaming: true,
      supportsJSONMode: env.GROQ_JSON_MODE !== 'false',
      supportsToolCalls: env.GROQ_TOOL_CALLS !== 'false',
      maxContextTokens: parseInt(env.GROQ_MAX_CONTEXT || '32768', 10),
      maxOutputTokens: parseInt(env.GROQ_MAX_OUTPUT || '4096', 10),
    },
    optimization: {
      prioritizeSpeed: env.GROQ_PRIORITIZE_SPEED !== 'false',
      enableCaching: env.GROQ_CACHING !== 'false',
      useBatchProcessing: env.GROQ_BATCHING !== 'false',
    },
    performance: {
      expectedLatencyMs: parseInt(env.GROQ_EXPECTED_LATENCY || '500', 10),
      maxConcurrentRequests: parseInt(env.GROQ_MAX_CONCURRENT || '20', 10),
      requestQueueSize: parseInt(env.GROQ_QUEUE_SIZE || '100', 10),
    },
  };

  return new GroqProvider(config);
}
