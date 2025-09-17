/**
 * Provider Status API Endpoint
 *
 * Real-time provider health monitoring, quota tracking, and availability status
 * with constitutional compliance:
 * - Edge-first architecture with observability
 * - Multi-API key rotation and quota management
 * - Cost-conscious monitoring of free tier limits
 * - Observable operations with comprehensive metrics
 */

import type {
  ProviderName,
  ProviderStatus,
  SystemStatus,
  KeyStatus,
  ProviderHealth,
} from '../../src/api/types/index.js';

// =============================================================================
// Edge Runtime Configuration
// =============================================================================

export const config = {
  runtime: 'edge',
};

/**
 * Key quota tracking for free tier management
 */
class KeyQuotaTracker {
  private quotaData = new Map<
    string,
    {
      used: number;
      limit: number;
      resetTime: number;
      lastUsed: number;
      errorCount: number;
      successCount: number;
      totalLatency: number;
    }
  >();

  constructor() {
    // Initialize with typical free tier limits
    this.setDefaultLimits();
  }

  private setDefaultLimits(): void {
    const resetTime = this.getNextResetTime();

    // Groq free tier: ~14,000 tokens/day
    this.quotaData.set('groq_primary', {
      used: 0,
      limit: 14000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });

    this.quotaData.set('groq_secondary', {
      used: 0,
      limit: 14000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });

    // Gemini free tier: 15 RPM, 1 million tokens/day
    this.quotaData.set('gemini_primary', {
      used: 0,
      limit: 1000000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });

    this.quotaData.set('gemini_secondary', {
      used: 0,
      limit: 1000000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });

    // Cerebras free tier: varies, typically limited
    this.quotaData.set('cerebras_primary', {
      used: 0,
      limit: 50000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });

    this.quotaData.set('cerebras_secondary', {
      used: 0,
      limit: 50000,
      resetTime,
      lastUsed: 0,
      errorCount: 0,
      successCount: 0,
      totalLatency: 0,
    });
  }

  private getNextResetTime(): number {
    // Reset at midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  getKeyStatus(keyId: string): KeyStatus | null {
    const data = this.quotaData.get(keyId);
    if (!data) return null;

    const [, type] = keyId.split('_') as [string, 'primary' | 'secondary'];
    const successRate =
      data.successCount + data.errorCount > 0
        ? data.successCount / (data.successCount + data.errorCount)
        : 1;
    const avgLatency = data.successCount > 0 ? data.totalLatency / data.successCount : 0;

    return {
      keyId,
      type,
      isActive: data.used < data.limit * 0.9, // 90% threshold
      quotaUsed: data.used,
      quotaLimit: data.limit,
      quotaResetTime: data.resetTime,
      lastUsed: data.lastUsed,
      errorCount: data.errorCount,
      successRate,
      avgLatency,
    };
  }

  updateKeyUsage(keyId: string, tokens: number, latency: number, success: boolean): void {
    const data = this.quotaData.get(keyId);
    if (!data) return;

    data.used += tokens;
    data.lastUsed = Date.now();

    if (success) {
      data.successCount++;
      data.totalLatency += latency;
    } else {
      data.errorCount++;
    }

    // Reset if past reset time
    if (Date.now() > data.resetTime) {
      data.used = 0;
      data.errorCount = 0;
      data.successCount = 0;
      data.totalLatency = 0;
      data.resetTime = this.getNextResetTime();
    }
  }

  getBestAvailableKey(provider: ProviderName): string | null {
    const primaryKey = `${provider}_primary`;
    const secondaryKey = `${provider}_secondary`;

    const primaryStatus = this.getKeyStatus(primaryKey);
    const secondaryStatus = this.getKeyStatus(secondaryKey);

    // Prefer key with more available quota and better performance
    if (primaryStatus?.isActive && secondaryStatus?.isActive) {
      const primaryCapacity =
        (primaryStatus.quotaLimit - primaryStatus.quotaUsed) / primaryStatus.quotaLimit;
      const secondaryCapacity =
        (secondaryStatus.quotaLimit - secondaryStatus.quotaUsed) / secondaryStatus.quotaLimit;

      // Factor in success rate and latency
      const primaryScore =
        primaryCapacity * primaryStatus.successRate * (1000 / (primaryStatus.avgLatency + 100));
      const secondaryScore =
        secondaryCapacity *
        secondaryStatus.successRate *
        (1000 / (secondaryStatus.avgLatency + 100));

      return primaryScore >= secondaryScore ? primaryKey : secondaryKey;
    }

    if (primaryStatus?.isActive) return primaryKey;
    if (secondaryStatus?.isActive) return secondaryKey;

    return null;
  }
}

// Global quota tracker instance
const quotaTracker = new KeyQuotaTracker();

/**
 * Provider health checker
 */
class ProviderHealthChecker {
  private lastHealthCheck = new Map<ProviderName, number>();
  private healthCache = new Map<ProviderName, ProviderHealth>();

  async checkProviderHealth(
    provider: ProviderName,
    env: Record<string, string | undefined>
  ): Promise<ProviderHealth> {
    const now = Date.now();
    const lastCheck = this.lastHealthCheck.get(provider) || 0;

    // Cache health checks for 30 seconds
    if (now - lastCheck < 30000 && this.healthCache.has(provider)) {
      return this.healthCache.get(provider)!;
    }

    try {
      const health = await this.performHealthCheck(provider, env);
      this.lastHealthCheck.set(provider, now);
      this.healthCache.set(provider, health);
      return health;
    } catch (error) {
      console.warn(`Health check failed for ${provider}:`, error);
      this.healthCache.set(provider, 'unavailable');
      return 'unavailable';
    }
  }

