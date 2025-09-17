/**
 * GET /api/health/system - System Health Check Endpoint
 *
 * Constitutional compliance:
 * - Edge-First Architecture: Runs on Vercel Edge Runtime
 * - Observable AI Operations: Structured logging and monitoring
 * - Progressive Enhancement: Graceful degradation on component failures
 * - Type-Safe Development: Full TypeScript with Zod validation
 */

import {
  HealthSystemResponseSchema,
  type HealthMetrics,
  type OverallMetrics,
  type HealthStatus,
} from '../../src/api/types';
import {
  withErrorHandling,
  createSuccessResponse,
  checkServiceHealth,
  type RequestContext,
} from '../../src/api/utils/edge';

// Edge Runtime configuration
export const config = {
  runtime: 'edge',
};

// ============================================================================
// Health Check Components
// ============================================================================

async function checkEdgeFunctionHealth(): Promise<HealthMetrics> {
  const startTime = Date.now();

  // Simulate health check - in production, this would check actual metrics
  const healthCheck = await checkServiceHealth('edge_function', async () => {
    // Check if we can perform basic operations
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate work
    return true;
  });

  const latency = Date.now() - startTime;

  return {
    id: `edge_function_${Date.now()}`,
    timestamp: new Date().toISOString(),
    component: 'edge_function',
    metrics: {
      availability: healthCheck.status === 'healthy' ? 0.99 : 0.5,
      latency: {
        p50: latency,
        p95: latency * 1.2,
        p99: latency * 1.5,
      },
      errorRate: healthCheck.status === 'healthy' ? 0.001 : 0.1,
      throughput: 100, // requests per second
    },
  };
}

async function checkFrontendHealth(): Promise<HealthMetrics> {
  const startTime = Date.now();

  // Frontend health is assumed based on Edge Function accessibility
  const healthCheck = await checkServiceHealth('frontend', async () => {
    // In production, this might check if static assets are accessible
    return true;
  });

  const latency = Date.now() - startTime;

  return {
    id: `frontend_${Date.now()}`,
    timestamp: new Date().toISOString(),
    component: 'frontend',
    metrics: {
      availability: healthCheck.status === 'healthy' ? 0.995 : 0.8,
      latency: {
        p50: latency,
        p95: latency * 1.1,
        p99: latency * 1.3,
      },
      errorRate: healthCheck.status === 'healthy' ? 0.0005 : 0.05,
      throughput: 200, // requests per second
    },
  };
}

async function checkSystemHealth(): Promise<HealthMetrics> {
  const startTime = Date.now();

  const healthCheck = await checkServiceHealth('system', async () => {
    // Check system resources (memory, CPU, etc.)
    // In Edge Runtime, we have limited system access
    return Date.now() > 0; // Basic sanity check
  });

  const latency = Date.now() - startTime;

  return {
    id: `system_${Date.now()}`,
    timestamp: new Date().toISOString(),
    component: 'system',
    metrics: {
      availability: healthCheck.status === 'healthy' ? 0.98 : 0.6,
      latency: {
        p50: latency,
        p95: latency * 1.5,
        p99: latency * 2.0,
      },
      errorRate: healthCheck.status === 'healthy' ? 0.002 : 0.08,
      throughput: 150, // requests per second
    },
  };
}

// ============================================================================
// Health Aggregation
// ============================================================================

function calculateOverallMetrics(components: HealthMetrics[]): OverallMetrics {
  const totalComponents = components.length;

  if (totalComponents === 0) {
    return {
      availability: 0,
      averageLatency: 0,
      errorRate: 1,
    };
  }

  // Calculate weighted averages
  const totalAvailability = components.reduce((sum, c) => sum + c.metrics.availability, 0);
  const totalLatency = components.reduce((sum, c) => sum + c.metrics.latency.p50, 0);
  const totalErrorRate = components.reduce((sum, c) => sum + c.metrics.errorRate, 0);

  return {
    availability: totalAvailability / totalComponents,
    averageLatency: totalLatency / totalComponents,
    errorRate: totalErrorRate / totalComponents,
  };
}

function determineSystemStatus(components: HealthMetrics[], overall: OverallMetrics): HealthStatus {
  // Use overall availability to determine status
  if (overall.availability >= 0.95 && overall.errorRate <= 0.01) {
    return 'healthy';
  } else if (overall.availability >= 0.8 && overall.errorRate <= 0.05) {
    return 'degraded';
  }
  return 'unhealthy';
}

// ============================================================================
// Main Handler
// ============================================================================

async function handleHealthSystem(request: Request, context: RequestContext): Promise<Response> {
  const timestamp = new Date().toISOString();

  try {
    // Check all system components
    const [edgeFunctionHealth, frontendHealth, systemHealth] = await Promise.allSettled([
      checkEdgeFunctionHealth(),
      checkFrontendHealth(),
      checkSystemHealth(),
    ]);

    // Extract successful health checks
    const components: HealthMetrics[] = [];

    if (edgeFunctionHealth.status === 'fulfilled') {
      components.push(edgeFunctionHealth.value);
    }
    if (frontendHealth.status === 'fulfilled') {
      components.push(frontendHealth.value);
    }
    if (systemHealth.status === 'fulfilled') {
      components.push(systemHealth.value);
    }

    // Calculate overall metrics
    const overall = calculateOverallMetrics(components);
    const status = determineSystemStatus(components, overall);

    // Handle simulate=error query parameter for testing
    const url = new URL(request.url);
    if (url.searchParams.get('simulate') === 'error') {
      throw new Error('Simulated system health check failure');
    }

    const responseData = {
      status,
      timestamp,
      components,
      overall,
    };

    // Validate response against schema
    HealthSystemResponseSchema.parse({
      success: true,
      timestamp,
      data: responseData,
    });

    return createSuccessResponse(responseData);
  } catch (error) {
    // Log the error for monitoring
    console.error('Health system check failed:', {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    });

    // Return error response
    throw error;
  }
}

// ============================================================================
// Export Edge Function
// ============================================================================

export default withErrorHandling(handleHealthSystem, {
  allowedMethods: ['GET'],
});
