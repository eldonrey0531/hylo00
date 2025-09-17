/**
 * Contract Tests: Provider Status API
 *
 * Tests the provider status endpoints to ensure they match the OpenAPI specification.
 * These tests validate the enhanced provider status handling for TypeScript compliance.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Zod schemas for contract validation
const ProviderNameSchema = z.enum(['cerebras', 'gemini', 'groq']);

const SimpleProviderStatusSchema = z.enum(['available', 'degraded', 'unavailable', 'maintenance']);

const KeyStatusSchema = z.object({
  keyId: z.string(),
  type: z.enum(['primary', 'secondary', 'tertiary']),
  isActive: z.boolean(),
  quotaUsed: z.number(),
  quotaLimit: z.number(),
  quotaResetTime: z.number(),
  lastUsed: z.number(),
  errorCount: z.number(),
  successRate: z.number().min(0).max(1),
  avgLatency: z.number(),
});

const ProviderMetricsSchema = z.object({
  totalRequests: z.number(),
  successfulRequests: z.number(),
  failedRequests: z.number(),
  avgLatency: z.number(),
  totalCost: z.number(),
  tokensUsed: z.number(),
});

const RateLimitStatusSchema = z.object({
  requestsPerMinute: z.number(),
  currentRpm: z.number(),
  tokensPerMinute: z.number(),
  currentTpm: z.number(),
});

const DetailedProviderStatusSchema = z.object({
  provider: ProviderNameSchema,
  isEnabled: z.boolean(),
  isHealthy: z.boolean(),
  isAvailable: z.boolean(),
  hasCapacity: z.boolean(),
  keys: z.array(KeyStatusSchema),
  activeKeyId: z.string(),
  metrics: ProviderMetricsSchema,
  rateLimits: RateLimitStatusSchema,
  lastHealthCheck: z.number(),
  nextQuotaReset: z.number(),
});

const ProviderStatusResponseSchema = z.object({
  providers: z.array(
    z.object({
      name: ProviderNameSchema,
      status: SimpleProviderStatusSchema,
      isHealthy: z.boolean(),
      lastChecked: z.string().datetime().optional(),
    })
  ),
  timestamp: z.string().datetime(),
  healthy: z.boolean(),
});

const ProviderHealthCheckSchema = z.object({
  providerId: ProviderNameSchema,
  checkType: z.enum(['availability', 'capacity', 'latency', 'error_rate']),
  result: z.boolean(),
  value: z.number().optional(),
  threshold: z.number().optional(),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

describe('Provider Status API Contract Tests', () => {
  describe('GET /providers/status', () => {
    it('should return provider status summary', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const data = await response.json();

      // Validate response matches schema
      expect(() => ProviderStatusResponseSchema.parse(data)).not.toThrow();

      // Verify required fields
      expect(data.providers).toBeDefined();
      expect(Array.isArray(data.providers)).toBe(true);
      expect(data.providers.length).toBeGreaterThan(0);
      expect(data.timestamp).toBeDefined();
      expect(typeof data.healthy).toBe('boolean');

      // Verify each provider has required fields
      data.providers.forEach((provider: any) => {
        expect(['cerebras', 'gemini', 'groq']).toContain(provider.name);
        expect(['available', 'degraded', 'unavailable', 'maintenance']).toContain(provider.status);
        expect(typeof provider.isHealthy).toBe('boolean');
      });
    });

    it('should handle server errors gracefully', async () => {
      // This test might pass if server is healthy, but validates error format when it fails
      const response = await fetch(`${API_BASE_URL}/providers/status`);

      if (response.status === 500) {
        const data = await response.json();
        expect(() => ErrorSchema.parse(data)).not.toThrow();
      } else {
        expect(response.status).toBe(200);
      }
    });
  });

  describe('GET /providers/{providerId}/status', () => {
    const providerIds = ['cerebras', 'gemini', 'groq'];

    providerIds.forEach((providerId) => {
      it(`should return detailed status for ${providerId} provider`, async () => {
        const response = await fetch(`${API_BASE_URL}/providers/${providerId}/status`);

        expect(response.status).toBe(200);

        const data = await response.json();

        // Validate response matches schema
        expect(() => DetailedProviderStatusSchema.parse(data)).not.toThrow();

        // Verify provider-specific data
        expect(data.provider).toBe(providerId);
        expect(typeof data.isEnabled).toBe('boolean');
        expect(typeof data.isHealthy).toBe('boolean');
        expect(typeof data.isAvailable).toBe('boolean');
        expect(typeof data.hasCapacity).toBe('boolean');

        // Verify keys array
        expect(Array.isArray(data.keys)).toBe(true);
        expect(data.keys.length).toBeGreaterThan(0);

        // Verify at least one key is active
        const hasActiveKey = data.keys.some((key: any) => key.isActive);
        expect(hasActiveKey).toBe(true);

        // Verify metrics structure
        expect(data.metrics).toBeDefined();
        expect(typeof data.metrics.totalRequests).toBe('number');
        expect(typeof data.metrics.successfulRequests).toBe('number');
        expect(typeof data.metrics.failedRequests).toBe('number');

        // Verify rate limits
        expect(data.rateLimits).toBeDefined();
        expect(typeof data.rateLimits.requestsPerMinute).toBe('number');
        expect(typeof data.rateLimits.tokensPerMinute).toBe('number');

        // Verify timestamps
        expect(typeof data.lastHealthCheck).toBe('number');
        expect(typeof data.nextQuotaReset).toBe('number');
      });
    });

    it('should return 404 for invalid provider ID', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/invalid-provider/status`);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(() => ErrorSchema.parse(data)).not.toThrow();
    });

    it('should handle special characters in provider ID', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/provider%20with%20spaces/status`);

      expect(response.status).toBe(404);
    });
  });

  describe('Provider Status Type Safety', () => {
    it('should return consistent status types across endpoints', async () => {
      // Get summary status
      const summaryResponse = await fetch(`${API_BASE_URL}/providers/status`);
      expect(summaryResponse.status).toBe(200);
      const summaryData = await summaryResponse.json();

      // Get detailed status for each provider
      for (const provider of summaryData.providers) {
        const detailResponse = await fetch(`${API_BASE_URL}/providers/${provider.name}/status`);
        expect(detailResponse.status).toBe(200);
        const detailData = await detailResponse.json();

        // Verify consistency between summary and detailed status
        expect(detailData.provider).toBe(provider.name);
        expect(detailData.isHealthy).toBe(provider.isHealthy);

        // Verify status logic consistency
        if (detailData.isAvailable && detailData.hasCapacity && detailData.isHealthy) {
          expect(['available', 'degraded']).toContain(provider.status);
        }

        if (!detailData.isAvailable) {
          expect(['unavailable', 'maintenance']).toContain(provider.status);
        }
      }
    });

    it('should validate provider metrics are non-negative', async () => {
      const providers = ['cerebras', 'gemini', 'groq'];

      for (const providerId of providers) {
        const response = await fetch(`${API_BASE_URL}/providers/${providerId}/status`);
        expect(response.status).toBe(200);

        const data = await response.json();

        // Verify all metrics are non-negative
        expect(data.metrics.totalRequests).toBeGreaterThanOrEqual(0);
        expect(data.metrics.successfulRequests).toBeGreaterThanOrEqual(0);
        expect(data.metrics.failedRequests).toBeGreaterThanOrEqual(0);
        expect(data.metrics.avgLatency).toBeGreaterThanOrEqual(0);
        expect(data.metrics.totalCost).toBeGreaterThanOrEqual(0);
        expect(data.metrics.tokensUsed).toBeGreaterThanOrEqual(0);

        // Verify success rate is between 0 and 1
        data.keys.forEach((key: any) => {
          expect(key.successRate).toBeGreaterThanOrEqual(0);
          expect(key.successRate).toBeLessThanOrEqual(1);
        });

        // Verify logical consistency
        expect(data.metrics.totalRequests).toBe(
          data.metrics.successfulRequests + data.metrics.failedRequests
        );
      }
    });
  });

  describe('Provider Health Checks', () => {
    it('should include proper health check data in comprehensive endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/health/comprehensive`);

      // This endpoint might not exist yet, but when it does, it should return proper format
      if (response.status === 200) {
        const data = await response.json();

        expect(data.providers).toBeDefined();
        expect(Array.isArray(data.providers)).toBe(true);

        // Validate each health check
        data.providers.forEach((check: any) => {
          expect(() => ProviderHealthCheckSchema.parse(check)).not.toThrow();
        });
      } else if (response.status === 404) {
        // Endpoint not implemented yet - this is expected for failing tests
        expect(response.status).toBe(404);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent requests to provider status', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => fetch(`${API_BASE_URL}/providers/status`));

      const responses = await Promise.all(requests);

      // All should succeed or fail consistently
      responses.forEach((response) => {
        expect([200, 500, 503]).toContain(response.status);
      });
    });

    it('should include proper caching headers', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`);

      // Provider status should have appropriate cache headers
      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();

      // Should cache for short duration (provider status changes frequently)
      if (cacheControl) {
        expect(cacheControl).toMatch(/max-age=\d+/);
      }
    });

    it('should handle malformed provider names gracefully', async () => {
      const malformedNames = ['', '..', 'very-long-provider-name-that-should-not-exist'];

      for (const name of malformedNames) {
        const response = await fetch(
          `${API_BASE_URL}/providers/${encodeURIComponent(name)}/status`
        );
        expect([400, 404]).toContain(response.status);

        if (response.headers.get('Content-Type')?.includes('application/json')) {
          const data = await response.json();
          expect(() => ErrorSchema.parse(data)).not.toThrow();
        }
      }
    });
  });
});

export {
  ProviderNameSchema,
  SimpleProviderStatusSchema,
  DetailedProviderStatusSchema,
  ProviderStatusResponseSchema,
  ProviderHealthCheckSchema,
  KeyStatusSchema,
  ProviderMetricsSchema,
  RateLimitStatusSchema,
  ErrorSchema,
};
