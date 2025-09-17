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

const ProviderSummarySchema = z.object({
  name: ProviderNameSchema,
  status: SimpleProviderStatusSchema,
  isHealthy: z.boolean(),
  lastChecked: z.string().datetime(),
});

const ProvidersStatusResponseSchema = z.object({
  providers: z.array(ProviderSummarySchema),
  timestamp: z.string().datetime(),
  healthy: z.boolean(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

// Test configuration
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3000/api';

describe('Provider Status API Contract Tests', () => {
  describe('GET /api/providers/status', () => {
    it('should return all provider status summary', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`);

      // This test MUST FAIL initially (implementation doesn't exist)
      expect(response.status).toBe(200);

      const data = await response.json();
      const result = ProvidersStatusResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.providers).toHaveLength(3); // cerebras, gemini, groq
        expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
        expect(typeof result.data.healthy).toBe('boolean');

        // Validate each provider in the summary
        result.data.providers.forEach((provider) => {
          expect(['cerebras', 'gemini', 'groq']).toContain(provider.name);
          expect(['available', 'degraded', 'unavailable', 'maintenance']).toContain(
            provider.status
          );
          expect(typeof provider.isHealthy).toBe('boolean');
          expect(new Date(provider.lastChecked)).toBeInstanceOf(Date);
        });
      }
    });

    it('should include proper cache headers', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`);

      // Should have appropriate cache headers for status endpoint
      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toBeTruthy();
      expect(cacheControl).toContain('max-age');
    });

    it('should handle CORS for status endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`, {
        method: 'OPTIONS',
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });
  });

  describe('GET /api/providers/{provider}/status', () => {
    const providers = ['cerebras', 'gemini', 'groq'] as const;

    providers.forEach((provider) => {
      describe(`Provider: ${provider}`, () => {
        it(`should return detailed status for ${provider}`, async () => {
          const response = await fetch(`${API_BASE_URL}/providers/${provider}/status`);

          // This test MUST FAIL initially (implementation doesn't exist)
          expect(response.status).toBe(200);

          const data = await response.json();
          const result = DetailedProviderStatusSchema.safeParse(data);
          expect(result.success).toBe(true);

          if (result.success) {
            expect(result.data.provider).toBe(provider);
            expect(typeof result.data.isEnabled).toBe('boolean');
            expect(typeof result.data.isHealthy).toBe('boolean');
            expect(typeof result.data.isAvailable).toBe('boolean');
            expect(typeof result.data.hasCapacity).toBe('boolean');
            expect(Array.isArray(result.data.keys)).toBe(true);
            expect(result.data.keys.length).toBeGreaterThan(0);
            expect(typeof result.data.activeKeyId).toBe('string');
            expect(typeof result.data.lastHealthCheck).toBe('number');
            expect(typeof result.data.nextQuotaReset).toBe('number');

            // Validate metrics structure
            expect(typeof result.data.metrics.totalRequests).toBe('number');
            expect(typeof result.data.metrics.successfulRequests).toBe('number');
            expect(typeof result.data.metrics.failedRequests).toBe('number');
            expect(typeof result.data.metrics.avgLatency).toBe('number');

            // Validate rate limits structure
            expect(typeof result.data.rateLimits.requestsPerMinute).toBe('number');
            expect(typeof result.data.rateLimits.currentRpm).toBe('number');
          }
        });

        it(`should validate key status for ${provider}`, async () => {
          const response = await fetch(`${API_BASE_URL}/providers/${provider}/status`);

          if (response.status === 200) {
            const data = await response.json();
            const result = DetailedProviderStatusSchema.safeParse(data);

            if (result.success && result.data.keys.length > 0) {
              const key = result.data.keys[0];
              expect(typeof key?.keyId).toBe('string');
              expect(['primary', 'secondary', 'tertiary']).toContain(key?.type);
              expect(typeof key?.isActive).toBe('boolean');
              expect(typeof key?.quotaUsed).toBe('number');
              expect(typeof key?.quotaLimit).toBe('number');
              expect(key?.successRate).toBeGreaterThanOrEqual(0);
              expect(key?.successRate).toBeLessThanOrEqual(1);
            }
          }
        });
      });
    });

    it('should return 404 for unknown provider', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/unknown/status`);

      expect(response.status).toBe(404);

      const data = await response.json();
      const result = ErrorSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle provider validation errors', async () => {
      const invalidProviders = ['', 'invalid', '123', 'openai'];

      for (const invalidProvider of invalidProviders) {
        const response = await fetch(`${API_BASE_URL}/providers/${invalidProvider}/status`);
        expect([400, 404]).toContain(response.status);

        const data = await response.json();
        const result = ErrorSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Response Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/providers/status`);
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      // Provider status should respond quickly (within 500ms for summary)
      expect(responseTime).toBeLessThan(500);

      if (response.status === 200) {
        expect(response.headers.get('Content-Type')).toContain('application/json');
      }
    });

    it('should respond quickly for individual provider status', async () => {
      const startTime = Date.now();
      await fetch(`${API_BASE_URL}/providers/cerebras/status`);
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      // Individual provider status should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/status`, {
        method: 'POST', // Wrong method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.status).toBe(405); // Method Not Allowed

      const data = await response.json();
      const result = ErrorSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should include proper error structure', async () => {
      const response = await fetch(`${API_BASE_URL}/providers/nonexistent/status`);

      expect(response.status).toBe(404);

      const data = await response.json();
      const result = ErrorSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.error).toBe('string');
        expect(typeof result.data.message).toBe('string');
        expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
      }
    });
  });

  describe('Schema Validation', () => {
    it('should validate SimpleProviderStatus enum', () => {
      const validStatuses = ['available', 'degraded', 'unavailable', 'maintenance'];

      validStatuses.forEach((status) => {
        const result = SimpleProviderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });

      const invalidStatus = 'invalid-status';
      const result = SimpleProviderStatusSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should validate ProviderName enum', () => {
      const validProviders = ['cerebras', 'gemini', 'groq'];

      validProviders.forEach((provider) => {
        const result = ProviderNameSchema.safeParse(provider);
        expect(result.success).toBe(true);
      });

      const invalidProvider = 'openai';
      const result = ProviderNameSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });
  });
});
