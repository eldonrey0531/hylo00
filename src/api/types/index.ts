/**
 * Core TypeScript interfaces for LLM routing infrastructure
 *
 * This file defines the foundational types used throughout the multi-LLM routing system.
 * All interfaces follow constitutional requirements for type safety and edge-first architecture.
 */

// =============================================================================
// Core LLM Provider Interface
// =============================================================================

export type ComplexityLevel = 'low' | 'medium' | 'high';
export type ProviderName = 'cerebras' | 'gemini' | 'groq';
export type ProviderHealth = 'active' | 'degraded' | 'unavailable';

/**
 * Base interface for all LLM providers in the routing system
 * Ensures consistent API across Cerebras, Gemini, and Groq
 */
export interface LLMProvider {
  readonly name: ProviderName;
  readonly preferredComplexity: ComplexityLevel;
  readonly maxConcurrentRequests: number;
  readonly timeoutMs: number;
  readonly retryAttempts: number;

  // Provider availability and capacity
  isAvailable(): Promise<boolean>;
  hasCapacity(): Promise<boolean>;
  getStatus(): Promise<ProviderStatus>;

  // Core LLM operations
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
  generateStream(request: LLMRequest): Promise<ReadableStream<LLMStreamChunk>>;

  // Provider-specific metrics
  getMetrics(): Promise<ProviderMetrics>;
  resetMetrics(): Promise<void>;
}

// =============================================================================
// Request/Response Types
// =============================================================================

/**
 * Standard request format for all LLM providers
 * Includes constitutional compliance for input validation
 */
export interface LLMRequest {
  readonly query: string;
  readonly options?: LLMOptions;
  readonly metadata?: LLMRequestMetadata;
}

export interface LLMOptions {
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly stream?: boolean;
  readonly stopSequences?: string[];
  readonly presencePenalty?: number;
  readonly frequencyPenalty?: number;
}

export interface LLMRequestMetadata {
  readonly sessionId?: string;
  readonly userId?: string;
  readonly complexityHint?: ComplexityLevel;
  readonly userPreference?: 'speed' | 'quality' | 'cost';
  readonly trackCosts?: boolean;
  readonly debug?: boolean;
  readonly requestId?: string;
  readonly timestamp?: string;
}

/**
 * Standard response format with observability data
 * Ensures constitutional compliance for transparency
 */
export interface LLMResponse {
  readonly response: string;
  readonly metadata: LLMResponseMetadata;
  readonly usage?: TokenUsage;
  readonly debug?: DebugInformation;
}

export interface LLMResponseMetadata {
  readonly providerUsed: ProviderName;
  readonly complexityDetected: ComplexityLevel;
  readonly routingDecision: RoutingDecision;
  readonly latencyMs: number;
  readonly requestId: string;
  readonly timestamp: string;
  readonly fallbackOccurred?: boolean;
  readonly originalProviderFailed?: ProviderName;
}

export interface LLMStreamChunk {
  readonly content: string;
  readonly isComplete: boolean;
  readonly metadata?: Partial<LLMResponseMetadata>;
}

// =============================================================================
// Routing and Complexity Analysis
// =============================================================================

/**
 * Routing decision information for transparency
 * Constitutional requirement for observable AI operations
 */
export interface RoutingDecision {
  readonly selectedProvider: ProviderName;
  readonly reasoning: string;
  readonly candidateProviders: ProviderCandidate[];
  readonly complexityScore: number;
  readonly fallbackChain: ProviderName[];
}

export interface ProviderCandidate {
  readonly name: ProviderName;
  readonly score: number;
  readonly available: boolean;
  readonly hasCapacity: boolean;
  readonly estimatedLatency: number;
  readonly estimatedCost: number;
}

/**
 * Complexity analysis results
 * Used for intelligent provider routing
 */
export interface ComplexityAnalysis {
  readonly level: ComplexityLevel;
  readonly score: number; // 0-1 normalized score
  readonly detectedPatterns: string[];
  readonly reasoning: string;
  readonly tokenEstimate: number;
  readonly factors: ComplexityFactor[];
}

export interface ComplexityFactor {
  readonly type:
    | 'query_length'
    | 'technical_terms'
    | 'multi_step'
    | 'context_depth'
    | 'output_format';
  readonly weight: number;
  readonly value: number;
  readonly description: string;
}

// =============================================================================
// Provider Metrics and Monitoring
// =============================================================================

/**
 * Provider performance metrics
 * Constitutional requirement for cost tracking and optimization
 */
