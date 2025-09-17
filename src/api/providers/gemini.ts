/**
 * Google Gemini Provider Implementation
 *
 * Implements the LLMProvider interface for Google Gemini integration
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
import type { GeminiConfig } from '../types/providers.js';
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
 * Google Gemini provider implementation
 * Balanced for medium complexity with cost optimization
 */
export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini' as const;
  readonly preferredComplexity: ComplexityLevel = 'medium';
  readonly maxConcurrentRequests = 15;
  readonly timeoutMs = 20000;
  readonly retryAttempts = 3;

  private readonly config: GeminiConfig;
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

  constructor(config: GeminiConfig) {
    this.config = config;

    if (!config.enabled) {
      throw new Error('Gemini provider is not enabled');
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

      // Mock implementation for now - replace with actual Gemini API calls
      const response: LLMResponse = {
        response: `Gemini response for: ${validatedRequest.query}`,
        metadata: {
          providerUsed: 'gemini',
          complexityDetected: 'medium',
          routingDecision: {
            selectedProvider: 'gemini',
            reasoning: 'Medium complexity query routed to Gemini for balanced performance',
            candidateProviders: [],
            complexityScore: 0.5,
            fallbackChain: ['groq', 'cerebras'],
          },
          latencyMs: Date.now() - startTime,
          requestId: validatedRequest.metadata?.requestId || 'gemini-' + Date.now(),
          timestamp: new Date().toISOString(),
        },
        usage: {
          inputTokens: Math.ceil(validatedRequest.query.length / 4),
          outputTokens: 80,
          totalTokens: Math.ceil(validatedRequest.query.length / 4) + 80,
          estimatedCostUsd: 0.0005,
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
        const response = `Gemini streaming response for: ${validatedRequest.query}`;
        const chunks = response.split(' ');

        let index = 0;
        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue({
              content: chunks[index] + ' ',
              isComplete: false,
            });
            index++;
            setTimeout(sendChunk, 30); // 30ms delay between chunks (faster than Cerebras)
          } else {
            controller.enqueue({
              content: '',
              isComplete: true,
              metadata: {
                providerUsed: 'gemini',
                complexityDetected: 'medium',
                latencyMs: index * 30,
                requestId: validatedRequest.metadata?.requestId || 'gemini-stream-' + Date.now(),
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
      // Mock availability check - replace with actual Gemini health endpoint
      return this.config.enabled;
    } catch {
      return false;
    }
  }

  async hasCapacity(): Promise<boolean> {
    // Mock capacity check - Gemini typically has good availability
    return this.config.enabled && this.metrics.capacityUtilization < 0.9;
  }

  async getStatus(): Promise<ProviderStatus> {
    const available = await this.isAvailable();
    const hasCapacity = await this.hasCapacity();

    return {
      provider: 'gemini',
      isEnabled: this.config.enabled,
      isHealthy: available && this.metrics.errorRate < 0.15,
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
        currentRpm: 0,
        tokensPerMinute: this.config.rateLimits.tokensPerMinute,
        currentTpm: 0,
      },
      lastHealthCheck: Date.now(),
      nextQuotaReset: Date.now() + 86400000,
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

    // Update capacity utilization (mock calculation - Gemini handles more traffic)
    this.metrics.capacityUtilization = Math.min(this.metrics.requestCount / 150, 1);

    // Update timestamp
    this.metrics.lastRequestTimestamp = new Date().toISOString();
  }

  private updateErrorMetrics(): void {
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.requestCount;
    this.metrics.availability = this.metrics.successfulRequests / this.metrics.requestCount;
  }

  private createErrorInfo(error: Error, request: LLMRequest): ErrorInfo {
    return {
      code: 'GEMINI_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: request.metadata?.requestId,
      provider: 'gemini',
      details: {
        originalError: error.name,
        stack: error.stack,
      },
    };
  }
}

/**
 * Factory function to create Gemini provider from environment
 * Constitutional requirement: Configuration management
 */
export function createGeminiProvider(env: Record<string, string | undefined>): GeminiProvider {
  // Create a minimal config that matches the GeminiConfig interface
  const config: GeminiConfig = {
    provider: 'gemini',
    apiKeyName: 'GEMINI_API_KEY',
    modelName: env.GEMINI_MODEL || 'gemini-1.5-flash',
    projectId: env.GEMINI_PROJECT_ID || '',
    location: env.GEMINI_LOCATION || 'us-central1',
    enabled: env.GEMINI_ENABLED === 'true',
    apiKeys: {
      primary: env.GEMINI_API_KEY || '',
    },
    maxTokens: parseInt(env.GEMINI_MAX_TOKENS || '8192', 10),
    timeout: parseInt(env.GEMINI_TIMEOUT || '20000', 10),
    retryAttempts: parseInt(env.GEMINI_RETRY_ATTEMPTS || '3', 10),
    rateLimits: {
      requestsPerMinute: parseInt(env.GEMINI_RATE_LIMIT_RPM || '100', 10),
      tokensPerMinute: parseInt(env.GEMINI_RATE_LIMIT_TPM || '200000', 10),
    },
    costs: {
      inputTokenCost: parseFloat(env.GEMINI_INPUT_TOKEN_COST || '0.0000005'),
      outputTokenCost: parseFloat(env.GEMINI_OUTPUT_TOKEN_COST || '0.0000015'),
      requestCost: parseFloat(env.GEMINI_REQUEST_COST || '0'),
    },
    routing: {
      weight: parseInt(env.GEMINI_WEIGHT || '8', 10),
      priority: parseInt(env.GEMINI_PRIORITY || '2', 10),
      preferredComplexity: 'medium' as const,
    },
    keyRotation: {
      enabled: env.GEMINI_KEY_ROTATION === 'true',
      strategy: 'round-robin' as const,
      failoverThreshold: parseFloat(env.GEMINI_FAILOVER_THRESHOLD || '0.15'),
    },
    features: {
      supportsMultimodal: true,
      supportsStreaming: true,
      supportsSafetySettings: true,
      maxContextTokens: parseInt(env.GEMINI_MAX_CONTEXT || '1000000', 10),
      maxOutputTokens: parseInt(env.GEMINI_MAX_OUTPUT || '8192', 10),
    },
    safetySettings: {
      harassmentThreshold: (env.GEMINI_HARASSMENT_THRESHOLD as any) || 'BLOCK_MEDIUM_AND_ABOVE',
      hateSpeechThreshold: (env.GEMINI_HATE_SPEECH_THRESHOLD as any) || 'BLOCK_MEDIUM_AND_ABOVE',
      sexuallyExplicitThreshold:
        (env.GEMINI_SEXUALLY_EXPLICIT_THRESHOLD as any) || 'BLOCK_MEDIUM_AND_ABOVE',
      dangerousContentThreshold:
        (env.GEMINI_DANGEROUS_CONTENT_THRESHOLD as any) || 'BLOCK_MEDIUM_AND_ABOVE',
    },
    optimization: {
      enableGrounding: env.GEMINI_GROUNDING !== 'false',
      useCodeExecution: env.GEMINI_CODE_EXECUTION === 'true',
      enableFactChecking: env.GEMINI_FACT_CHECKING === 'true',
    },
  };

  return new GeminiProvider(config);
}
