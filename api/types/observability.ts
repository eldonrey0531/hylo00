/**
 * LangSmith tracing and observability interfaces for LLM routing infrastructure
 *
 * This file defines types for LangSmith integration ensuring constitutional
 * compliance with observable AI operations requirement.
 */

import type { ProviderName, ComplexityLevel, TokenUsage } from './index.js';

// =============================================================================
// LangSmith Core Types
// =============================================================================

/**
 * LangSmith run types for tracing LLM operations
 * Constitutional requirement: Observable AI operations
 */
export type LangSmithRunType =
  | 'llm' // Direct LLM provider call
  | 'chain' // Multi-step operation
  | 'tool' // Function/tool call
  | 'retriever' // Information retrieval
  | 'agent' // Agent decision
  | 'parser' // Output parsing
  | 'prompt' // Prompt template
  | 'routing'; // Provider routing decision

/**
 * LangSmith run status tracking
 */
export type LangSmithRunStatus = 'pending' | 'running' | 'success' | 'error';

/**
 * Core LangSmith run interface
 * Tracks individual operations in the LLM routing pipeline
 */
export interface LangSmithRun {
  readonly id: string;
  readonly name: string;
  readonly runType: LangSmithRunType;
  readonly status: LangSmithRunStatus;
  readonly startTime: number; // Unix timestamp in milliseconds
  readonly endTime?: number;
  readonly parentRunId?: string;
  readonly sessionId?: string;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: LangSmithError;
  readonly metadata: LangSmithRunMetadata;
  readonly tags: string[];
  readonly extra?: Record<string, unknown>;
}

/**
 * LangSmith run metadata for enhanced observability
 */
export interface LangSmithRunMetadata {
  readonly provider?: ProviderName;
  readonly complexity?: ComplexityLevel;
  readonly modelName?: string;
  readonly tokenUsage?: TokenUsage;
  readonly latencyMs?: number;
  readonly costUsd?: number;
  readonly retryAttempt?: number;
  readonly fallbackLevel?: number;
  readonly edgeRegion?: string;
  readonly coldStart?: boolean;
  readonly requestId?: string;
  readonly userId?: string;
  readonly customMetrics?: Record<string, number>;
}

/**
 * LangSmith error tracking
 */
export interface LangSmithError {
  readonly type: string;
  readonly message: string;
  readonly stackTrace?: string;
  readonly provider?: ProviderName;
  readonly errorCode?: string;
  readonly retryable?: boolean;
}

// =============================================================================
// Tracing Context and Sessions
// =============================================================================

/**
 * LangSmith tracing context
 * Maintains trace state across async operations
 */
export interface LangSmithTracingContext {
  readonly traceId: string;
  readonly sessionId?: string;
  readonly userId?: string;
  readonly parentRunId?: string;
  readonly tags: string[];
  readonly metadata: Record<string, unknown>;
}

/**
 * LangSmith session for grouping related operations
 * Constitutional compliance: User journey tracking
 */
export interface LangSmithSession {
  readonly id: string;
  readonly name?: string;
  readonly userId?: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly metadata: Record<string, unknown>;
  readonly tags: string[];
  readonly totalRuns: number;
  readonly totalCost: number;
  readonly totalTokens: number;
  readonly averageLatency: number;
}

// =============================================================================
// Provider-Specific Tracing
// =============================================================================

/**
 * Provider operation tracing data
 * Tracks individual LLM provider interactions
 */
export interface ProviderTrace {
  readonly provider: ProviderName;
  readonly operation: 'generate' | 'stream' | 'health_check' | 'capacity_check';
  readonly startTime: number;
  readonly endTime?: number;
  readonly request: ProviderTraceRequest;
  readonly response?: ProviderTraceResponse;
  readonly error?: LangSmithError;
  readonly metadata: ProviderTraceMetadata;
}

export interface ProviderTraceRequest {
  readonly model?: string;
  readonly prompt?: string;
  readonly messages?: unknown[];
  readonly parameters?: Record<string, unknown>;
  readonly estimatedTokens?: number;
}

export interface ProviderTraceResponse {
  readonly content?: string;
  readonly usage?: TokenUsage;
  readonly finishReason?: string;
  readonly streamChunks?: number;
}

export interface ProviderTraceMetadata {
  readonly requestId: string;
  readonly retryAttempt: number;
  readonly fallbackLevel: number;
  readonly rateLimited: boolean;
  readonly cached: boolean;
  readonly regionUsed?: string;
  readonly modelVersion?: string;
}

// =============================================================================
// Routing Decision Tracing
// =============================================================================

/**
 * Routing decision tracing for transparency
 * Constitutional requirement: Observable routing logic
 */
export interface RoutingTrace {
  readonly routingId: string;
  readonly complexity: ComplexityAnalysisTrace;
  readonly providerSelection: ProviderSelectionTrace;
  readonly fallback: FallbackTrace[];
  readonly finalDecision: RoutingDecisionTrace;
  readonly timing: RoutingTimingTrace;
}