export interface ProviderMetrics {
  readonly requestCount: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly averageLatencyMs: number;
  readonly totalTokensProcessed: number;
  readonly totalCostUsd: number;
  readonly lastRequestTimestamp?: string;
  readonly errorRate: number; // 0-1
  readonly availability: number; // 0-1
  readonly capacityUtilization: number; // 0-1
}

export interface TokenUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly estimatedCostUsd: number;
}

/**
 * System health status
 * Used for health monitoring endpoints
 */
export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: string;
  readonly version: string;
  readonly uptimeMs: number;
  readonly checks: HealthCheck[];
  readonly resources: ResourceMetrics;
  readonly metrics: SystemMetrics;
  readonly integrations: IntegrationStatus;
}

export interface HealthCheck {
  readonly name: string;
  readonly status: 'pass' | 'warn' | 'fail';
  readonly latencyMs?: number;
  readonly lastCheck: string;
  readonly error?: ErrorInfo;
}

export interface ResourceMetrics {
  readonly memory: {
    readonly usedMb: number;
    readonly limitMb: number;
    readonly percentage: number;
  };
  readonly runtime: {
    readonly platform: string;
    readonly version: string;
    readonly edgeRuntime: boolean;
  };
}

export interface SystemMetrics {
  readonly requests: {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly avgLatencyMs: number;
  };
  readonly rateLimiting: {
    readonly active: boolean;
    readonly blockedRequests: number;
    readonly windowRemainingMs: number;
  };
}

export interface IntegrationStatus {
  readonly langsmith: {
    readonly connected: boolean;
    readonly lastTrace?: string;
    readonly tracesSent: number;
    readonly errors: number;
  };
}

// =============================================================================
// Error Handling and Debugging
// =============================================================================

/**
 * Standardized error information
 * Constitutional requirement for graceful degradation
 */
export interface ErrorInfo {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly provider?: ProviderName;
}

/**
 * Debug information for development and troubleshooting
 * Only included when debug=true in request
 */
