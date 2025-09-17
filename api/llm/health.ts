/**
 * Health Monitoring API Endpoint
 *
 * System health checks, monitoring routing performance, observability status,
 * and overall infrastructure health with constitutional compliance:
 * - Edge-first architecture with comprehensive monitoring
 * - Observable operations with detailed metrics
 * - Cost-conscious monitoring of multi-provider infrastructure
 * - Progressive enhancement with graceful degradation reporting
 */

import type { ProviderName } from '../types/index.js';
import { ProviderFactory } from '../providers/factory.js';
import { createObservabilityService } from '../utils/observability.js';
import type { LangSmithConfig } from '../types/observability.js';
import { enhancedProviderStatusService } from '../services/enhancedProviderStatusService';
import { dnsVerificationService } from '../services/dnsVerificationService';

// =============================================================================
// Edge Runtime Configuration
// =============================================================================

export const config = {
  runtime: 'edge',
};

/**
 * System health metrics interface
 */
interface HealthMetrics {
  timestamp: number;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    avgLatency: number;
  };
  providers: {
    healthy: number;
    degraded: number;
    unavailable: number;
    total: number;
  };
  routing: {
    complexityAnalysisMs: number;
    providerSelectionMs: number;
    fallbackRate: number;
    cacheHitRate: number;
  };
  observability: {
    tracingHealthy: boolean;
    batchQueueSize: number;
    lastFlushMs: number;
    errorRate: number;
  };
  quota: {
    totalUsed: number;
    totalLimit: number;
    utilizationRate: number;
    keyRotations: number;
  };
}

/**
 * Health status levels
 */
type HealthLevel = 'healthy' | 'degraded' | 'critical' | 'down';

interface HealthCheck {
  name: string;
  status: HealthLevel;
  message: string;
  latency?: number;
  details?: Record<string, unknown>;
}

/**
 * System health checker
 */