export interface ComplexityAnalysisTrace {
  readonly detected: ComplexityLevel;
  readonly score: number;
  readonly factors: ComplexityFactorTrace[];
  readonly patterns: string[];
  readonly reasoning: string;
  readonly processingTimeMs: number;
}

export interface ComplexityFactorTrace {
  readonly type: string;
  readonly value: number;
  readonly weight: number;
  readonly contribution: number;
  readonly description: string;
}

export interface ProviderSelectionTrace {
  readonly candidates: ProviderCandidateTrace[];
  readonly selected: ProviderName;
  readonly reasoning: string;
  readonly selectionTimeMs: number;
}

export interface ProviderCandidateTrace {
  readonly provider: ProviderName;
  readonly available: boolean;
  readonly capacity: number;
  readonly score: number;
  readonly estimatedLatency: number;
  readonly estimatedCost: number;
  readonly weight: number;
  readonly reasonForRejection?: string;
}

export interface FallbackTrace {
  readonly level: number;
  readonly originalProvider: ProviderName;
  readonly fallbackProvider: ProviderName;
  readonly reason: string;
  readonly successful: boolean;
  readonly latencyMs: number;
}

export interface RoutingDecisionTrace {
  readonly finalProvider: ProviderName;
  readonly totalLatencyMs: number;
  readonly fallbacksUsed: number;
  readonly confidence: number;
  readonly reasoning: string;
}

export interface RoutingTimingTrace {
  readonly complexityAnalysisMs: number;
  readonly providerSelectionMs: number;
  readonly totalRoutingMs: number;
  readonly fallbackTimeMs: number;
}

// =============================================================================
// Cost and Usage Tracking
// =============================================================================

/**
 * Cost tracking for budget management
 * Constitutional requirement: Cost-conscious design
 */
export interface CostTrace {
  readonly provider: ProviderName;
  readonly operation: string;
  readonly tokenUsage: TokenUsage;
  readonly costBreakdown: CostBreakdown;
  readonly budgetImpact: BudgetImpact;
  readonly timestamp: number;
}

export interface CostBreakdown {
  readonly inputTokenCost: number;
  readonly outputTokenCost: number;
  readonly requestCost: number;
  readonly totalCost: number;
  readonly currency: 'USD';
}

export interface BudgetImpact {
  readonly dailySpent: number;
  readonly dailyBudget: number;
  readonly remainingBudget: number;
  readonly percentageUsed: number;
  readonly projectedDailySpend: number;
  readonly budgetExceeded: boolean;
}

/**
 * Performance trend indicators
 */
export type TrendIndicator = 'improving' | 'stable' | 'degrading';

/**
 * Usage analytics for optimization
 */
export interface UsageTrace {
  readonly timeWindow: 'hour' | 'day' | 'week' | 'month';
  readonly startTime: number;
  readonly endTime: number;
  readonly metrics: UsageMetrics;
  readonly trends: UsageTrends;
  readonly alerts: UsageAlert[];
}

export interface UsageMetrics {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly averageLatency: number;
  readonly providerDistribution: Record<ProviderName, number>;
  readonly complexityDistribution: Record<ComplexityLevel, number>;
}

export interface UsageTrends {
  readonly requestGrowthRate: number;
  readonly costGrowthRate: number;
  readonly latencyTrend: TrendIndicator;
  readonly errorRateTrend: TrendIndicator;
  readonly providerPerformanceTrend: Record<ProviderName, TrendIndicator>;
}

export interface UsageAlert {
  readonly type: 'cost' | 'error_rate' | 'latency' | 'capacity';
  readonly severity: 'info' | 'warning' | 'critical';
  readonly message: string;
  readonly threshold: number;
  readonly currentValue: number;
  readonly timestamp: number;
  readonly actionRequired: boolean;
}

// =============================================================================
// Performance Monitoring
// =============================================================================

/**
 * Performance metrics collection
 * Constitutional requirement: Observable operations
 */
export interface PerformanceTrace {
  readonly operation: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly resourceUsage: ResourceUsageTrace;
  readonly providerMetrics: ProviderPerformanceTrace[];
  readonly systemMetrics: SystemPerformanceTrace;
}

export interface ResourceUsageTrace {
  readonly memoryUsageMb: number;
  readonly memoryLimitMb: number;
  readonly cpuUtilization?: number;
  readonly networkLatencyMs?: number;
  readonly edgeRegion?: string;
  readonly coldStart: boolean;
}

export interface ProviderPerformanceTrace {
  readonly provider: ProviderName;
  readonly requestCount: number;
  readonly successRate: number;
  readonly averageLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly errorRate: number;
  readonly capacityUtilization: number;
  readonly costPerRequest: number;
}

export interface SystemPerformanceTrace {
  readonly totalThroughput: number;
  readonly activeConnections: number;
  readonly queuedRequests: number;
  readonly rateLimitHits: number;
  readonly cacheHitRate: number;
  readonly overallErrorRate: number;
}

