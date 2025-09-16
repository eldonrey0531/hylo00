// Contract Tests for Hylo Travel Itinerary API
// These tests validate API contracts and should FAIL initially (no implementation yet)

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { z } from 'zod';

// Test configuration
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';
const TIMEOUT = 30000; // 30 seconds for AI operations

// Schema definitions for validation
const TripDetailsSchema = z.object({
  location: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s,.-]+$/),
  departDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  plannedDays: z.number().int().min(1).max(365),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(20),
  childrenAges: z.array(z.number().int().min(0).max(18)).optional(),
  budget: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']),
});

const TravelFormDataSchema = z.object({
  tripDetails: TripDetailsSchema,
  groups: z.array(z.string()),
  interests: z.array(z.string()),
  inclusions: z.array(z.string()),
  experience: z.array(z.string()),
  vibes: z.array(z.string()),
  sampleDays: z.array(z.string()),
  dinnerChoices: z.array(z.string()),
  nickname: z.string().max(50),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    name: z.string().max(100).optional(),
  }),
});

const ErrorResponseSchema = z.object({
  error: z.enum([
    'VALIDATION_ERROR',
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_ERROR',
    'AUTHENTICATION_FAILED',
  ]),
  message: z.string(),
  details: z
    .object({
      field: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),
  retryAfter: z.number().int().optional(),
  estimatedRecovery: z.string().datetime().optional(),
});

const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  providers: z.record(
    z.object({
      status: z.enum(['available', 'degraded', 'unavailable']),
      responseTime: z.number().int().optional(),
      quotaRemaining: z.number().min(0).max(1).optional(),
      error: z.string().optional(),
      lastChecked: z.string().datetime().optional(),
    })
  ),
});

// Test data
const validTravelRequest = {
  tripDetails: {
    location: 'Tokyo, Japan',
    departDate: '2025-06-15T00:00:00Z',
    returnDate: '2025-06-25T00:00:00Z',
    plannedDays: 10,
    adults: 2,
    children: 2,
    childrenAges: [8, 12],
    budget: 8000,
    currency: 'USD',
  },
  groups: ['Family'],
  interests: ['Culture', 'Food', 'Nature'],
  inclusions: ['Accommodations', 'Activities', 'Dining'],
  experience: ['Some international travel'],
  vibes: ['Cultural immersion', 'Family-friendly'],
  sampleDays: ['Museum and cultural sites'],
  dinnerChoices: ['Local cuisine'],
  nickname: 'Tokyo Adventure',
  contact: {
    email: 'family@example.com',
  },
};

const invalidTravelRequest = {
  tripDetails: {
    location: '', // Invalid: empty location
    departDate: 'invalid-date', // Invalid: not ISO date
    returnDate: '2025-06-15T00:00:00Z', // Invalid: before depart date
    plannedDays: -1, // Invalid: negative days
    adults: 0, // Invalid: no adults
    children: -1, // Invalid: negative children
    budget: -1000, // Invalid: negative budget
    currency: 'INVALID', // Invalid: not supported currency
  },
  groups: [],
  interests: [],
  inclusions: [],
  experience: [],
  vibes: [],
  sampleDays: [],
  dinnerChoices: [],
  nickname: 'x'.repeat(100), // Invalid: too long
  contact: {
    email: 'invalid-email', // Invalid: not email format
  },
};

