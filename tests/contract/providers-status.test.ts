import { describe, it, expect } from 'vitest';

/**
 * Contract tests for GET /api/llm/providers endpoint
 * Tests provider availability, capacity, and status reporting
 *
 * As per TDD methodology, these tests will fail until implementation
 * Routes tested: GET /api/llm/providers
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('GET /api/llm/providers Contract Tests', () => {
  it('should return provider availability status with proper schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();

    // Validate response schema
    expect(data).toHaveProperty('providers');
    expect(Array.isArray(data.providers)).toBe(true);
    expect(data.providers.length).toBeGreaterThan(0);

    // Each provider should have required fields
    for (const provider of data.providers) {
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('status');
      expect(provider).toHaveProperty('isAvailable');
      expect(provider).toHaveProperty('hasCapacity');
      expect(provider).toHaveProperty('complexity');
      expect(provider).toHaveProperty('lastChecked');

      // Validate field types
      expect(typeof provider.name).toBe('string');
      expect(['active', 'degraded', 'unavailable']).toContain(provider.status);
      expect(typeof provider.isAvailable).toBe('boolean');
      expect(typeof provider.hasCapacity).toBe('boolean');
      expect(['low', 'medium', 'high']).toContain(provider.complexity);
      expect(typeof provider.lastChecked).toBe('string');
      expect(new Date(provider.lastChecked)).toBeInstanceOf(Date);
    }

    // Should include all three expected providers
    const providerNames = data.providers.map((p: any) => p.name);
    expect(providerNames).toContain('cerebras');
    expect(providerNames).toContain('gemini');
    expect(providerNames).toContain('groq');
  });

  it('should include detailed capacity information', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    for (const provider of data.providers) {
      expect(provider).toHaveProperty('capacity');
      expect(provider.capacity).toHaveProperty('current');
      expect(provider.capacity).toHaveProperty('maximum');
      expect(provider.capacity).toHaveProperty('available');

      expect(typeof provider.capacity.current).toBe('number');
      expect(typeof provider.capacity.maximum).toBe('number');
      expect(typeof provider.capacity.available).toBe('number');
      expect(provider.capacity.current).toBeGreaterThanOrEqual(0);
      expect(provider.capacity.maximum).toBeGreaterThan(0);
      expect(provider.capacity.available).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include error information for unavailable providers', async () => {
    // Use test header to simulate some providers being down
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
      headers: {
        'x-test-simulate-failure': 'cerebras',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    const cerebraProvider = data.providers.find((p: any) => p.name === 'cerebras');
    if (cerebraProvider && !cerebraProvider.isAvailable) {
      expect(cerebraProvider).toHaveProperty('error');
      expect(cerebraProvider.error).toHaveProperty('message');
      expect(cerebraProvider.error).toHaveProperty('code');
      expect(typeof cerebraProvider.error.message).toBe('string');
      expect(typeof cerebraProvider.error.code).toBe('string');
    }
  });

  it('should include routing preferences and weights', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    for (const provider of data.providers) {
      expect(provider).toHaveProperty('routing');
      expect(provider.routing).toHaveProperty('weight');
      expect(provider.routing).toHaveProperty('priority');
      expect(provider.routing).toHaveProperty('preferred_complexity');

      expect(typeof provider.routing.weight).toBe('number');
      expect(typeof provider.routing.priority).toBe('number');
      expect(['low', 'medium', 'high']).toContain(provider.routing.preferred_complexity);
      expect(provider.routing.weight).toBeGreaterThanOrEqual(0);
      expect(provider.routing.weight).toBeLessThanOrEqual(1);
      expect(provider.routing.priority).toBeGreaterThanOrEqual(1);
    }
  });

  it('should include performance metrics', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    for (const provider of data.providers) {
      expect(provider).toHaveProperty('metrics');
      expect(provider.metrics).toHaveProperty('avg_latency_ms');
      expect(provider.metrics).toHaveProperty('success_rate');
      expect(provider.metrics).toHaveProperty('requests_per_minute');
      expect(provider.metrics).toHaveProperty('tokens_per_minute');

      expect(typeof provider.metrics.avg_latency_ms).toBe('number');
      expect(typeof provider.metrics.success_rate).toBe('number');
      expect(typeof provider.metrics.requests_per_minute).toBe('number');
      expect(typeof provider.metrics.tokens_per_minute).toBe('number');

      expect(provider.metrics.avg_latency_ms).toBeGreaterThanOrEqual(0);
      expect(provider.metrics.success_rate).toBeGreaterThanOrEqual(0);
      expect(provider.metrics.success_rate).toBeLessThanOrEqual(1);
      expect(provider.metrics.requests_per_minute).toBeGreaterThanOrEqual(0);
      expect(provider.metrics.tokens_per_minute).toBeGreaterThanOrEqual(0);
    }
  });

  it('should support caching with appropriate headers', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);

    // Should have cache-control headers for status data
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('max-age');
  });

  it('should handle CORS headers properly', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/providers`, {
      method: 'GET',
      headers: {
        Origin: 'https://hylo-travel.vercel.app',
      },
    });

    expect(response.status).toBe(200);

    // Should have CORS headers for frontend access
    expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
  });
});