// =============================================================================
// Error and Exception Tracking
// =============================================================================

/**
 * Comprehensive error tracking
 * Constitutional requirement: Graceful degradation
 */
export interface ErrorTrace {
  readonly errorId: string;
  readonly type: ErrorType;
  readonly severity: ErrorSeverity;
  readonly provider?: ProviderName;
  readonly operation: string;
  readonly message: string;
  readonly stackTrace?: string;
  readonly context: ErrorContext;
  readonly resolution: ErrorResolution;
  readonly timestamp: number;
}

export type ErrorType =
  | 'provider_error'
  | 'rate_limit'
  | 'timeout'
  | 'validation_error'
  | 'authentication_error'
  | 'configuration_error'
  | 'internal_error'
  | 'network_error';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  readonly requestId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly complexity?: ComplexityLevel;
  readonly retryAttempt: number;
  readonly fallbackLevel: number;
  readonly environment: Record<string, unknown>;
}

export interface ErrorResolution {
  readonly strategy: 'retry' | 'fallback' | 'fail_fast' | 'degrade_gracefully';
  readonly successful: boolean;
  readonly resolutionTimeMs: number;
  readonly finalProvider?: ProviderName;
  readonly userImpact: 'none' | 'minor' | 'major' | 'severe';
}

// =============================================================================
// LangSmith Integration Types
// =============================================================================

/**
 * LangSmith client configuration
 */
export interface LangSmithConfig {
  readonly apiKey: string;
  readonly projectName: string;
  readonly endpoint?: string;
  readonly tracingEnabled: boolean;
  readonly debugMode: boolean;
  readonly batchSize: number;
  readonly flushInterval: number;
  readonly maxRetries: number;
}

/**
 * LangSmith client interface
 */
export interface LangSmithClient {
  // Run management
  createRun(run: Omit<LangSmithRun, 'id'>): Promise<string>;
  updateRun(runId: string, updates: Partial<LangSmithRun>): Promise<void>;
  endRun(runId: string, outputs?: Record<string, unknown>, error?: LangSmithError): Promise<void>;

  // Session management
  createSession(session: Omit<LangSmithSession, 'id'>): Promise<string>;
  updateSession(sessionId: string, updates: Partial<LangSmithSession>): Promise<void>;

  // Tracing utilities
  withTracing<T>(operation: () => Promise<T>, context: LangSmithTracingContext): Promise<T>;
  recordCost(costTrace: CostTrace): Promise<void>;
  recordError(errorTrace: ErrorTrace): Promise<void>;

  // Health and configuration
  isHealthy(): Promise<boolean>;
  flush(): Promise<void>;
  close(): Promise<void>;
}

/**
 * LangSmith batch operations for performance
 */
export interface LangSmithBatch {
  readonly runs: LangSmithRun[];
  readonly costs: CostTrace[];
  readonly errors: ErrorTrace[];
  readonly performance: PerformanceTrace[];
  readonly batchId: string;
  readonly timestamp: number;
  readonly size: number;
}

// =============================================================================
// Observability Utilities
// =============================================================================

/**
 * Observability helper functions
 */
export interface ObservabilityUtils {
  // Trace creation
  createTrace(
    name: string,
    type: LangSmithRunType,
    context?: LangSmithTracingContext
  ): LangSmithRun;
  createProviderTrace(provider: ProviderName, operation: string): ProviderTrace;
  createRoutingTrace(routingId: string): RoutingTrace;

  // Metrics calculation
  calculateCost(usage: TokenUsage, provider: ProviderName): CostBreakdown;
  calculateUsageMetrics(traces: LangSmithRun[]): UsageMetrics;
  detectUsageAlerts(metrics: UsageMetrics): UsageAlert[];

  // Error handling
  categorizeError(error: Error, provider?: ProviderName): ErrorType;
  calculateErrorSeverity(error: ErrorTrace): ErrorSeverity;

  // Performance analysis
  analyzePerformance(traces: LangSmithRun[]): PerformanceTrace;
  calculateTrends(historical: UsageMetrics[]): UsageTrends;
}

// =============================================================================
// Constants and Defaults
// =============================================================================

export const LANGSMITH_DEFAULTS = {
  endpoint: 'https://api.smith.langchain.com',
  batchSize: 100,
  flushInterval: 5000, // 5 seconds
  maxRetries: 3,
  tracingEnabled: true,
  debugMode: false,
} as const;

export const STANDARD_TAGS = {
  environment: ['development', 'staging', 'production'],
  provider: ['cerebras', 'gemini', 'groq'],
  complexity: ['low', 'medium', 'high'],
  operation: ['route', 'generate', 'stream', 'health_check'],
  fallback: ['none', 'provider', 'degraded'],
} as const;

export const COST_TRACKING_PRECISION = 6; // 6 decimal places for USD amounts
export const LATENCY_TRACKING_PRECISION = 2; // 2 decimal places for milliseconds