export interface DebugInformation {
  readonly complexityAnalysis: ComplexityAnalysis;
  readonly providerSelection: {
    readonly candidates: ProviderCandidate[];
    readonly selected: ProviderName;
    readonly reasoning: string;
  };
  readonly fallbackChain: ProviderName[];
  readonly timing: {
    readonly routingMs: number;
    readonly providerMs: number;
    readonly totalMs: number;
  };
  readonly environment: {
    readonly edgeRuntime: boolean;
    readonly region?: string;
    readonly coldStart: boolean;
  };
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Provider configuration
 * Used for runtime configuration and routing rules
 */
export interface ProviderConfig {
  readonly enabled: boolean;
  readonly apiKeys: {
    readonly primary: string;
    readonly secondary?: string;
    readonly tertiary?: string;
  };
  readonly baseUrl?: string;
  readonly maxTokens: number;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly rateLimits: {
    readonly requestsPerMinute: number;
    readonly tokensPerMinute: number;
  };
  readonly costs: {
    readonly inputTokenCost: number;
    readonly outputTokenCost: number;
    readonly requestCost: number;
  };
  readonly routing: {
    readonly weight: number;
    readonly priority: number;
    readonly preferredComplexity: ComplexityLevel;
  };
  readonly keyRotation: {
    readonly enabled: boolean;
    readonly strategy: 'round-robin' | 'quota-based' | 'performance-based';
    readonly failoverThreshold: number;
  };
}

export interface KeyStatus {
  readonly keyId: string;
  readonly type: 'primary' | 'secondary' | 'tertiary';
  readonly isActive: boolean;
  readonly quotaUsed: number;
  readonly quotaLimit: number;
  readonly quotaResetTime: number;
  readonly lastUsed: number;
  readonly errorCount: number;
  readonly successRate: number;
  readonly avgLatency: number;
}

export interface ProviderStatus {
  readonly provider: ProviderName;
  readonly isEnabled: boolean;
  readonly isHealthy: boolean;
  readonly isAvailable: boolean;
  readonly hasCapacity: boolean;
  readonly keys: KeyStatus[];
  readonly activeKeyId: string;
  readonly metrics: {
    readonly totalRequests: number;
    readonly successfulRequests: number;
    readonly failedRequests: number;
    readonly avgLatency: number;
    readonly totalCost: number;
    readonly tokensUsed: number;
  };
  readonly rateLimits: {
    readonly requestsPerMinute: number;
    readonly currentRpm: number;
    readonly tokensPerMinute: number;
    readonly currentTpm: number;
  };
  readonly lastHealthCheck: number;
  readonly nextQuotaReset: number;
}

export interface SystemStatus {
  readonly timestamp: number;
  readonly healthy: boolean;
  readonly providers: ProviderStatus[];
  readonly routing: {
    readonly totalRequests: number;
    readonly avgResponseTime: number;
    readonly successRate: number;
    readonly fallbackRate: number;
  };
  readonly observability: {
    readonly tracingEnabled: boolean;
    readonly healthyConnections: number;
    readonly queueSize: number;
    readonly lastFlush: number;
  };
}
export interface RoutingRules {
  readonly version: string;
  readonly updatedAt: string;
  readonly complexityRules: ComplexityRule[];
  readonly providerRouting: Record<ProviderName, ProviderConfig>;
  readonly fallbackChains: FallbackChain[];
  readonly rateLimiting: RateLimitingConfig;
  readonly costOptimization: CostOptimizationConfig;
}

export interface ComplexityRule {
  readonly pattern: string;
  readonly complexity: ComplexityLevel;
  readonly weight: number;
  readonly description: string;
}

export interface FallbackChain {
  readonly complexity: ComplexityLevel;
  readonly providers: ProviderName[];
  readonly conditions: FallbackCondition[];
}

export interface FallbackCondition {
  readonly type: 'error_rate' | 'latency' | 'capacity';
  readonly threshold: number;
}

export interface RateLimitingConfig {
  readonly global: {
    readonly requestsPerMinute: number;
    readonly requestsPerHour: number;
    readonly burstLimit: number;
  };
  readonly perProvider: Record<
    ProviderName,
    {
      readonly requestsPerMinute: number;
      readonly tokensPerMinute: number;
    }
  >;
}

export interface CostOptimizationConfig {
  readonly enabled: boolean;
  readonly dailyBudgetUsd: number;
  readonly providerCosts: Record<
    ProviderName,
    {
      readonly inputTokenCost: number;
      readonly outputTokenCost: number;
      readonly requestCost: number;
    }
  >;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * API response wrapper for all endpoints
 * Ensures consistent response format
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ErrorInfo;
  readonly requestId: string;
  readonly timestamp: string;
}

export interface ProviderStatusResponse {
  readonly providers: ProviderStatusInfo[];
}

export interface ProviderStatusInfo {
  readonly name: ProviderName;
  readonly status: ProviderStatus;
  readonly isAvailable: boolean;
  readonly hasCapacity: boolean;
  readonly complexity: ComplexityLevel;
  readonly lastChecked: string;
  readonly capacity: {
    readonly current: number;
    readonly maximum: number;
    readonly available: number;
  };
  readonly routing: {
    readonly weight: number;
    readonly priority: number;
    readonly preferredComplexity: ComplexityLevel;
  };
  readonly metrics: {
    readonly avgLatencyMs: number;
    readonly successRate: number;
    readonly requestsPerMinute: number;
    readonly tokensPerMinute: number;
  };
  readonly error?: ErrorInfo;
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

export function isValidComplexity(value: string): value is ComplexityLevel {
  return ['low', 'medium', 'high'].includes(value);
}

export function isValidProvider(value: string): value is ProviderName {
  return ['cerebras', 'gemini', 'groq'].includes(value);
}

export function isValidProviderHealth(value: string): value is ProviderHealth {
  return ['active', 'degraded', 'unavailable'].includes(value);
}

// =============================================================================
// Constants
// =============================================================================

export const PROVIDER_NAMES: readonly ProviderName[] = ['cerebras', 'gemini', 'groq'] as const;
export const COMPLEXITY_LEVELS: readonly ComplexityLevel[] = ['low', 'medium', 'high'] as const;
export const PROVIDER_HEALTH_STATES: readonly ProviderHealth[] = [
  'active',
  'degraded',
  'unavailable',
] as const;

export const DEFAULT_OPTIONS: Required<LLMOptions> = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 1.0,
  topK: 50,
  stream: false,
  stopSequences: [],
  presencePenalty: 0,
  frequencyPenalty: 0,
} as const;

export const DEFAULT_TIMEOUTS = {
  cerebras: 30000, // 30 seconds for complex queries
  gemini: 20000, // 20 seconds for balanced queries
  groq: 10000, // 10 seconds for fast queries
} as const;

export const DEFAULT_RETRY_ATTEMPTS = {
  cerebras: 2,
  gemini: 2,
  groq: 3, // More retries for fastest provider
} as const;