class SystemHealthChecker {
  private startTime = Date.now();
  private requestMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    totalLatency: 0,
  };

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(env: Record<string, string | undefined>): Promise<{
    status: HealthLevel;
    metrics: HealthMetrics;
    checks: HealthCheck[];
    summary: string;
  }> {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // 1. Provider Health Checks
    const providerChecks = await this.checkProviderHealth(env);
    checks.push(...providerChecks);

    // 2. Enhanced Provider Status Monitoring (T026)
    const enhancedProviderChecks = await this.checkEnhancedProviderStatus();
    checks.push(...enhancedProviderChecks);

    // 3. DNS Infrastructure Health (T026)
    const dnsCheck = await this.checkDNSInfrastructure();
    checks.push(dnsCheck);

    // 4. Routing System Health
    const routingCheck = await this.checkRoutingHealth(env);
    checks.push(routingCheck);

    // 5. Observability Health
    const observabilityCheck = await this.checkObservabilityHealth(env);
    checks.push(observabilityCheck);

    // 4. API Key Quota Health
    const quotaCheck = await this.checkQuotaHealth(env);
    checks.push(quotaCheck);

    // 5. Memory and Performance Health
    const performanceCheck = await this.checkPerformanceHealth();
    checks.push(performanceCheck);

    // Calculate overall metrics
    const metrics = this.calculateMetrics(checks);

    // Determine overall health status
    const overallStatus = this.determineOverallHealth(checks);

    const healthCheckLatency = Date.now() - startTime;
    const summary = this.generateHealthSummary(overallStatus, checks, healthCheckLatency);

    return {
      status: overallStatus,
      metrics,
      checks,
      summary,
    };
  }

  /**
   * Check provider health status
   */
  private async checkProviderHealth(
    env: Record<string, string | undefined>
  ): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    const providers: ProviderName[] = ['cerebras', 'gemini', 'groq'];

    for (const provider of providers) {
      const startTime = Date.now();

      try {
        // Check API key availability
        const primaryKey = env[`${provider.toUpperCase()}_API_KEY`];
        const secondaryKey = env[`${provider.toUpperCase()}_API_KEY_2`];

        if (!primaryKey && !secondaryKey) {
          checks.push({
            name: `${provider}_availability`,
            status: 'critical',
            message: `No API keys configured for ${provider}`,
            latency: Date.now() - startTime,
            details: { provider, keysConfigured: 0 },
          });
          continue;
        }

        const keyCount = [primaryKey, secondaryKey].filter(Boolean).length;
        let status: HealthLevel;
        if (keyCount >= 2) {
          status = 'healthy';
        } else if (keyCount === 1) {
          status = 'degraded';
        } else {
          status = 'critical';
        }

        checks.push({
          name: `${provider}_availability`,
          status,
          message: `${provider} has ${keyCount}/2 API keys configured`,
          latency: Date.now() - startTime,
          details: {
            provider,
            keysConfigured: keyCount,
            hasPrimary: !!primaryKey,
            hasSecondary: !!secondaryKey,
          },
        });

        // Simulate quota check
        const quotaUsed = Math.random() * 100; // Mock quota usage
        let quotaStatus: HealthLevel;
        if (quotaUsed > 90) {
          quotaStatus = 'critical';
        } else if (quotaUsed > 75) {
          quotaStatus = 'degraded';
        } else {
          quotaStatus = 'healthy';
        }

        checks.push({
          name: `${provider}_quota`,
          status: quotaStatus,
          message: `${provider} quota utilization: ${quotaUsed.toFixed(1)}%`,
          latency: Date.now() - startTime,
          details: { provider, quotaUsed, quotaLimit: 100 },
        });
      } catch (error) {
        checks.push({
          name: `${provider}_availability`,
          status: 'critical',
          message: `Error checking ${provider}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          latency: Date.now() - startTime,
          details: { provider, error: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
    }

    return checks;
  }

  /**
   * Check routing system health
   */
  private async checkRoutingHealth(env: Record<string, string | undefined>): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Test routing system components
      const factory = new ProviderFactory(env);
      await factory.initialize();

      const providers = factory.getAllProviders();
      const providerCount = Object.keys(providers).length;

      let status: HealthLevel;
      if (providerCount >= 2) {
        status = 'healthy';
      } else if (providerCount === 1) {
        status = 'degraded';
      } else {
        status = 'critical';
      }

      return {
        name: 'routing_system',
        status,
        message: `Routing system operational with ${providerCount} providers`,
        latency: Date.now() - startTime,
        details: {
          providersAvailable: providerCount,
          routingEnabled: true,
          fallbackConfigured: providerCount > 1,
        },
      };
    } catch (error) {
      return {
        name: 'routing_system',
        status: 'critical',
        message: `Routing system error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check observability system health
   */
  private async checkObservabilityHealth(
    env: Record<string, string | undefined>
  ): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const langsmithConfig: LangSmithConfig = {
        apiKey: env.LANGSMITH_API_KEY || '',
        projectName: env.LANGSMITH_PROJECT || 'hylo-travel-ai',
        tracingEnabled: env.LANGSMITH_TRACING !== 'false',
        debugMode: env.NODE_ENV === 'development',
        batchSize: 100,
        flushInterval: 5000,
        maxRetries: 3,
      };

      const observability = createObservabilityService(langsmithConfig);
      const isHealthy = await observability.isHealthy();

      const status: HealthLevel = isHealthy ? 'healthy' : 'degraded';

      return {
        name: 'observability',
        status,
        message: `Observability system ${isHealthy ? 'healthy' : 'degraded'}`,
        latency: Date.now() - startTime,
        details: {
          tracingEnabled: langsmithConfig.tracingEnabled,
          langsmithConfigured: !!langsmithConfig.apiKey,
          healthy: isHealthy,
        },
      };
    } catch (error) {
      return {
        name: 'observability',
        status: 'degraded',
        message: `Observability system warning: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check quota and API key health
   */
  private async checkQuotaHealth(env: Record<string, string | undefined>): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const providers: ProviderName[] = ['cerebras', 'gemini', 'groq'];
      let totalKeys = 0;
      let configuredKeys = 0;
      let quotaUtilization = 0;

      for (const provider of providers) {
        const primaryKey = env[`${provider.toUpperCase()}_API_KEY`];
        const secondaryKey = env[`${provider.toUpperCase()}_API_KEY_2`];

        totalKeys += 2; // Expected 2 keys per provider
        if (primaryKey) configuredKeys++;
        if (secondaryKey) configuredKeys++;

        // Mock quota utilization
        quotaUtilization += Math.random() * 30; // 0-30% per provider
      }

      const keyConfigurationRate = (configuredKeys / totalKeys) * 100;
      const avgQuotaUtilization = quotaUtilization / providers.length;

      let status: HealthLevel;
      if (keyConfigurationRate >= 100 && avgQuotaUtilization < 75) {
        status = 'healthy';
      } else if (keyConfigurationRate >= 50 && avgQuotaUtilization < 90) {
        status = 'degraded';
      } else {
        status = 'critical';
      }

      return {
        name: 'quota_management',
        status,
        message: `${configuredKeys}/${totalKeys} API keys configured, ${avgQuotaUtilization.toFixed(
          1
        )}% avg quota used`,
        latency: Date.now() - startTime,
        details: {
          totalKeysExpected: totalKeys,
          keysConfigured: configuredKeys,
          keyConfigurationRate,
          avgQuotaUtilization,
          providers: providers.length,
        },
      };
    } catch (error) {
      return {
        name: 'quota_management',
        status: 'degraded',
        message: `Quota check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check performance and memory health
   */
  private async checkPerformanceHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Mock memory usage for edge runtime
      const memoryUsage = {
        used: Math.random() * 100, // Mock used memory MB
        total: 128, // Typical edge function limit
      };

      const memoryPercentage = (memoryUsage.used / memoryUsage.total) * 100;
      const uptime = Date.now() - this.startTime;
      const avgLatency =
        this.requestMetrics.total > 0
          ? this.requestMetrics.totalLatency / this.requestMetrics.total
          : 0;

      let status: HealthLevel;
      if (memoryPercentage < 70 && avgLatency < 2000) {
        status = 'healthy';
      } else if (memoryPercentage < 85 && avgLatency < 5000) {
        status = 'degraded';
      } else {
        status = 'critical';
      }

      return {
        name: 'performance',
        status,
        message: `Memory: ${memoryPercentage.toFixed(1)}%, Avg latency: ${avgLatency.toFixed(0)}ms`,
        latency: Date.now() - startTime,
        details: {
          memoryUsedMB: memoryUsage.used,
          memoryTotalMB: memoryUsage.total,
          memoryPercentage,
          uptimeMs: uptime,
          avgLatencyMs: avgLatency,
          totalRequests: this.requestMetrics.total,
        },
      };
    } catch (error) {
      return {
        name: 'performance',
        status: 'degraded',
        message: `Performance check error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Calculate comprehensive health metrics
   */
  private calculateMetrics(checks: HealthCheck[]): HealthMetrics {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Provider metrics
    const providerChecks = checks.filter((c) => c.name.includes('_availability'));
    const providerMetrics = {
      healthy: providerChecks.filter((c) => c.status === 'healthy').length,
      degraded: providerChecks.filter((c) => c.status === 'degraded').length,
      unavailable: providerChecks.filter((c) => c.status === 'critical' || c.status === 'down')
        .length,
      total: providerChecks.length,
    };

    // Request metrics
    const successRate =
      this.requestMetrics.total > 0
        ? (this.requestMetrics.successful / this.requestMetrics.total) * 100
        : 100;
    const avgLatency =
      this.requestMetrics.total > 0
        ? this.requestMetrics.totalLatency / this.requestMetrics.total
        : 0;

    // Memory metrics (mocked for edge runtime)
    const memoryMetrics = {
      used: Math.random() * 100,
      total: 128,
      percentage: 0,
    };
    memoryMetrics.percentage = (memoryMetrics.used / memoryMetrics.total) * 100;

    return {
      timestamp: now,
      uptime,
      memory: memoryMetrics,
      requests: {
        total: this.requestMetrics.total,
        successful: this.requestMetrics.successful,
        failed: this.requestMetrics.failed,
        successRate,
        avgLatency,
      },
      providers: providerMetrics,
      routing: {
        complexityAnalysisMs: 50, // Mock
        providerSelectionMs: 25, // Mock
        fallbackRate: 10, // Mock 10% fallback rate
        cacheHitRate: 0, // Not implemented yet
      },
      observability: {
        tracingHealthy:
          checks.find((c) => c.name === 'observability')?.status === 'healthy' || false,
        batchQueueSize: 0, // Mock
        lastFlushMs: 1000, // Mock
        errorRate: (this.requestMetrics.failed / Math.max(this.requestMetrics.total, 1)) * 100,
      },
      quota: {
        totalUsed: Math.random() * 1000, // Mock
        totalLimit: 10000, // Mock
        utilizationRate: Math.random() * 100,
        keyRotations: 0, // Mock
      },
    };
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(checks: HealthCheck[]): HealthLevel {
    const criticalCount = checks.filter(
      (c) => c.status === 'critical' || c.status === 'down'
    ).length;
    const degradedCount = checks.filter((c) => c.status === 'degraded').length;

    if (criticalCount > 0) return 'critical';
    if (degradedCount > 1) return 'degraded';
    if (degradedCount === 1) return 'degraded';
    return 'healthy';
  }

  /**
   * Generate health summary
   */
  private generateHealthSummary(
    status: HealthLevel,
    checks: HealthCheck[],
    latency: number
  ): string {
    const healthyCount = checks.filter((c) => c.status === 'healthy').length;
    const degradedCount = checks.filter((c) => c.status === 'degraded').length;
    const criticalCount = checks.filter(
      (c) => c.status === 'critical' || c.status === 'down'
    ).length;

    return `System ${status.toUpperCase()}: ${healthyCount} healthy, ${degradedCount} degraded, ${criticalCount} critical components (checked in ${latency}ms)`;
  }

  /**
   * Record request metrics for health tracking
   */
  recordRequest(success: boolean, latency: number): void {
    this.requestMetrics.total++;
    this.requestMetrics.totalLatency += latency;

    if (success) {
      this.requestMetrics.successful++;
    } else {
      this.requestMetrics.failed++;
    }
  }

  /**
   * Enhanced provider status monitoring integration (T026)
   */
  async checkEnhancedProviderStatus(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    try {
      const startTime = Date.now();

      // Get detailed provider status from enhanced service
      const providerStatuses = await enhancedProviderStatusService.getAllProviderStatus();

      for (const [providerId, status] of providerStatuses) {
        let healthLevel: HealthLevel;
        let message: string;

        if (!status.isEnabled) {
          healthLevel = 'degraded';
          message = `${providerId} is disabled`;
        } else if (!status.isHealthy) {
          healthLevel = 'critical';
          message = `${providerId} is unhealthy`;
        } else if (!status.hasCapacity) {
          healthLevel = 'degraded';
          message = `${providerId} has no capacity`;
        } else {
          healthLevel = 'healthy';
          message = `${providerId} is healthy with capacity`;
        }

        checks.push({
          name: `enhanced_${providerId}_status`,
          status: healthLevel,
          message,
          latency: Date.now() - startTime,
          details: {
            provider: providerId,
            enabled: status.isEnabled,
            healthy: status.isHealthy,
            available: status.isAvailable,
            hasCapacity: status.hasCapacity,
            activeKeys: status.keys.filter((k) => k.isActive).length,
            totalKeys: status.keys.length,
            metricsSnapshot: {
              totalRequests: status.metrics.totalRequests,
              successRate:
                status.metrics.successfulRequests / Math.max(status.metrics.totalRequests, 1),
              avgLatency: status.metrics.avgLatency,
              totalCost: status.metrics.totalCost,
            },
            rateLimits: {
              currentRpm: status.rateLimits.currentRpm,
              maxRpm: status.rateLimits.requestsPerMinute,
              utilizationRate:
                (status.rateLimits.currentRpm / Math.max(status.rateLimits.requestsPerMinute, 1)) *
                100,
            },
            lastHealthCheck: status.lastHealthCheck,
          },
        });
      }

      // Add overall enhanced monitoring check
      const healthyProviders = checks.filter((c) => c.status === 'healthy').length;
      const totalProviders = checks.length;

      let overallStatus: HealthLevel;
      if (healthyProviders === totalProviders && totalProviders > 0) {
        overallStatus = 'healthy';
      } else if (healthyProviders > 0) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'critical';
      }

      checks.push({
        name: 'enhanced_provider_monitoring',
        status: overallStatus,
        message: `Enhanced monitoring: ${healthyProviders}/${totalProviders} providers healthy`,
        latency: Date.now() - startTime,
        details: {
          healthyProviders,
          totalProviders,
          coverageRate: totalProviders > 0 ? (healthyProviders / totalProviders) * 100 : 0,
        },
      });
    } catch (error) {
      checks.push({
        name: 'enhanced_provider_monitoring',
        status: 'critical',
        message: `Enhanced provider monitoring failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }

    return checks;
  }

  /**
   * DNS infrastructure health check (T026 integration)
   */
  async checkDNSInfrastructure(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Check active DNS verifications
      const activeVerifications = await dnsVerificationService.listVerifications();

      const pendingCount = activeVerifications.filter((v) => v.status === 'pending').length;
      const failedCount = activeVerifications.filter((v) => v.status === 'failed').length;
      const successfulCount = activeVerifications.filter((v) => v.status === 'verified').length;

      let status: HealthLevel;
      let message: string;

      if (failedCount === 0 && pendingCount < 5) {
        status = 'healthy';
        message = `DNS infrastructure healthy: ${successfulCount} verified, ${pendingCount} pending`;
      } else if (failedCount < 3 && pendingCount < 10) {
        status = 'degraded';
        message = `DNS infrastructure degraded: ${failedCount} failures, ${pendingCount} pending`;
      } else {
        status = 'critical';
        message = `DNS infrastructure critical: ${failedCount} failures, ${pendingCount} pending`;
      }

      return {
        name: 'dns_infrastructure',
        status,
        message,
        latency: Date.now() - startTime,
        details: {
          totalVerifications: activeVerifications.length,
          pendingCount,
          successfulCount,
          failedCount,
          successRate:
            activeVerifications.length > 0
              ? (successfulCount / activeVerifications.length) * 100
              : 100,
        },
      };
    } catch (error) {
      return {
        name: 'dns_infrastructure',
        status: 'critical',
        message: `DNS infrastructure check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}

// Global health checker instance
const healthChecker = new SystemHealthChecker();

/**
 * Handle health check requests
 */
async function handleHealthRequest(
  request: Request,
  env: Record<string, string | undefined>
): Promise<Response> {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';
  const format = url.searchParams.get('format') || 'json';

  try {
    const healthResult = await healthChecker.performHealthCheck(env);

    if (format === 'prometheus') {
      // Return Prometheus metrics format
      const metrics = generatePrometheusMetrics(healthResult.metrics);
      return new Response(metrics, {
        status: healthResult.status === 'healthy' ? 200 : 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, max-age=0',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // JSON format (default)
    const responseData = detailed
      ? healthResult
      : {
          status: healthResult.status,
          timestamp: healthResult.metrics.timestamp,
          summary: healthResult.summary,
          uptime: healthResult.metrics.uptime,
        };

    return new Response(JSON.stringify(responseData, null, 2), {
      status: healthResult.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return new Response(
      JSON.stringify({
        status: 'critical',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Generate Prometheus metrics format
 */
function generatePrometheusMetrics(metrics: HealthMetrics): string {
  const lines: string[] = [];

  // System uptime
  lines.push(`# HELP hylo_uptime_seconds System uptime in seconds`);
  lines.push(`# TYPE hylo_uptime_seconds counter`);
  lines.push(`hylo_uptime_seconds ${(metrics.uptime / 1000).toFixed(2)}`);

  // Memory usage
  lines.push(`# HELP hylo_memory_usage_bytes Memory usage in bytes`);
  lines.push(`# TYPE hylo_memory_usage_bytes gauge`);
  lines.push(`hylo_memory_usage_bytes ${(metrics.memory.used * 1024 * 1024).toFixed(0)}`);

  // Request metrics
  lines.push(`# HELP hylo_requests_total Total number of requests`);
  lines.push(`# TYPE hylo_requests_total counter`);
  lines.push(`hylo_requests_total ${metrics.requests.total}`);

  lines.push(`# HELP hylo_requests_success_rate Request success rate percentage`);
  lines.push(`# TYPE hylo_requests_success_rate gauge`);
  lines.push(`hylo_requests_success_rate ${metrics.requests.successRate.toFixed(2)}`);

  // Provider health
  lines.push(`# HELP hylo_providers_healthy Number of healthy providers`);
  lines.push(`# TYPE hylo_providers_healthy gauge`);
  lines.push(`hylo_providers_healthy ${metrics.providers.healthy}`);

  lines.push(`# HELP hylo_providers_degraded Number of degraded providers`);
  lines.push(`# TYPE hylo_providers_degraded gauge`);
  lines.push(`hylo_providers_degraded ${metrics.providers.degraded}`);

  // Quota utilization
  lines.push(`# HELP hylo_quota_utilization_rate Quota utilization rate percentage`);
  lines.push(`# TYPE hylo_quota_utilization_rate gauge`);
  lines.push(`hylo_quota_utilization_rate ${metrics.quota.utilizationRate.toFixed(2)}`);

  return lines.join('\n') + '\n';
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Export health checker for use by other modules
 */
export { healthChecker };

/**
 * Main handler export for Vercel Edge Functions
 * Constitutional requirement: Edge-first architecture
 */
export default async function handler(request: Request): Promise<Response> {
  // Initialize environment access for edge runtime
  const env: Record<string, string | undefined> = {};
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
      Object.assign(env, (globalThis as any).process.env);
    }
  } catch {
    console.warn('Environment variables not accessible in edge runtime');
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only accepts GET requests',
        allowedMethods: ['GET', 'OPTIONS'],
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          Allow: 'GET, OPTIONS',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  return await handleHealthRequest(request, env);
}