  private async performHealthCheck(
    provider: ProviderName,
    env: Record<string, string | undefined>
  ): Promise<ProviderHealth> {
    const primaryKey = env[`${provider.toUpperCase()}_API_KEY`];
    const secondaryKey = env[`${provider.toUpperCase()}_API_KEY_2`];

    if (!primaryKey && !secondaryKey) {
      return 'unavailable';
    }

    // Simple availability check - could be enhanced with actual API calls
    const primaryAvailable =
      !!primaryKey && quotaTracker.getKeyStatus(`${provider}_primary`)?.isActive;
    const secondaryAvailable =
      !!secondaryKey && quotaTracker.getKeyStatus(`${provider}_secondary`)?.isActive;

    if (primaryAvailable && secondaryAvailable) return 'active';
    if (primaryAvailable || secondaryAvailable) return 'degraded';
    return 'unavailable';
  }
}

const healthChecker = new ProviderHealthChecker();

/**
 * Get detailed provider status
 */
async function getProviderStatus(
  provider: ProviderName,
  env: Record<string, string | undefined>
): Promise<ProviderStatus> {
  const health = await healthChecker.checkProviderHealth(provider, env);

  const primaryKeyStatus = quotaTracker.getKeyStatus(`${provider}_primary`);
  const secondaryKeyStatus = quotaTracker.getKeyStatus(`${provider}_secondary`);

  const keys: KeyStatus[] = [];
  if (primaryKeyStatus) keys.push(primaryKeyStatus);
  if (secondaryKeyStatus) keys.push(secondaryKeyStatus);

  const activeKeyId = quotaTracker.getBestAvailableKey(provider) || '';

  // Calculate aggregate metrics
  const totalRequests = keys.reduce((sum, key) => sum + key.errorCount + key.successRate * 100, 0);
  const successfulRequests = keys.reduce((sum, key) => sum + key.successRate * 100, 0);
  const failedRequests = keys.reduce((sum, key) => sum + key.errorCount, 0);
  const avgLatency =
    keys.length > 0 ? keys.reduce((sum, key) => sum + key.avgLatency, 0) / keys.length : 0;

  return {
    provider,
    isEnabled: keys.length > 0,
    isHealthy: health === 'active',
    isAvailable: health !== 'unavailable',
    hasCapacity: keys.some((key) => key.isActive),
    keys,
    activeKeyId,
    metrics: {
      totalRequests: Math.floor(totalRequests),
      successfulRequests: Math.floor(successfulRequests),
      failedRequests,
      avgLatency,
      totalCost: 0, // Would be calculated from actual usage
      tokensUsed: keys.reduce((sum, key) => sum + key.quotaUsed, 0),
    },
    rateLimits: {
      requestsPerMinute: provider === 'gemini' ? 15 : 60,
      currentRpm: 0, // Would be calculated from recent requests
      tokensPerMinute: provider === 'groq' ? 1000 : 10000,
      currentTpm: 0, // Would be calculated from recent usage
    },
    lastHealthCheck: Date.now(),
    nextQuotaReset: keys.length > 0 ? Math.min(...keys.map((k) => k.quotaResetTime)) : Date.now(),
  };
}

/**
 * Get complete system status
 */
async function getSystemStatus(env: Record<string, string | undefined>): Promise<SystemStatus> {
  const providers: ProviderStatus[] = [];

  for (const provider of ['cerebras', 'gemini', 'groq'] as ProviderName[]) {
    const status = await getProviderStatus(provider, env);
    providers.push(status);
  }

  const totalRequests = providers.reduce((sum, p) => sum + p.metrics.totalRequests, 0);
  const successfulRequests = providers.reduce((sum, p) => sum + p.metrics.successfulRequests, 0);
  const avgResponseTime =
    providers.reduce((sum, p) => sum + p.metrics.avgLatency, 0) / providers.length;
  const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 1;

  return {
    timestamp: Date.now(),
    healthy: providers.some((p) => p.isHealthy),
    providers,
    routing: {
      totalRequests,
      avgResponseTime,
      successRate,
      fallbackRate: 0, // Would be calculated from routing metrics
    },
    observability: {
      tracingEnabled: !!env.LANGSMITH_API_KEY,
      healthyConnections: providers.filter((p) => p.isAvailable).length,
      queueSize: 0,
      lastFlush: Date.now(),
    },
  };
}

/**
 * Handle provider status requests
 */
async function handleProviderStatusRequest(
  request: Request,
  env: Record<string, string | undefined>
): Promise<Response> {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') as ProviderName | null;

  try {
    if (provider) {
      // Single provider status
      if (!['cerebras', 'gemini', 'groq'].includes(provider)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid provider',
            message: `Provider must be one of: cerebras, gemini, groq`,
            requested: provider,
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const status = await getProviderStatus(provider, env);
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, max-age=0',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // System-wide status
      const status = await getSystemStatus(env);
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, max-age=0',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    console.error('Provider status error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
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
 * Update quota tracking from external usage
 * This would be called by the main routing endpoint
 */
export function updateProviderQuota(
  provider: ProviderName,
  keyType: 'primary' | 'secondary',
  tokens: number,
  latency: number,
  success: boolean
): void {
  const keyId = `${provider}_${keyType}`;
  quotaTracker.updateKeyUsage(keyId, tokens, latency, success);
}

/**
 * Get best available key for a provider
 */
export function getBestProviderKey(provider: ProviderName): string | null {
  return quotaTracker.getBestAvailableKey(provider);
}

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

  return await handleProviderStatusRequest(request, env);
}
