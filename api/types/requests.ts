/**
 * Request validation and response schemas for LLM routing infrastructure
 *
 * This file defines Zod schemas for runtime validation ensuring constitutional
 * compliance with type safety and input sanitization requirements.
 */

import { z } from 'zod';
import type { LLMRequest, LLMResponse, ApiResponse } from './index.js';

// =============================================================================
// Base Schema Definitions
// =============================================================================

export const ComplexityLevelSchema = z.enum(['low', 'medium', 'high']);
export const ProviderNameSchema = z.enum(['cerebras', 'gemini', 'groq']);
export const SimpleProviderStatusSchema = z.enum([
  'available',
  'degraded',
  'unavailable',
  'maintenance',
]);

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * LLM Options validation schema
 * Ensures all parameters are within safe ranges
 */
export const LLMOptionsSchema = z
  .object({
    maxTokens: z.number().int().min(1).max(8192).optional(),
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().int().min(1).max(100).optional(),
    stream: z.boolean().optional(),
    stopSequences: z.array(z.string().max(100)).max(4).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
  })
  .strict();

/**
 * Request metadata validation schema
 * Validates session tracking and user preferences
 */
export const LLMRequestMetadataSchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    userId: z.string().max(100).optional(),
    complexityHint: ComplexityLevelSchema.optional(),
    userPreference: z.enum(['speed', 'quality', 'cost']).optional(),
    trackCosts: z.boolean().optional(),
    debug: z.boolean().optional(),
    requestId: z.string().uuid().optional(),
    timestamp: z.string().datetime().optional(),
  })
  .strict();

/**
 * Main LLM request validation schema
 * Constitutional compliance: Input validation and sanitization
 */
export const LLMRequestSchema = z
  .object({
    query: z
      .string()
      .min(1, 'Query cannot be empty')
      .max(8000, 'Query exceeds maximum length')
      .refine((query) => query.trim().length > 0, 'Query cannot be only whitespace'),
    options: LLMOptionsSchema.optional(),
    metadata: LLMRequestMetadataSchema.optional(),
  })
  .strict();

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Token usage validation schema
 * Constitutional compliance: Cost tracking requirement
 */
export const TokenUsageSchema = z.object({
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  totalTokens: z.number().int().min(0),
  estimatedCostUsd: z.number().min(0),
});

/**
 * Routing decision validation schema
 * Constitutional compliance: Observable AI operations
 */
export const RoutingDecisionSchema = z.object({
  selectedProvider: ProviderNameSchema,
  reasoning: z.string().min(1),
  candidateProviders: z.array(
    z.object({
      name: ProviderNameSchema,
      score: z.number().min(0).max(1),
      available: z.boolean(),
      hasCapacity: z.boolean(),
      estimatedLatency: z.number().min(0),
      estimatedCost: z.number().min(0),
    })
  ),
  complexityScore: z.number().min(0).max(1),
  fallbackChain: z.array(ProviderNameSchema),
});

/**
 * Response metadata validation schema
 * Ensures transparency and observability
 */
export const LLMResponseMetadataSchema = z.object({
  providerUsed: ProviderNameSchema,
  complexityDetected: ComplexityLevelSchema,
  routingDecision: RoutingDecisionSchema,
  latencyMs: z.number().min(0),
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
  fallbackOccurred: z.boolean().optional(),
  originalProviderFailed: ProviderNameSchema.optional(),
});

/**
 * Debug information validation schema
 * Only included when debug=true
 */
export const DebugInformationSchema = z.object({
  complexityAnalysis: z.object({
    level: ComplexityLevelSchema,
    score: z.number().min(0).max(1),
    detectedPatterns: z.array(z.string()),
    reasoning: z.string(),
    tokenEstimate: z.number().int().min(0),
    factors: z.array(
      z.object({
        type: z.enum([
          'query_length',
          'technical_terms',
          'multi_step',
          'context_depth',
          'output_format',
        ]),
        weight: z.number().min(0).max(1),
        value: z.number().min(0),
        description: z.string(),
      })
    ),
  }),
  providerSelection: z.object({
    candidates: z.array(
      z.object({
        name: ProviderNameSchema,
        score: z.number().min(0).max(1),
        available: z.boolean(),
        hasCapacity: z.boolean(),
        estimatedLatency: z.number().min(0),
        estimatedCost: z.number().min(0),
      })
    ),
    selected: ProviderNameSchema,
    reasoning: z.string(),
  }),
  fallbackChain: z.array(ProviderNameSchema),
  timing: z.object({
    routingMs: z.number().min(0),
    providerMs: z.number().min(0),
    totalMs: z.number().min(0),
  }),
  environment: z.object({
    edgeRuntime: z.boolean(),
    region: z.string().optional(),
    coldStart: z.boolean(),
  }),
});

