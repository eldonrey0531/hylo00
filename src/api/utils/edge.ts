/**
 * Edge Runtime Utilities for Hylo Travel AI
 *
 * Constitutional compliance:
 * - Edge-First Architecture: All utilities compatible with Vercel Edge Runtime
 * - Observable AI Operations: Structured logging and tracing
 * - Security by Default: Input sanitization and rate limiting
 * - Type-Safe Development: Full TypeScript coverage
 */

import type { ErrorResponse, BaseResponse } from '../types';

// ============================================================================
// Error Handling Utilities
// ============================================================================

export class APIError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createErrorResponse(error: APIError | Error, requestId?: string): ErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof APIError) {
    return {
      success: false,
      timestamp,
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp,
        details: {
          ...error.details,
          requestId,
        },
      },
    };
  }

  // Handle unexpected errors
  return {
    success: false,
    timestamp,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      status: 500,
      timestamp,
      details: {
        requestId,
        original: error.message,
      },
    },
  };
}

// ============================================================================
// Response Utilities
// ============================================================================

export function createSuccessResponse<T>(data: T): Response {
  const response: BaseResponse & { data: T } = {
    success: true,
    timestamp: new Date().toISOString(),
    data,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function createErrorResponseFromAPIError(error: APIError, requestId?: string): Response {
  const errorResponse = createErrorResponse(error, requestId);

  return new Response(JSON.stringify(errorResponse), {
    status: error.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// ============================================================================
// Request Utilities
// ============================================================================

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getClientIP(request: Request): string {
  // Extract client IP from various headers (Vercel Edge compatibility)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
}

export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, maxLength)
    .trim();
}

export function validateMethod(request: Request, allowedMethods: string[]): void {
  if (!allowedMethods.includes(request.method)) {
    throw new APIError(`Method ${request.method} not allowed`, 'METHOD_NOT_ALLOWED', 405, {
      allowedMethods,
    });
  }
}

// ============================================================================
// Monitoring Utilities
// ============================================================================

export interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  clientIP: string;
  timestamp: string;
}

export function createRequestContext(request: Request): RequestContext {
  return {
    requestId: generateRequestId(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    clientIP: getClientIP(request),
    timestamp: new Date().toISOString(),
  };
}

export function logRequest(
  context: RequestContext,
  additionalData?: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({
      level: 'info',
      type: 'request',
      ...context,
      ...additionalData,
    })
  );
}

export function logError(
  context: RequestContext,
  error: Error,
  additionalData?: Record<string, unknown>
): void {
  console.error(
    JSON.stringify({
      level: 'error',
      type: 'error',
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...additionalData,
    })
  );
}

export function logPerformance(
  context: RequestContext,
  duration: number,
  additionalData?: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({
      level: 'info',
      type: 'performance',
      ...context,
      duration,
      ...additionalData,
    })
  );
}

// ============================================================================
// Edge Function Wrapper
// ============================================================================

export interface EdgeFunctionConfig {
  allowedMethods: string[];
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export function withErrorHandling(
  handler: (request: Request, context: RequestContext) => Promise<Response>,
  config: EdgeFunctionConfig = { allowedMethods: ['GET'] }
) {
  return async (request: Request): Promise<Response> => {
    const context = createRequestContext(request);
    const startTime = Date.now();

    try {
      // Log incoming request
      logRequest(context);

      // Validate HTTP method
      validateMethod(request, config.allowedMethods);

      // Execute handler
      const response = await handler(request, context);

      // Log performance
      logPerformance(context, Date.now() - startTime);

      return response;
    } catch (error) {
      // Log error
      logError(context, error as Error);

      // Return structured error response
      if (error instanceof APIError) {
        return createErrorResponseFromAPIError(error, context.requestId);
      }

      // Handle unexpected errors
      const apiError = new APIError('Internal server error', 'INTERNAL_ERROR', 500, {
        requestId: context.requestId,
      });

      return createErrorResponseFromAPIError(apiError, context.requestId);
    }
  };
}

// ============================================================================
// Health Check Utilities
// ============================================================================

export async function checkServiceHealth(
  serviceName: string,
  healthCheckFn: () => Promise<boolean>
): Promise<{ status: 'healthy' | 'unhealthy'; latency: number; error?: string }> {
  const startTime = Date.now();

  try {
    const isHealthy = await Promise.race([
      healthCheckFn(),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      ),
    ]);

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function calculateOverallHealth(
  components: Array<{ status: string; weight?: number }>
): 'healthy' | 'degraded' | 'unhealthy' {
  if (components.length === 0) return 'unhealthy';

  const totalWeight = components.reduce((sum, c) => sum + (c.weight || 1), 0);
  const healthyWeight = components
    .filter((c) => c.status === 'healthy')
    .reduce((sum, c) => sum + (c.weight || 1), 0);

  const healthRatio = healthyWeight / totalWeight;

  if (healthRatio >= 0.8) return 'healthy';
  if (healthRatio >= 0.5) return 'degraded';
  return 'unhealthy';
}
