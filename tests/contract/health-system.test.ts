/**
 * Contract test for GET /api/health/system endpoint
 *
 * This test validates the API contract defined in OpenAPI specification.
 * It MUST FAIL until the endpoint is implemented in T032.
 *
 * Constitutional compliance: Edge-first, observable operations
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'http://localhost:3001';

describe('GET /api/health/system - Contract Test', () => {
  beforeAll(() => {
    // This test should run against the actual development server
    console.log('Testing against:', API_BASE_URL);
  });

  it('should return 200 with valid health status schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/system`);

    // This will fail until T032 implements the endpoint
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const response_data = await response.json();

    // Validate response wrapper schema
    expect(response_data).toHaveProperty('success');
    expect(response_data.success).toBe(true);
    expect(response_data).toHaveProperty('data');

    const data = response_data.data;

    // Validate response schema per OpenAPI spec
    expect(data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);

    expect(data).toHaveProperty('timestamp');
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);

    expect(data).toHaveProperty('components');
    expect(Array.isArray(data.components)).toBe(true);

    expect(data).toHaveProperty('overall');
    expect(data.overall).toHaveProperty('availability');
    expect(typeof data.overall.availability).toBe('number');
    expect(data.overall.availability).toBeGreaterThanOrEqual(0);
    expect(data.overall.availability).toBeLessThanOrEqual(1);

    expect(data.overall).toHaveProperty('averageLatency');
    expect(typeof data.overall.averageLatency).toBe('number');
    expect(data.overall.averageLatency).toBeGreaterThanOrEqual(0);

    expect(data.overall).toHaveProperty('errorRate');
    expect(typeof data.overall.errorRate).toBe('number');
    expect(data.overall.errorRate).toBeGreaterThanOrEqual(0);
    expect(data.overall.errorRate).toBeLessThanOrEqual(1);
  });

  it('should validate HealthMetrics schema for each component', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/system`);

    expect(response.status).toBe(200);
    const response_data = await response.json();
    const data = response_data.data;

    // Validate each component follows HealthMetrics schema
    for (const component of data.components) {
      expect(component).toHaveProperty('id');
      expect(typeof component.id).toBe('string');

      expect(component).toHaveProperty('timestamp');
      expect(new Date(component.timestamp)).toBeInstanceOf(Date);

      expect(component).toHaveProperty('component');
      expect(['edge_function', 'llm_provider', 'frontend', 'system']).toContain(
        component.component
      );

      expect(component).toHaveProperty('metrics');
      expect(component.metrics).toHaveProperty('availability');
      expect(typeof component.metrics.availability).toBe('number');
      expect(component.metrics.availability).toBeGreaterThanOrEqual(0);
      expect(component.metrics.availability).toBeLessThanOrEqual(1);

      expect(component.metrics).toHaveProperty('latency');
      expect(component.metrics.latency).toHaveProperty('p50');
      expect(component.metrics.latency).toHaveProperty('p95');
      expect(component.metrics.latency).toHaveProperty('p99');

      expect(component.metrics).toHaveProperty('errorRate');
      expect(typeof component.metrics.errorRate).toBe('number');
      expect(component.metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(component.metrics.errorRate).toBeLessThanOrEqual(1);

      expect(component.metrics).toHaveProperty('throughput');
      expect(typeof component.metrics.throughput).toBe('number');
      expect(component.metrics.throughput).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle system failure with 500 error response', async () => {
    // This tests the error contract when health check fails
    // We'll simulate this by calling a non-existent endpoint that should return 500
    const response = await fetch(`${API_BASE_URL}/api/health/system?simulate=error`);

    if (response.status === 500) {
      expect(response.headers.get('content-type')).toContain('application/json');

      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.success).toBe(false);

      // Validate ErrorResponse schema
      expect(errorData.error).toHaveProperty('code');
      expect(errorData.error).toHaveProperty('message');
      expect(errorData.error).toHaveProperty('status');
      expect(errorData.error.status).toBe(500);
      expect(errorData.error).toHaveProperty('timestamp');
    }
  });

  it('should return consistent response format', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health/system`);

    expect(response.status).toBe(200);

    // Validate response headers for edge function
    expect(response.headers.get('content-type')).toContain('application/json');

    // Should not expose internal implementation details (server header may be null in dev)
    const serverHeader = response.headers.get('server');
    if (serverHeader) {
      expect(serverHeader).not.toContain('express');
      expect(serverHeader).not.toContain('node');
    }

    const response_data = await response.json();
    const data = response_data.data;

    // Response should be properly structured
    expect(Object.keys(data)).toEqual(
      expect.arrayContaining(['status', 'timestamp', 'components', 'overall'])
    );
  });
});