/**
 * Main LLM response validation schema
 */
export const LLMResponseSchema = z.object({
  response: z.string().min(1),
  metadata: LLMResponseMetadataSchema,
  usage: TokenUsageSchema.optional(),
  debug: DebugInformationSchema.optional(),
});

// =============================================================================
// API Endpoint Schemas
// =============================================================================

/**
 * Generic API response wrapper schema
 * Ensures consistent response format across all endpoints
 */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
        timestamp: z.string().datetime(),
        requestId: z.string().uuid().optional(),
        provider: ProviderNameSchema.optional(),
      })
      .optional(),
    requestId: z.string().uuid(),
    timestamp: z.string().datetime(),
  });

/**
 * Provider status response schema
 * Used for GET /api/llm/providers endpoint
 */
export const ProviderStatusInfoSchema = z.object({
  name: ProviderNameSchema,
  status: SimpleProviderStatusSchema,
  isAvailable: z.boolean(),
  hasCapacity: z.boolean(),
  complexity: ComplexityLevelSchema,
  lastChecked: z.string().datetime(),
  capacity: z.object({
    current: z.number().int().min(0),
    maximum: z.number().int().min(1),
    available: z.number().int().min(0),
  }),
  routing: z.object({
    weight: z.number().min(0).max(1),
    priority: z.number().int().min(1),
    preferredComplexity: ComplexityLevelSchema,
  }),
  metrics: z.object({
    avgLatencyMs: z.number().min(0),
    successRate: z.number().min(0).max(1),
    requestsPerMinute: z.number().min(0),
    tokensPerMinute: z.number().min(0),
  }),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
});

export const ProviderStatusResponseSchema = z.object({
  providers: z.array(ProviderStatusInfoSchema),
});

/**
 * Health check response schema
 * Used for GET /api/llm/health endpoint
 */
export const HealthCheckSchema = z.object({
  name: z.string(),
  status: z.enum(['pass', 'warn', 'fail']),
  latencyMs: z.number().min(0).optional(),
  lastCheck: z.string().datetime(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
      timestamp: z.string().datetime(),
      requestId: z.string().uuid().optional(),
      provider: ProviderNameSchema.optional(),
    })
    .optional(),
});

export const SystemHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptimeMs: z.number().min(0),
  checks: z.array(HealthCheckSchema),
  resources: z.object({
    memory: z.object({
      usedMb: z.number().min(0),
      limitMb: z.number().min(1),
      percentage: z.number().min(0).max(100),
    }),
    runtime: z.object({
      platform: z.string(),
      version: z.string(),
      edgeRuntime: z.boolean(),
    }),
  }),
  metrics: z.object({
    requests: z.object({
      total: z.number().int().min(0),
      successful: z.number().int().min(0),
      failed: z.number().int().min(0),
      avgLatencyMs: z.number().min(0),
    }),
    rateLimiting: z.object({
      active: z.boolean(),
      blockedRequests: z.number().int().min(0),
      windowRemainingMs: z.number().min(0),
    }),
  }),
  integrations: z.object({
    langsmith: z.object({
      connected: z.boolean(),
      lastTrace: z.string().datetime().optional(),
      tracesSent: z.number().int().min(0),
      errors: z.number().int().min(0),
    }),
  }),
});

/**
 * Routing rules response schema
 * Used for GET /api/llm/routing-rules endpoint
 */
export const ComplexityRuleSchema = z.object({
  pattern: z.string(),
  complexity: ComplexityLevelSchema,
  weight: z.number().min(0).max(1),
  description: z.string(),
});

export const FallbackChainSchema = z.object({
  complexity: ComplexityLevelSchema,
  providers: z.array(ProviderNameSchema),
  conditions: z.array(
    z.object({
      type: z.enum(['error_rate', 'latency', 'capacity']),
      threshold: z.number().min(0),
    })
  ),
});

