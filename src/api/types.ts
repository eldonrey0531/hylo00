import { z } from 'zod';

/**
 * API Response Types and Schemas for Hylo Travel AI
 *
 * Constitutional compliance:
 * - Type-Safe Development: All API responses have defined interfaces with Zod validation
 * - Edge-First Architecture: Compatible with Vercel Edge Runtime
 * - Observable AI Operations: Includes tracing and monitoring types
 */

// ============================================================================
// Base Response Types
// ============================================================================

export const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
});

export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    status: z.number(),
    timestamp: z.string().datetime(),
    details: z.record(z.unknown()).optional(),
  }),
});

export const SuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
});

// ============================================================================
// Health System Types
// ============================================================================

export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);

export const LatencyMetricsSchema = z.object({
  p50: z.number().nonnegative(),
  p95: z.number().nonnegative(),
  p99: z.number().nonnegative(),
});

export const ComponentMetricsSchema = z.object({
  availability: z.number().min(0).max(1),
  latency: LatencyMetricsSchema,
  errorRate: z.number().min(0).max(1),
  throughput: z.number().nonnegative(),
});

export const HealthMetricsSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  component: z.enum(['edge_function', 'llm_provider', 'frontend', 'system']),
  metrics: ComponentMetricsSchema,
});

export const OverallMetricsSchema = z.object({
  availability: z.number().min(0).max(1),
  averageLatency: z.number().nonnegative(),
  errorRate: z.number().min(0).max(1),
});

export const HealthSystemResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    status: HealthStatusSchema,
    timestamp: z.string().datetime(),
    components: z.array(HealthMetricsSchema),
    overall: OverallMetricsSchema,
  }),
});

// ============================================================================
// Health Providers Types
// ============================================================================

export const ProviderStatusSchema = z.enum(['available', 'degraded', 'unavailable', 'maintenance']);

export const ProviderCapabilitySchema = z.object({
  complexity: z.enum(['low', 'medium', 'high']),
  speed: z.enum(['fast', 'medium', 'slow']),
  costTier: z.enum(['free', 'low', 'medium', 'high']),
});

export const ProviderQuotaSchema = z.object({
  requests: z.object({
    used: z.number().nonnegative(),
    limit: z.number().nonnegative(),
    remaining: z.number().nonnegative(),
  }),
  tokens: z.object({
    used: z.number().nonnegative(),
    limit: z.number().nonnegative(),
    remaining: z.number().nonnegative(),
  }),
});

export const ProviderHealthSchema = z.object({
  id: z.string(),
  name: z.enum(['cerebras', 'gemini', 'groq']),
  status: ProviderStatusSchema,
  timestamp: z.string().datetime(),
  capabilities: ProviderCapabilitySchema,
  metrics: ComponentMetricsSchema,
  quota: ProviderQuotaSchema,
  lastCheck: z.string().datetime(),
});

export const HealthProvidersResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    providers: z.array(ProviderHealthSchema),
    routing: z.object({
      primary: z.string(),
      fallbacks: z.array(z.string()),
      lastUpdated: z.string().datetime(),
    }),
    overall: z.object({
      availableProviders: z.number().nonnegative(),
      totalProviders: z.number().nonnegative(),
      healthScore: z.number().min(0).max(1),
    }),
  }),
});

// ============================================================================
// Monitoring Types
// ============================================================================

export const ErrorSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ErrorCategorySchema = z.enum([
  'llm_error',
  'edge_function_error',
  'validation_error',
  'rate_limit_error',
  'network_error',
  'system_error',
]);

export const MonitoringErrorSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  severity: ErrorSeveritySchema,
  category: ErrorCategorySchema,
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.unknown()),
  resolved: z.boolean(),
  resolvedAt: z.string().datetime().optional(),
  component: z.string(),
  provider: z.string().optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
});

export const MonitoringErrorsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    errors: z.array(MonitoringErrorSchema),
    pagination: z.object({
      page: z.number().positive(),
      limit: z.number().positive(),
      total: z.number().nonnegative(),
      hasMore: z.boolean(),
    }),
    summary: z.object({
      totalErrors: z.number().nonnegative(),
      unresolvedErrors: z.number().nonnegative(),
      criticalErrors: z.number().nonnegative(),
      lastHourErrors: z.number().nonnegative(),
    }),
  }),
});

// ============================================================================
// Type Exports
// ============================================================================

export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type LatencyMetrics = z.infer<typeof LatencyMetricsSchema>;
export type ComponentMetrics = z.infer<typeof ComponentMetricsSchema>;
export type HealthMetrics = z.infer<typeof HealthMetricsSchema>;
export type OverallMetrics = z.infer<typeof OverallMetricsSchema>;
export type HealthSystemResponse = z.infer<typeof HealthSystemResponseSchema>;

export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
export type ProviderCapability = z.infer<typeof ProviderCapabilitySchema>;
export type ProviderQuota = z.infer<typeof ProviderQuotaSchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type HealthProvidersResponse = z.infer<typeof HealthProvidersResponseSchema>;

export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;
export type ErrorCategory = z.infer<typeof ErrorCategorySchema>;
export type MonitoringError = z.infer<typeof MonitoringErrorSchema>;
export type MonitoringErrorsResponse = z.infer<typeof MonitoringErrorsResponseSchema>;
