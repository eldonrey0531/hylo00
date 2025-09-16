import { describe, it, expect } from 'vitest';

/**
 * Contract tests for GET /api/llm/health endpoint
 * Tests system health monitoring and diagnostics
 *
 * As per TDD methodology, these tests will fail until implementation
 * Routes tested: GET /api/llm/health
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('GET /api/llm/health Contract Tests', () => {
  it('should return system health status with proper schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();

    // Validate core health response schema
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('uptime_ms');
    expect(data).toHaveProperty('checks');

    // Validate field types
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    expect(typeof data.version).toBe('string');
    expect(typeof data.uptime_ms).toBe('number');
    expect(data.uptime_ms).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.checks)).toBe(true);
  });

  it('should include provider health checks', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Should have health checks for all providers
    const providerChecks = data.checks.filter(
      (check: any) =>
        check.name.includes('provider') || ['cerebras', 'gemini', 'groq'].includes(check.name)
    );

    expect(providerChecks.length).toBeGreaterThan(0);

    for (const check of providerChecks) {
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('status');
      expect(check).toHaveProperty('latency_ms');
      expect(check).toHaveProperty('last_check');

      expect(typeof check.name).toBe('string');
      expect(['pass', 'warn', 'fail']).toContain(check.status);
      expect(typeof check.latency_ms).toBe('number');
      expect(check.latency_ms).toBeGreaterThanOrEqual(0);
      expect(typeof check.last_check).toBe('string');
      expect(new Date(check.last_check)).toBeInstanceOf(Date);
    }
  });

  it('should include system resource metrics', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('resources');
    expect(data.resources).toHaveProperty('memory');
    expect(data.resources).toHaveProperty('runtime');

    // Memory metrics
    expect(data.resources.memory).toHaveProperty('used_mb');
    expect(data.resources.memory).toHaveProperty('limit_mb');
    expect(data.resources.memory).toHaveProperty('percentage');

    expect(typeof data.resources.memory.used_mb).toBe('number');
    expect(typeof data.resources.memory.limit_mb).toBe('number');
    expect(typeof data.resources.memory.percentage).toBe('number');

    expect(data.resources.memory.used_mb).toBeGreaterThanOrEqual(0);
    expect(data.resources.memory.limit_mb).toBeGreaterThan(0);
    expect(data.resources.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(data.resources.memory.percentage).toBeLessThanOrEqual(100);

    // Runtime metrics
    expect(data.resources.runtime).toHaveProperty('platform');
    expect(data.resources.runtime).toHaveProperty('version');
    expect(data.resources.runtime).toHaveProperty('edge_runtime');

    expect(typeof data.resources.runtime.platform).toBe('string');
    expect(typeof data.resources.runtime.version).toBe('string');
    expect(typeof data.resources.runtime.edge_runtime).toBe('boolean');
  });

  it('should include API metrics and rate limiting status', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('metrics');
    expect(data.metrics).toHaveProperty('requests');
    expect(data.metrics).toHaveProperty('rate_limiting');

    // Request metrics
    expect(data.metrics.requests).toHaveProperty('total');
    expect(data.metrics.requests).toHaveProperty('successful');
    expect(data.metrics.requests).toHaveProperty('failed');
    expect(data.metrics.requests).toHaveProperty('avg_latency_ms');

    expect(typeof data.metrics.requests.total).toBe('number');
    expect(typeof data.metrics.requests.successful).toBe('number');
    expect(typeof data.metrics.requests.failed).toBe('number');
    expect(typeof data.metrics.requests.avg_latency_ms).toBe('number');

    expect(data.metrics.requests.total).toBeGreaterThanOrEqual(0);
    expect(data.metrics.requests.successful).toBeGreaterThanOrEqual(0);
    expect(data.metrics.requests.failed).toBeGreaterThanOrEqual(0);
    expect(data.metrics.requests.avg_latency_ms).toBeGreaterThanOrEqual(0);

    // Rate limiting status
    expect(data.metrics.rate_limiting).toHaveProperty('active');
    expect(data.metrics.rate_limiting).toHaveProperty('blocked_requests');
    expect(data.metrics.rate_limiting).toHaveProperty('window_remaining_ms');

    expect(typeof data.metrics.rate_limiting.active).toBe('boolean');
    expect(typeof data.metrics.rate_limiting.blocked_requests).toBe('number');
    expect(typeof data.metrics.rate_limiting.window_remaining_ms).toBe('number');
  });

  it('should include LangSmith integration status', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('integrations');
    expect(data.integrations).toHaveProperty('langsmith');

    const langsmith = data.integrations.langsmith;
    expect(langsmith).toHaveProperty('connected');
    expect(langsmith).toHaveProperty('last_trace');
    expect(langsmith).toHaveProperty('traces_sent');
    expect(langsmith).toHaveProperty('errors');

    expect(typeof langsmith.connected).toBe('boolean');
    expect(typeof langsmith.traces_sent).toBe('number');
    expect(typeof langsmith.errors).toBe('number');

    if (langsmith.last_trace) {
      expect(typeof langsmith.last_trace).toBe('string');
      expect(new Date(langsmith.last_trace)).toBeInstanceOf(Date);
    }

    expect(langsmith.traces_sent).toBeGreaterThanOrEqual(0);
    expect(langsmith.errors).toBeGreaterThanOrEqual(0);
  });

  it('should support detailed health check mode', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health?detailed=true`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Detailed mode should include more comprehensive checks
    expect(data.checks.length).toBeGreaterThanOrEqual(5);

    // Should include configuration validation
    const configCheck = data.checks.find((check: any) => check.name === 'configuration');
    expect(configCheck).toBeTruthy();
    expect(configCheck.status).toBe('pass');

    // Should include network connectivity checks
    const networkChecks = data.checks.filter(
      (check: any) => check.name.includes('network') || check.name.includes('connectivity')
    );
    expect(networkChecks.length).toBeGreaterThan(0);
  });

  it('should return appropriate status codes for degraded systems', async () => {
    // Simulate degraded system with test header
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
      headers: {
        'x-test-simulate-degraded': 'true',
      },
    });

    // Should still return 200 for degraded but functional system
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(['healthy', 'degraded']).toContain(data.status);
  });

  it('should include security headers and CORS support', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://hylo-travel.vercel.app',
      },
    });

    expect(response.status).toBe(200);

    // Should have appropriate security headers
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBeTruthy();

    // Should support CORS for monitoring dashboards
    expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
  });
});