export const RoutingRulesSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid semantic version'),
  updatedAt: z.string().datetime(),
  complexityRules: z.array(ComplexityRuleSchema),
  providerRouting: z.record(
    ProviderNameSchema,
    z.object({
      enabled: z.boolean(),
      apiKeyName: z.string(),
      baseUrl: z.string().url().optional(),
      maxTokens: z.number().int().min(1),
      timeout: z.number().int().min(1000),
      retryAttempts: z.number().int().min(0).max(5),
      rateLimits: z.object({
        requestsPerMinute: z.number().int().min(1),
        tokensPerMinute: z.number().int().min(1),
      }),
      costs: z.object({
        inputTokenCost: z.number().min(0),
        outputTokenCost: z.number().min(0),
        requestCost: z.number().min(0),
      }),
      routing: z.object({
        weight: z.number().min(0).max(1),
        priority: z.number().int().min(1),
        preferredComplexity: ComplexityLevelSchema,
      }),
    })
  ),
  fallbackChains: z.array(FallbackChainSchema),
  rateLimiting: z.object({
    global: z.object({
      requestsPerMinute: z.number().int().min(1),
      requestsPerHour: z.number().int().min(1),
      burstLimit: z.number().int().min(1),
    }),
    perProvider: z.record(
      ProviderNameSchema,
      z.object({
        requestsPerMinute: z.number().int().min(1),
        tokensPerMinute: z.number().int().min(1),
      })
    ),
  }),
  costOptimization: z.object({
    enabled: z.boolean(),
    dailyBudgetUsd: z.number().min(0),
    providerCosts: z.record(
      ProviderNameSchema,
      z.object({
        inputTokenCost: z.number().min(0),
        outputTokenCost: z.number().min(0),
        requestCost: z.number().min(0),
      })
    ),
  }),
  schemaVersion: z.string().optional(),
  checksum: z.string().optional(),
});

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validates LLM request with detailed error messages
 * Constitutional compliance: Input validation requirement
 */
export function validateLLMRequest(data: unknown): LLMRequest {
  try {
    return LLMRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Invalid request: ${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Validates LLM response before returning to client
 */
export function validateLLMResponse(data: unknown): LLMResponse {
  try {
    return LLMResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation failed:', error.errors);
      throw new Error('Invalid response format');
    }
    throw error;
  }
}

/**
 * Validates API response wrapper
 */
export function validateApiResponse<T>(data: unknown, dataSchema: z.ZodType<T>): ApiResponse<T> {
  return ApiResponseSchema(dataSchema).parse(data);
}

/**
 * Type-safe query parameter parsing
 */
export const QueryParamsSchema = z.object({
  version: z.string().optional(),
  detailed: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  debug: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  format: z.enum(['json', 'stream']).optional(),
});

export function parseQueryParams(url: URL): z.infer<typeof QueryParamsSchema> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return QueryParamsSchema.parse(params);
}

/**
 * Rate limiting header validation
 */
export const RateLimitHeadersSchema = z.object({
  'x-ratelimit-limit': z.string().transform((val) => parseInt(val, 10)),
  'x-ratelimit-remaining': z.string().transform((val) => parseInt(val, 10)),
  'x-ratelimit-reset': z.string().transform((val) => parseInt(val, 10)),
});

/**
 * Environment variable validation
 * Ensures all required configuration is present
 */
export const EnvironmentSchema = z.object({
  // API Keys
  CEREBRAS_API_KEY: z.string().min(1, 'Cerebras API key is required'),
  GOOGLE_AI_API_KEY: z.string().min(1, 'Google AI API key is required'),
  GROQ_API_KEY: z.string().min(1, 'Groq API key is required'),

  // LangSmith Configuration
  LANGCHAIN_API_KEY: z.string().min(1, 'LangChain API key is required'),
  LANGCHAIN_PROJECT: z.string().min(1, 'LangChain project is required'),
  LANGCHAIN_TRACING_V2: z.string().transform((val) => val === 'true'),

  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  // Optional Configuration
  RATE_LIMIT_REQUESTS_PER_MINUTE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('60'),
  COST_BUDGET_USD_PER_DAY: z
    .string()
    .transform((val) => parseFloat(val))
    .default('10.0'),
  DEFAULT_PROVIDER: ProviderNameSchema.default('groq'),
});

export function validateEnvironment(
  env: Record<string, string | undefined>
): z.infer<typeof EnvironmentSchema> {
  try {
    return EnvironmentSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// =============================================================================
// Error Schemas
// =============================================================================

export const ErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'AUTHENTICATION_FAILED',
  'RATE_LIMIT_EXCEEDED',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_ERROR',
  'TIMEOUT',
  'INTERNAL_ERROR',
  'VALIDATION_ERROR',
  'CONFIGURATION_ERROR',
  'COST_LIMIT_EXCEEDED',
]);

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    timestamp: z.string().datetime(),
    requestId: z.string().uuid().optional(),
    provider: ProviderNameSchema.optional(),
  }),
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
});

// Export commonly used type inference helpers
export type ValidatedLLMRequest = z.infer<typeof LLMRequestSchema>;
export type ValidatedLLMResponse = z.infer<typeof LLMResponseSchema>;
export type ValidatedProviderStatus = z.infer<typeof ProviderStatusResponseSchema>;
export type ValidatedSystemHealth = z.infer<typeof SystemHealthSchema>;
export type ValidatedRoutingRules = z.infer<typeof RoutingRulesSchema>;
export type ValidatedEnvironment = z.infer<typeof EnvironmentSchema>;
export type ValidatedErrorResponse = z.infer<typeof ErrorResponseSchema>;
