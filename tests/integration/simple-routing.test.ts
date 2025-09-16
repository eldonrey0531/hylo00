import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Integration test for S1: Simple routing scenario with basic query processing
 * Tests end-to-end flow from query to response with single provider
 *
 * This test validates the simplest successful path through the LLM routing infrastructure:
 * 1. User submits basic travel query
 * 2. System analyzes complexity (should be 'low')
 * 3. Routes to fastest provider (Groq)
 * 4. Returns formatted response
 *
 * As per TDD methodology, this test will fail until implementation
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('S1: Simple Routing Integration Test', () => {
  let testSessionId: string;

  beforeEach(() => {
    // Generate unique session ID for test isolation
    testSessionId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  });

  afterEach(() => {
    // Cleanup test data if needed
    // In real implementation, this might clean up rate limiting state, etc.
  });

  it('should handle basic travel query with simple routing', async () => {
    const basicQuery = {
      query: 'Plan a 3-day weekend trip to Paris with basic sightseeing',
      options: {
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
      },
      metadata: {
        session_id: testSessionId,
        complexity_hint: 'low',
        user_preference: 'speed',
      },
    };

    // Submit query to routing endpoint
    const response = await fetch(`${API_BASE_URL}/api/llm/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(basicQuery),
    });

    // Verify successful response
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const result = await response.json();

    // Verify response structure
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('provider_used');
    expect(result.metadata).toHaveProperty('complexity_detected');
    expect(result.metadata).toHaveProperty('routing_decision');
    expect(result.metadata).toHaveProperty('latency_ms');

    // Verify routing decision for simple query
    expect(result.metadata.complexity_detected).toBe('low');
    expect(result.metadata.provider_used).toBe('groq'); // Should route to fastest provider
    expect(typeof result.metadata.latency_ms).toBe('number');
    expect(result.metadata.latency_ms).toBeGreaterThan(0);

    // Verify response content
    expect(typeof result.response).toBe('string');
    expect(result.response.length).toBeGreaterThan(50); // Should have meaningful content
    expect(result.response.toLowerCase()).toContain('paris'); // Should mention Paris
  });

  it('should provide routing transparency and observability', async () => {
    const query = {
      query: 'What are the top 5 attractions in Tokyo?',
      options: { debug: true }, // Request debug information
      metadata: { session_id: testSessionId },
    };

    const response = await fetch(`${API_BASE_URL}/api/llm/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    // Verify debug information is included
    expect(result.metadata).toHaveProperty('debug');
    expect(result.metadata.debug).toHaveProperty('complexity_analysis');
    expect(result.metadata.debug).toHaveProperty('provider_selection');
    expect(result.metadata.debug).toHaveProperty('fallback_chain');

    // Verify complexity analysis details
    const complexityAnalysis = result.metadata.debug.complexity_analysis;
    expect(complexityAnalysis).toHaveProperty('detected_patterns');
    expect(complexityAnalysis).toHaveProperty('score');
    expect(complexityAnalysis).toHaveProperty('reasoning');

    expect(Array.isArray(complexityAnalysis.detected_patterns)).toBe(true);
    expect(typeof complexityAnalysis.score).toBe('number');
    expect(complexityAnalysis.score).toBeGreaterThanOrEqual(0);
    expect(complexityAnalysis.score).toBeLessThanOrEqual(1);

    // Verify provider selection reasoning
    const providerSelection = result.metadata.debug.provider_selection;
    expect(providerSelection).toHaveProperty('candidates');
    expect(providerSelection).toHaveProperty('selected');
    expect(providerSelection).toHaveProperty('reasoning');

    expect(Array.isArray(providerSelection.candidates)).toBe(true);
    expect(providerSelection.candidates.length).toBeGreaterThan(0);
    expect(typeof providerSelection.selected).toBe('string');
    expect(['cerebras', 'gemini', 'groq']).toContain(providerSelection.selected);
  });

  it('should track costs and usage metrics', async () => {
    const query = {
      query: 'Recommend a restaurant in Rome',
      metadata: {
        session_id: testSessionId,
        track_costs: true,
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/llm/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    // Verify cost tracking information
    expect(result.metadata).toHaveProperty('usage');
    expect(result.metadata.usage).toHaveProperty('input_tokens');
    expect(result.metadata.usage).toHaveProperty('output_tokens');
    expect(result.metadata.usage).toHaveProperty('total_tokens');
    expect(result.metadata.usage).toHaveProperty('estimated_cost_usd');

    expect(typeof result.metadata.usage.input_tokens).toBe('number');
    expect(typeof result.metadata.usage.output_tokens).toBe('number');
    expect(typeof result.metadata.usage.total_tokens).toBe('number');
    expect(typeof result.metadata.usage.estimated_cost_usd).toBe('number');

    expect(result.metadata.usage.input_tokens).toBeGreaterThan(0);
    expect(result.metadata.usage.output_tokens).toBeGreaterThan(0);
    expect(result.metadata.usage.total_tokens).toBeGreaterThan(0);
    expect(result.metadata.usage.estimated_cost_usd).toBeGreaterThan(0);

    // Total tokens should equal input + output
    expect(result.metadata.usage.total_tokens).toBe(
      result.metadata.usage.input_tokens + result.metadata.usage.output_tokens
    );
  });

  it('should handle provider availability gracefully', async () => {
    // Test with header that simulates partial provider unavailability
    const query = {
      query: 'Best time to visit Bali?',
      metadata: { session_id: testSessionId },
    };

    const response = await fetch(`${API_BASE_URL}/api/llm/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-simulate-failure': 'groq', // Simulate Groq being unavailable
      },
      body: JSON.stringify(query),
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    // Should fallback to available provider
    expect(result.metadata.provider_used).not.toBe('groq');
    expect(['cerebras', 'gemini']).toContain(result.metadata.provider_used);

    // Should indicate fallback occurred
    expect(result.metadata).toHaveProperty('fallback_occurred');
    expect(result.metadata.fallback_occurred).toBe(true);
    expect(result.metadata).toHaveProperty('original_provider_failed');
    expect(result.metadata.original_provider_failed).toBe('groq');

    // Response should still be valid
    expect(typeof result.response).toBe('string');
    expect(result.response.length).toBeGreaterThan(20);
  });

  it('should enforce rate limiting appropriately', async () => {
    const queries = Array.from({ length: 5 }, (_, i) => ({
      query: `Test query ${i + 1} for rate limiting`,
      metadata: { session_id: testSessionId },
    }));

    // Send multiple requests rapidly
    const responses = await Promise.all(
      queries.map((query) =>
        fetch(`${API_BASE_URL}/api/llm/route`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
        })
      )
    );

    // First few requests should succeed
    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(200);

    // Check if any requests were rate limited
    const rateLimitedResponses = responses.filter((r) => r.status === 429);
    const successfulResponses = responses.filter((r) => r.status === 200);

    // Should have appropriate rate limiting headers
    for (const response of responses) {
      expect(response.headers.has('x-ratelimit-limit')).toBe(true);
      expect(response.headers.has('x-ratelimit-remaining')).toBe(true);
      expect(response.headers.has('x-ratelimit-reset')).toBe(true);
    }

    // Should allow reasonable number of requests
    expect(successfulResponses.length).toBeGreaterThanOrEqual(2);

    // If rate limited, should provide proper error response
    if (rateLimitedResponses.length > 0) {
      const rateLimitedResult = await rateLimitedResponses[0].json();
      expect(rateLimitedResult).toHaveProperty('error');
      expect(rateLimitedResult.error).toHaveProperty('code');
      expect(rateLimitedResult.error.code).toBe('RATE_LIMIT_EXCEEDED');
    }
  });

  it('should validate input and provide clear error messages', async () => {
    const invalidQueries = [
      // Missing query
      { metadata: { session_id: testSessionId } },

      // Empty query
      { query: '', metadata: { session_id: testSessionId } },

      // Query too long
      {
        query: 'x'.repeat(10000),
        metadata: { session_id: testSessionId },
      },

      // Invalid options
      {
        query: 'Valid query',
        options: { max_tokens: -1 },
        metadata: { session_id: testSessionId },
      },
    ];

    for (const invalidQuery of invalidQueries) {
      const response = await fetch(`${API_BASE_URL}/api/llm/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidQuery),
      });

      expect(response.status).toBe(400);

      const errorResult = await response.json();
      expect(errorResult).toHaveProperty('error');
      expect(errorResult.error).toHaveProperty('code');
      expect(errorResult.error).toHaveProperty('message');
      expect(typeof errorResult.error.message).toBe('string');
      expect(errorResult.error.message.length).toBeGreaterThan(0);
    }
  });
});
