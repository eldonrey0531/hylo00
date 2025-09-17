/**
 * Contract Test: GET /api/health/providers
 *
 * Tests LLM provider availability and status endpoint contract.
 * Validates that provider health monitoring follows constitutional requirements.
 *
 * Constitutional Requirements:
 * - Multi-LLM Resilience: Providers have availability checks
 * - Observable AI Operations: Provider status is monitored
 * - Cost-Conscious Design: Quota and capacity tracking
 * - Edge-First Architecture: Endpoint runs on Edge Runtime
 */

import { describe, it, expect } from 'vitest';

const API_BASE_URL = process.env['VITE_API_BASE_URL'] || 'http://localhost:3000';

describe('GET /api/health/providers Contract Tests', () => {
  it('should return provider health status with proper schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);

    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Validate main structure
    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('timestamp');

    // Validate providers object has all required LLM providers
    expect(data.providers).toHaveProperty('cerebras');
    expect(data.providers).toHaveProperty('gemini');
    expect(data.providers).toHaveProperty('groq');

    // Validate each provider has required status fields
    ['cerebras', 'gemini', 'groq'].forEach((providerName) => {
      const provider = data.providers[providerName];
      expect(provider).toHaveProperty('name', providerName);
      expect(provider).toHaveProperty('status');
      expect(['available', 'degraded', 'unavailable']).toContain(provider.status);
      expect(provider).toHaveProperty('availability');
      expect(provider).toHaveProperty('lastChecked');
      expect(provider).toHaveProperty('metrics');

      // Validate availability object
      expect(provider.availability).toHaveProperty('isAvailable');
      expect(provider.availability).toHaveProperty('hasCapacity');
      expect(provider.availability).toHaveProperty('responseTime');
      expect(typeof provider.availability.isAvailable).toBe('boolean');
      expect(typeof provider.availability.hasCapacity).toBe('boolean');
      expect(typeof provider.availability.responseTime).toBe('number');

      // Validate metrics object
      expect(provider.metrics).toHaveProperty('requestCount');
      expect(provider.metrics).toHaveProperty('errorRate');
      expect(provider.metrics).toHaveProperty('averageLatency');

      // Validate time-based metrics
      expect(provider.metrics.requestCount).toHaveProperty('last1h');
      expect(provider.metrics.requestCount).toHaveProperty('last24h');
      expect(provider.metrics.errorRate).toHaveProperty('last1h');
      expect(provider.metrics.errorRate).toHaveProperty('last24h');
      expect(provider.metrics.averageLatency).toHaveProperty('last1h');
      expect(provider.metrics.averageLatency).toHaveProperty('last24h');
    });

    // Validate summary counts
    expect(data.summary).toHaveProperty('total');
    expect(data.summary).toHaveProperty('available');
    expect(data.summary).toHaveProperty('degraded');
    expect(data.summary).toHaveProperty('unavailable');
    expect(data.summary.total).toBe(3); // cerebras, gemini, groq
    expect(data.summary.available + data.summary.degraded + data.summary.unavailable).toBe(3);
  });

  it('should include quota tracking for cost-conscious design', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Each provider should have quota usage information
    ['cerebras', 'gemini', 'groq'].forEach((providerName) => {
      const provider = data.providers[providerName];

      if (provider.metrics.quotaUsage) {
        expect(provider.metrics.quotaUsage).toHaveProperty('current');
        expect(provider.metrics.quotaUsage).toHaveProperty('limit');
        expect(provider.metrics.quotaUsage).toHaveProperty('resetTime');
        expect(typeof provider.metrics.quotaUsage.current).toBe('number');
        expect(typeof provider.metrics.quotaUsage.limit).toBe('number');
        expect(provider.metrics.quotaUsage.current).toBeLessThanOrEqual(
          provider.metrics.quotaUsage.limit
        );
      }
    });
  });

  it('should include fallback chain information for multi-LLM resilience', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // At least one provider should have fallback chain information
    const providersWithFallback = Object.values(data.providers).filter(
      (provider: any) => provider.fallbackChain && provider.fallbackChain.length > 0
    );

    expect(providersWithFallback.length).toBeGreaterThan(0);

    providersWithFallback.forEach((provider: any) => {
      expect(Array.isArray(provider.fallbackChain)).toBe(true);
      expect(provider.fallbackChain.every((p: any) => typeof p === 'string')).toBe(true);
    });
  });

  it('should handle query parameters for specific provider checks', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers?provider=cerebras`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // When specific provider requested, should still return all providers but with focus
    expect(data).toHaveProperty('providers');
    expect(data.providers).toHaveProperty('cerebras');

    // Could include additional detail for requested provider
    if (data.requestedProvider) {
      expect(data.requestedProvider).toBe('cerebras');
      expect(data.providers.cerebras).toHaveProperty('detailedMetrics');
    }
  });

  it('should support health check depth parameter', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers?depth=detailed`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Detailed health check should include additional metrics
    ['cerebras', 'gemini', 'groq'].forEach((providerName) => {
      const provider = data.providers[providerName];

      if (data.depth === 'detailed') {
        // Should include more comprehensive metrics
        expect(provider.metrics).toHaveProperty('detailedLatency');
        expect(provider.metrics).toHaveProperty('errorBreakdown');
      }
    });
  });

  it('should include proper cache control headers', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);

    // Health status should have short cache TTL
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toMatch(/max-age=[1-5]\d?/); // 1-59 seconds

    // Should include ETag for conditional requests
    const etag = response.headers.get('etag');
    expect(etag).toBeTruthy();
  });

  it('should handle CORS headers properly', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
      headers: {
        Origin: 'https://hylo-travel.vercel.app',
      },
    });

    expect(response.status).toBe(200);

    // CORS headers should be present for cross-origin requests
    const corsOrigin = response.headers.get('access-control-allow-origin');
    expect(corsOrigin).toBeTruthy();

    const corsHeaders = response.headers.get('access-control-allow-headers');
    expect(corsHeaders).toBeTruthy();
  });

  it('should support conditional requests with If-None-Match', async () => {
    // First request to get ETag
    const initialResponse = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
    });

    expect(initialResponse.status).toBe(200);
    const etag = initialResponse.headers.get('etag');
    expect(etag).toBeTruthy();

    // Subsequent request with If-None-Match
    const conditionalResponse = await fetch(`${API_BASE_URL}/api/health/providers`, {
      method: 'GET',
      headers: {
        'If-None-Match': etag!,
      },
    });

    // Should return 304 if content hasn't changed (or 200 if it has)
    expect([200, 304]).toContain(conditionalResponse.status);

    if (conditionalResponse.status === 304) {
      expect(conditionalResponse.headers.get('etag')).toBe(etag);
    }
  });
});
