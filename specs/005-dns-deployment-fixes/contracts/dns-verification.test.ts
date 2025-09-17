/**
 * Contract Tests: DNS Verification API
 *
 * Tests the DNS verification endpoints to ensure they match the OpenAPI specification.
 * These tests should fail initially as the implementation doesn't exist yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { z } from 'zod';

// Zod schemas for contract validation
const DNSVerificationRequestSchema = z.object({
  domain: z.string().min(1),
  expectedIP: z.string().ip().optional(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  timeout: z.number().min(60000).max(1800000),
  retryInterval: z.number().min(10000).max(300000),
  maxRetries: z.number().min(1).max(100),
});

const DNSVerificationInitiatedSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.literal('pending'),
  estimatedCompletion: z.string().datetime(),
});

const DNSVerificationResponseSchema = z.object({
  domain: z.string(),
  verified: z.boolean(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  resolvedValue: z.string().nullable(),
  propagationTime: z.number(),
  attempts: z.number(),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
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
const TEST_DOMAIN = 'hylo-test.vercel.app';

describe('DNS Verification API Contract Tests', () => {
  let verificationId: string | null = null;

  describe('POST /dns/verify', () => {
    it('should accept valid DNS verification request', async () => {
      const request = {
        domain: TEST_DOMAIN,
        recordType: 'A' as const,
        timeout: 900000,
        retryInterval: 30000,
        maxRetries: 30,
      };

      // Validate request matches schema
      expect(() => DNSVerificationRequestSchema.parse(request)).not.toThrow();

      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Should return 202 Accepted
      expect(response.status).toBe(202);

      const data = await response.json();

      // Validate response matches schema
      expect(() => DNSVerificationInitiatedSchema.parse(data)).not.toThrow();

      // Store verification ID for polling test
      verificationId = data.verificationId;

      expect(data.status).toBe('pending');
      expect(data.verificationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should reject invalid domain', async () => {
      const request = {
        domain: '',
        recordType: 'A' as const,
        timeout: 900000,
        retryInterval: 30000,
        maxRetries: 30,
      };

      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(() => ErrorSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid timeout values', async () => {
      const request = {
        domain: TEST_DOMAIN,
        recordType: 'A' as const,
        timeout: 30000, // Too short (< 60000)
        retryInterval: 30000,
        maxRetries: 30,
      };

      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid record type', async () => {
      const request = {
        domain: TEST_DOMAIN,
        recordType: 'MX' as any, // Invalid type
        timeout: 900000,
        retryInterval: 30000,
        maxRetries: 30,
      };

      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /dns/verify/{verificationId}', () => {
    it('should return verification status for valid ID', async () => {
      // Skip if we don't have a verification ID from previous test
      if (!verificationId) {
        console.warn('Skipping verification status test - no verification ID available');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dns/verify/${verificationId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(() => DNSVerificationResponseSchema.parse(data)).not.toThrow();

      expect(data.domain).toBe(TEST_DOMAIN);
      expect(typeof data.verified).toBe('boolean');
      expect(data.recordType).toBe('A');
      expect(typeof data.propagationTime).toBe('number');
      expect(typeof data.attempts).toBe('number');
    });

    it('should return 404 for non-existent verification ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await fetch(`${API_BASE_URL}/dns/verify/${fakeId}`);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(() => ErrorSchema.parse(data)).not.toThrow();
    });

    it('should return 400 for invalid UUID format', async () => {
      const invalidId = 'not-a-uuid';

      const response = await fetch(`${API_BASE_URL}/dns/verify/${invalidId}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting for DNS verification requests', async () => {
      const request = {
        domain: TEST_DOMAIN,
        recordType: 'A' as const,
        timeout: 900000,
        retryInterval: 30000,
        maxRetries: 30,
      };

      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(10)
        .fill(null)
        .map(() =>
          fetch(`${API_BASE_URL}/dns/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          })
        );

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429)
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format for malformed JSON', async () => {
      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(() => ErrorSchema.parse(data)).not.toThrow();
    });

    it('should handle missing Content-Type header', async () => {
      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'POST',
        body: JSON.stringify({
          domain: TEST_DOMAIN,
          recordType: 'A',
          timeout: 900000,
          retryInterval: 30000,
          maxRetries: 30,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('CORS Compliance', () => {
    it('should include proper CORS headers', async () => {
      const response = await fetch(`${API_BASE_URL}/dns/verify`, {
        method: 'OPTIONS',
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });
  });
});

describe('DNS Verification Integration Scenarios', () => {
  it('should handle complete verification workflow', async () => {
    // 1. Start verification
    const startRequest = {
      domain: TEST_DOMAIN,
      recordType: 'A' as const,
      timeout: 300000, // 5 minutes for integration test
      retryInterval: 10000, // 10 seconds
      maxRetries: 30,
    };

    const startResponse = await fetch(`${API_BASE_URL}/dns/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startRequest),
    });

    expect(startResponse.status).toBe(202);
    const startData = await startResponse.json();
    const verificationId = startData.verificationId;

    // 2. Poll for completion (with timeout)
    const pollStart = Date.now();
    const maxPollTime = 60000; // 1 minute max for test
    let completed = false;
    let finalResult;

    while (!completed && Date.now() - pollStart < maxPollTime) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const pollResponse = await fetch(`${API_BASE_URL}/dns/verify/${verificationId}`);
      expect(pollResponse.status).toBe(200);

      const pollData = await pollResponse.json();

      if (pollData.verified || pollData.error) {
        completed = true;
        finalResult = pollData;
      }
    }

    // 3. Verify final result structure
    if (finalResult) {
      expect(() => DNSVerificationResponseSchema.parse(finalResult)).not.toThrow();
      expect(finalResult.domain).toBe(TEST_DOMAIN);
      expect(typeof finalResult.verified).toBe('boolean');
    }
  });
});

export {
  DNSVerificationRequestSchema,
  DNSVerificationInitiatedSchema,
  DNSVerificationResponseSchema,
  ErrorSchema,
};
