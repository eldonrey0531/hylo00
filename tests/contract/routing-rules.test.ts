import { describe, it, expect } from 'vitest';

/**
 * Contract tests for GET /api/llm/routing-rules endpoint
 * Tests complexity-based routing logic and configuration
 *
 * As per TDD methodology, these tests will fail until implementation
 * Routes tested: GET /api/llm/routing-rules
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('GET /api/llm/routing-rules Contract Tests', () => {
  it('should return routing configuration with proper schema', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();

    // Validate core routing rules schema
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('updated_at');
    expect(data).toHaveProperty('complexity_rules');
    expect(data).toHaveProperty('provider_routing');
    expect(data).toHaveProperty('fallback_chains');

    // Validate field types
    expect(typeof data.version).toBe('string');
    expect(typeof data.updated_at).toBe('string');
    expect(new Date(data.updated_at)).toBeInstanceOf(Date);
    expect(Array.isArray(data.complexity_rules)).toBe(true);
    expect(typeof data.provider_routing).toBe('object');
    expect(Array.isArray(data.fallback_chains)).toBe(true);
  });

  it('should include complexity analysis rules', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.complexity_rules.length).toBeGreaterThan(0);

    for (const rule of data.complexity_rules) {
      expect(rule).toHaveProperty('pattern');
      expect(rule).toHaveProperty('complexity');
      expect(rule).toHaveProperty('weight');
      expect(rule).toHaveProperty('description');

      expect(typeof rule.pattern).toBe('string');
      expect(['low', 'medium', 'high']).toContain(rule.complexity);
      expect(typeof rule.weight).toBe('number');
      expect(typeof rule.description).toBe('string');

      expect(rule.weight).toBeGreaterThan(0);
      expect(rule.weight).toBeLessThanOrEqual(1);
    }

    // Should have rules for different complexity levels
    const complexities = data.complexity_rules.map((rule: any) => rule.complexity);
    expect(complexities).toContain('low');
    expect(complexities).toContain('medium');
    expect(complexities).toContain('high');
  });

  it('should include provider routing configuration', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Should have routing rules for all providers
    const providers = ['cerebras', 'gemini', 'groq'];

    for (const provider of providers) {
      expect(data.provider_routing).toHaveProperty(provider);

      const config = data.provider_routing[provider];
      expect(config).toHaveProperty('preferred_complexity');
      expect(config).toHaveProperty('max_concurrent');
      expect(config).toHaveProperty('timeout_ms');
      expect(config).toHaveProperty('retry_attempts');
      expect(config).toHaveProperty('weight');

      expect(['low', 'medium', 'high']).toContain(config.preferred_complexity);
      expect(typeof config.max_concurrent).toBe('number');
      expect(typeof config.timeout_ms).toBe('number');
      expect(typeof config.retry_attempts).toBe('number');
      expect(typeof config.weight).toBe('number');

      expect(config.max_concurrent).toBeGreaterThan(0);
      expect(config.timeout_ms).toBeGreaterThan(0);
      expect(config.retry_attempts).toBeGreaterThanOrEqual(0);
      expect(config.weight).toBeGreaterThanOrEqual(0);
      expect(config.weight).toBeLessThanOrEqual(1);
    }
  });

  it('should include fallback chain definitions', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.fallback_chains.length).toBeGreaterThan(0);

    for (const chain of data.fallback_chains) {
      expect(chain).toHaveProperty('complexity');
      expect(chain).toHaveProperty('providers');
      expect(chain).toHaveProperty('conditions');

      expect(['low', 'medium', 'high']).toContain(chain.complexity);
      expect(Array.isArray(chain.providers)).toBe(true);
      expect(chain.providers.length).toBeGreaterThan(0);
      expect(Array.isArray(chain.conditions)).toBe(true);

      // Each provider in chain should be valid
      for (const provider of chain.providers) {
        expect(typeof provider).toBe('string');
        expect(['cerebras', 'gemini', 'groq']).toContain(provider);
      }

      // Each condition should have proper structure
      for (const condition of chain.conditions) {
        expect(condition).toHaveProperty('type');
        expect(condition).toHaveProperty('threshold');

        expect(['error_rate', 'latency', 'capacity']).toContain(condition.type);
        expect(typeof condition.threshold).toBe('number');
      }
    }

    // Should have fallback chains for all complexity levels
    const chainComplexities = data.fallback_chains.map((chain: any) => chain.complexity);
    expect(chainComplexities).toContain('low');
    expect(chainComplexities).toContain('medium');
    expect(chainComplexities).toContain('high');
  });

  it('should include rate limiting rules', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('rate_limiting');
    expect(data.rate_limiting).toHaveProperty('global');
    expect(data.rate_limiting).toHaveProperty('per_provider');

    // Global rate limiting
    const global = data.rate_limiting.global;
    expect(global).toHaveProperty('requests_per_minute');
    expect(global).toHaveProperty('requests_per_hour');
    expect(global).toHaveProperty('burst_limit');

    expect(typeof global.requests_per_minute).toBe('number');
    expect(typeof global.requests_per_hour).toBe('number');
    expect(typeof global.burst_limit).toBe('number');

    expect(global.requests_per_minute).toBeGreaterThan(0);
    expect(global.requests_per_hour).toBeGreaterThan(0);
    expect(global.burst_limit).toBeGreaterThan(0);

    // Per-provider rate limiting
    const providers = ['cerebras', 'gemini', 'groq'];

    for (const provider of providers) {
      expect(data.rate_limiting.per_provider).toHaveProperty(provider);

      const providerLimits = data.rate_limiting.per_provider[provider];
      expect(providerLimits).toHaveProperty('requests_per_minute');
      expect(providerLimits).toHaveProperty('tokens_per_minute');

      expect(typeof providerLimits.requests_per_minute).toBe('number');
      expect(typeof providerLimits.tokens_per_minute).toBe('number');

      expect(providerLimits.requests_per_minute).toBeGreaterThan(0);
      expect(providerLimits.tokens_per_minute).toBeGreaterThan(0);
    }
  });

  it('should include cost optimization rules', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('cost_optimization');
    expect(data.cost_optimization).toHaveProperty('enabled');
    expect(data.cost_optimization).toHaveProperty('daily_budget_usd');
    expect(data.cost_optimization).toHaveProperty('provider_costs');

    expect(typeof data.cost_optimization.enabled).toBe('boolean');
    expect(typeof data.cost_optimization.daily_budget_usd).toBe('number');
    expect(data.cost_optimization.daily_budget_usd).toBeGreaterThan(0);

    // Provider cost configuration
    const providers = ['cerebras', 'gemini', 'groq'];

    for (const provider of providers) {
      expect(data.cost_optimization.provider_costs).toHaveProperty(provider);

      const costs = data.cost_optimization.provider_costs[provider];
      expect(costs).toHaveProperty('input_token_cost');
      expect(costs).toHaveProperty('output_token_cost');
      expect(costs).toHaveProperty('request_cost');

      expect(typeof costs.input_token_cost).toBe('number');
      expect(typeof costs.output_token_cost).toBe('number');
      expect(typeof costs.request_cost).toBe('number');

      expect(costs.input_token_cost).toBeGreaterThanOrEqual(0);
      expect(costs.output_token_cost).toBeGreaterThanOrEqual(0);
      expect(costs.request_cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('should support configuration versioning', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules?version=latest`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('schema_version');
    expect(data).toHaveProperty('checksum');

    expect(typeof data.version).toBe('string');
    expect(typeof data.schema_version).toBe('string');
    expect(typeof data.checksum).toBe('string');

    // Version should follow semantic versioning
    expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should include cache control headers', async () => {
    const response = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);

    // Configuration should be cacheable but with reasonable TTL
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('max-age');

    // Should have ETag for conditional requests
    const etag = response.headers.get('etag');
    expect(etag).toBeTruthy();
  });

  it('should support conditional requests with If-None-Match', async () => {
    // First request to get ETag
    const initialResponse = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
    });

    expect(initialResponse.status).toBe(200);
    const etag = initialResponse.headers.get('etag');
    expect(etag).toBeTruthy();

    // Conditional request with ETag
    const conditionalResponse = await fetch(`${API_BASE_URL}/api/llm/routing-rules`, {
      method: 'GET',
      headers: {
        'If-None-Match': etag!,
      },
    });

    // Should return 304 if configuration hasn't changed
    expect([200, 304]).toContain(conditionalResponse.status);
  });
});
