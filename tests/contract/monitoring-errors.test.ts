/**
 * Contract Test: GET /api/monitoring/errors
 *
 * Tests error tracking and reporting endpoint contract.
 * Validates that error monitoring follows constitutional requirements.
 *
 * Constitutional Requirements:
 * - Observable AI Operations: All errors are tracked and logged
 * - Progressive Enhancement: System provides error context
 * - Security by Default: Error details are sanitized
 * - Edge-First Architecture: Endpoint runs on Edge Runtime
 */

import { describe, it, expect } from 'vitest';

const API_BASE_URL = process.env['VITE_API_BASE_URL'] || 'http://localhost:3000';

describe('GET /api/monitoring/errors Contract Tests', () => {
  it('should return error tracking data with proper schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
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
    expect(data).toHaveProperty('errors');
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('timeRange');
    expect(data).toHaveProperty('timestamp');

    // Validate errors is an array
    expect(Array.isArray(data.errors)).toBe(true);

    // Validate summary object
    expect(data.summary).toHaveProperty('total');
    expect(data.summary).toHaveProperty('byLevel');
    expect(data.summary).toHaveProperty('byComponent');
    expect(data.summary).toHaveProperty('recentTrends');
    expect(typeof data.summary.total).toBe('number');

    // Validate error level breakdown
    expect(data.summary.byLevel).toHaveProperty('critical');
    expect(data.summary.byLevel).toHaveProperty('error');
    expect(data.summary.byLevel).toHaveProperty('warning');
    expect(data.summary.byLevel).toHaveProperty('info');

    // Validate component breakdown
    expect(data.summary.byComponent).toHaveProperty('llm');
    expect(data.summary.byComponent).toHaveProperty('routing');
    expect(data.summary.byComponent).toHaveProperty('auth');
    expect(data.summary.byComponent).toHaveProperty('frontend');

    // Validate time range
    expect(data.timeRange).toHaveProperty('start');
    expect(data.timeRange).toHaveProperty('end');
    expect(data.timeRange).toHaveProperty('period');

    // If errors exist, validate error object structure
    if (data.errors.length > 0) {
      const error = data.errors[0];
      expect(error).toHaveProperty('id');
      expect(error).toHaveProperty('timestamp');
      expect(error).toHaveProperty('level');
      expect(error).toHaveProperty('component');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('context');
      expect(['critical', 'error', 'warning', 'info']).toContain(error.level);
      expect(['llm', 'routing', 'auth', 'frontend', 'system']).toContain(error.component);
    }
  });

  it('should support filtering by error level', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?level=error`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    expect(data).toHaveProperty('errors');
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('level', 'error');

    // All returned errors should match the filter
    data.errors.forEach((error: any) => {
      expect(error.level).toBe('error');
    });
  });

  it('should support filtering by component', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?component=llm`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('component', 'llm');

    // All returned errors should match the filter
    data.errors.forEach((error: any) => {
      expect(error.component).toBe('llm');
    });
  });

  it('should support time range filtering', async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const response = await fetch(
      `${API_BASE_URL}/api/monitoring/errors?start=${oneHourAgo.toISOString()}&end=${now.toISOString()}`,
      {
        method: 'GET',
      }
    );

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    expect(data).toHaveProperty('timeRange');
    expect(data.timeRange.start).toBe(oneHourAgo.toISOString());
    expect(data.timeRange.end).toBe(now.toISOString());

    // All errors should be within the time range
    data.errors.forEach((error: any) => {
      const errorTime = new Date(error.timestamp);
      expect(errorTime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
      expect(errorTime.getTime()).toBeLessThanOrEqual(now.getTime());
    });
  });

  it('should support pagination', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?page=1&limit=10`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('page', 1);
    expect(data.pagination).toHaveProperty('limit', 10);
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('totalPages');

    // Ensure we don't return more than the limit
    expect(data.errors.length).toBeLessThanOrEqual(10);
  });

  it('should sanitize error details for security', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Check that sensitive information is not exposed
    data.errors.forEach((error: any) => {
      // Error messages should not contain API keys, tokens, or passwords
      expect(error.message).not.toMatch(/api[_-]?key/i);
      expect(error.message).not.toMatch(/token/i);
      expect(error.message).not.toMatch(/password/i);
      expect(error.message).not.toMatch(/secret/i);

      // Stack traces should be sanitized or limited
      if (error.stack) {
        expect(error.stack.length).toBeLessThan(2000); // Reasonable stack trace limit
      }

      // Context should not contain sensitive data
      if (error.context && error.context.headers) {
        expect(error.context.headers).not.toHaveProperty('authorization');
        expect(error.context.headers).not.toHaveProperty('x-api-key');
      }
    });
  });

  it('should include correlation IDs for observability', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Check for correlation IDs in errors
    data.errors.forEach((error: any) => {
      if (error.context) {
        // Should have some form of correlation ID for tracing
        const hasCorrelationId =
          error.context.requestId || error.context.traceId || error.context.correlationId;

        if (hasCorrelationId) {
          expect(typeof hasCorrelationId).toBe('string');
          expect(hasCorrelationId.length).toBeGreaterThan(0);
        }
      }
    });
  });

  it('should support error trend analysis', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?includeTrends=true`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    expect(data.summary).toHaveProperty('recentTrends');

    const trends = data.summary.recentTrends;
    expect(trends).toHaveProperty('last1h');
    expect(trends).toHaveProperty('last24h');
    expect(trends).toHaveProperty('last7d');

    // Trends should include count and percentage change
    Object.values(trends).forEach((trend: any) => {
      expect(trend).toHaveProperty('count');
      expect(trend).toHaveProperty('percentageChange');
      expect(typeof trend.count).toBe('number');
      expect(typeof trend.percentageChange).toBe('number');
    });
  });

  it('should include proper cache control headers', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);

    // Error data should have short cache TTL for near real-time monitoring
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toMatch(/max-age=[1-9]\d?/); // 1-99 seconds

    // Should include ETag for conditional requests
    const etag = response.headers.get('etag');
    expect(etag).toBeTruthy();
  });

  it('should handle CORS headers properly', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
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

  it('should support real-time error streaming', async () => {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?stream=true`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    // Should support streaming for real-time error monitoring
    if (response.status === 200) {
      expect(response.headers.get('content-type')).toMatch(/text\/event-stream/);
      expect(response.headers.get('cache-control')).toMatch(/no-cache/);
      expect(response.headers.get('connection')).toMatch(/keep-alive/);
    } else {
      // If streaming not implemented, should return 501 Not Implemented
      expect(response.status).toBe(501);
    }
  });
});