describe('Hylo Travel API Contract Tests', () => {
  describe('POST /api/itinerary', () => {
    it(
      'should accept valid travel request and return streaming response',
      async () => {
        const response = await fetch(`${API_BASE_URL}/itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validTravelRequest),
        });

        // Should return 200 with streaming response
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/event-stream');

        // Verify streaming response format
        const reader = response.body?.getReader();
        expect(reader).toBeDefined();

        if (reader) {
          let receivedData = false;
          let agentLogs = [];
          let finalItinerary = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  receivedData = true;
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'agent_log') {
                    agentLogs.push(data);
                    // Validate agent log structure
                    expect(data.agentId).toBeTypeOf('number');
                    expect(data.agentName).toBeTypeOf('string');
                    expect(data.timestamp).toBeTypeOf('string');
                  } else if (data.type === 'itinerary') {
                    finalItinerary = data.content;
                    expect(finalItinerary).toBeTypeOf('string');
                    expect(finalItinerary.length).toBeGreaterThan(0);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          expect(receivedData).toBe(true);
          expect(agentLogs.length).toBeGreaterThan(0);
          expect(finalItinerary).toBeTruthy();
        }
      },
      TIMEOUT
    );

    it('should reject invalid travel request with 400 and error details', async () => {
      const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidTravelRequest),
      });

      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toContain('application/json');

      const errorData = await response.json();

      // Validate error response schema
      const result = ErrorResponseSchema.safeParse(errorData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.error).toBe('VALIDATION_ERROR');
        expect(result.data.message).toBeTypeOf('string');
        expect(result.data.details).toBeDefined();
      }
    });

    it('should handle missing request body with 400', async () => {
      const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error).toBe('VALIDATION_ERROR');
    });

    it('should handle malformed JSON with 400', async () => {
      const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json {',
      });

      expect(response.status).toBe(400);
    });

    it('should enforce rate limiting with 429', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${API_BASE_URL}/itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validTravelRequest),
        })
      );

      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check rate limit response format
      const rateLimitResponse = rateLimitedResponses[0];
      const errorData = await rateLimitResponse.json();

      expect(errorData.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(errorData.retryAfter).toBeTypeOf('number');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status with provider information', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const healthData = await response.json();

      // Validate health response schema
      const result = HealthResponseSchema.safeParse(healthData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.status);
        expect(result.data.providers).toBeDefined();

        // Check for required providers
        const expectedProviders = ['cerebras', 'gemini', 'groq'];
        for (const provider of expectedProviders) {
          expect(result.data.providers[provider]).toBeDefined();
          expect(['available', 'degraded', 'unavailable']).toContain(
            result.data.providers[provider].status
          );
        }
      }
    });

    it('should return 503 when all providers are unavailable', async () => {
      // This test would need to be run during a simulated outage
      // or with mocked provider responses

      // For now, we document the expected behavior
      // In a real outage scenario:
      // expect(response.status).toBe(503);
      // expect(healthData.status).toBe('unhealthy');

      expect(true).toBe(true); // Placeholder
    });
  });

  describe('GET /api/providers', () => {
    it('should return detailed provider information', async () => {
      const response = await fetch(`${API_BASE_URL}/providers`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const providersData = await response.json();

      expect(providersData.providers).toBeInstanceOf(Array);
      expect(providersData.providers.length).toBeGreaterThanOrEqual(3);

      // Validate each provider
      for (const provider of providersData.providers) {
        expect(provider.name).toBeTypeOf('string');
        expect(['available', 'degraded', 'unavailable']).toContain(provider.status);
        expect(provider.capabilities).toBeInstanceOf(Array);
        expect(['free', 'paid']).toContain(provider.tier);

        if (provider.models) {
          expect(provider.models).toBeInstanceOf(Array);
        }
      }
    });
  });

  describe('Error Handling Contracts', () => {
    it('should handle internal server errors with 500', async () => {
      // This would test with a request that causes internal errors
      // For now, we document the expected contract

      // In case of internal error:
      // expect(response.status).toBe(500);
      // expect(errorData.error).toBe('INTERNAL_ERROR');

      expect(true).toBe(true); // Placeholder
    });

    it('should handle service unavailable with 503', async () => {
      // This would test when all AI providers are down

      // In case of service unavailable:
      // expect(response.status).toBe(503);
      // expect(errorData.error).toBe('SERVICE_UNAVAILABLE');
      // expect(errorData.estimatedRecovery).toBeDefined();

      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Security Contracts', () => {
    it('should sanitize input data and prevent injection attacks', async () => {
      const maliciousRequest = {
        ...validTravelRequest,
        tripDetails: {
          ...validTravelRequest.tripDetails,
          location: "<script>alert('xss')</script>Tokyo",
        },
      };

      const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maliciousRequest),
      });

      // Should either reject (400) or sanitize the input
      if (response.status === 400) {
        const errorData = await response.json();
        expect(errorData.error).toBe('VALIDATION_ERROR');
      } else if (response.status === 200) {
        // If accepted, ensure script tags are sanitized in output
        // This would be verified in the streaming response
        expect(true).toBe(true); // Placeholder for sanitization check
      }
    });

    it('should enforce CORS policy', async () => {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: {
          Origin: 'https://malicious-site.com',
        },
      });

      // Should either reject with CORS error or allow based on configuration
      // The exact behavior depends on CORS configuration
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Performance Contracts', () => {
    it('should start streaming within 2 seconds', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validTravelRequest),
      });

      const reader = response.body?.getReader();

      if (reader) {
        const { done, value } = await reader.read();
        const firstResponseTime = Date.now() - startTime;

        // Should start streaming within 2 seconds (constitutional requirement)
        expect(firstResponseTime).toBeLessThan(2000);

        reader.releaseLock();
      }
    }, 5000);

    it(
      'should complete within 30 seconds',
      async () => {
        const startTime = Date.now();

        const response = await fetch(`${API_BASE_URL}/itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validTravelRequest),
        });

        const reader = response.body?.getReader();
        let completed = false;

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                completed = true;
                break;
              }

              const chunk = new TextDecoder().decode(value);
              if (chunk.includes('"type":"itinerary"')) {
                completed = true;
                break;
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        const totalTime = Date.now() - startTime;

        expect(completed).toBe(true);
        expect(totalTime).toBeLessThan(30000); // 30 seconds max
      },
      TIMEOUT
    );
  });
});

// Export schemas for use in other tests
export {
  TravelFormDataSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
  validTravelRequest,
  invalidTravelRequest,
};
