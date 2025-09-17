# API Contract Tests

## Test Structure

Each API endpoint requires comprehensive contract testing to ensure:

1. Request/response schema validation
2. HTTP status code compliance
3. Error handling behavior
4. Rate limiting functionality
5. Authentication/authorization

## Test Files

### `/api/llm/route` Contract Tests

```javascript
// tests/contract/llm-route.test.js
const request = require('supertest');
const { app } = require('../../api/app');

describe('POST /api/llm/route', () => {
  describe('Request Validation', () => {
    it('should reject request without sessionId', async () => {
      const response = await request(app)
        .post('/api/llm/route')
        .send({
          agentId: 1,
          prompt: 'Test prompt',
          metadata: {
            requestId: 'test-id',
            timestamp: new Date().toISOString(),
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('sessionId');
    });

    it('should reject invalid agentId', async () => {
      const response = await request(app)
        .post('/api/llm/route')
        .send({
          sessionId: 'valid-uuid',
          agentId: 5, // Invalid agent ID
          prompt: 'Test prompt',
          metadata: {
            requestId: 'test-id',
            timestamp: new Date().toISOString(),
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('agentId');
    });

    it('should accept valid request and return proper response schema', async () => {
      const validRequest = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        agentId: 1,
        prompt: 'Plan a trip to Japan',
        maxTokens: 1000,
        temperature: 0.7,
        metadata: {
          requestId: '123e4567-e89b-12d3-a456-426614174000',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await request(app).post('/api/llm/route').send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('providerId');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('tokenUsage');
      expect(response.body.tokenUsage).toHaveProperty('promptTokens');
      expect(response.body.tokenUsage).toHaveProperty('completionTokens');
      expect(response.body.tokenUsage).toHaveProperty('totalTokens');
    });
  });

  describe('Provider Selection', () => {
    it('should select Groq for simple queries', async () => {
      const simpleRequest = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        agentId: 1,
        prompt: 'Hello',
        metadata: {
          requestId: '123e4567-e89b-12d3-a456-426614174000',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await request(app).post('/api/llm/route').send(simpleRequest);

      expect(response.status).toBe(200);
      expect(response.body.providerId).toBe('groq');
    });

    it('should select Cerebras for complex reasoning', async () => {
      const complexRequest = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        agentId: 3,
        prompt:
          'Create a detailed 14-day multi-city European itinerary with complex logistics, transportation optimization, accommodation recommendations considering budget constraints, dietary restrictions, and accessibility needs for a group of 8 people with varying interests in historical sites, modern art museums, culinary experiences, and outdoor activities.',
        metadata: {
          requestId: '123e4567-e89b-12d3-a456-426614174000',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await request(app).post('/api/llm/route').send(complexRequest);

      expect(response.status).toBe(200);
      expect(response.body.providerId).toBe('cerebras');
    });
  });

  describe('Error Handling', () => {
    it('should return 503 when all providers are unavailable', async () => {
      // Mock all providers as unavailable
      jest.mock('../../src/api/providers/factory', () => ({
        ProviderFactory: {
          getHealthyProvider: jest.fn().mockRejectedValue(new Error('No providers available')),
        },
      }));

      const response = await request(app)
        .post('/api/llm/route')
        .send({
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          agentId: 1,
          prompt: 'Test prompt',
          metadata: {
            requestId: '123e4567-e89b-12d3-a456-426614174000',
            timestamp: new Date().toISOString(),
          },
        });

      expect(response.status).toBe(503);
      expect(response.body.error).toContain('SERVICE_UNAVAILABLE');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(100)
        .fill()
        .map(() =>
          request(app)
            .post('/api/llm/route')
            .send({
              sessionId: '550e8400-e29b-41d4-a716-446655440000',
              agentId: 1,
              prompt: 'Test prompt',
              metadata: {
                requestId: '123e4567-e89b-12d3-a456-426614174000',
                timestamp: new Date().toISOString(),
              },
            })
        );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### `/api/health/system` Contract Tests

```javascript
// tests/contract/health-system.test.js
const request = require('supertest');
const { app } = require('../../api/app');

describe('GET /api/health/system', () => {
  it('should return system health with proper schema', async () => {
    const response = await request(app).get('/api/health/system');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('components');
    expect(response.body).toHaveProperty('metrics');

    expect(['healthy', 'degraded', 'unavailable']).toContain(response.body.status);
    expect(Array.isArray(response.body.components)).toBe(true);

    if (response.body.components.length > 0) {
      const component = response.body.components[0];
      expect(component).toHaveProperty('name');
      expect(component).toHaveProperty('status');
      expect(component).toHaveProperty('lastCheck');
    }
  });

  it('should return 503 when system is unavailable', async () => {
    // Mock unhealthy system state
    jest.mock('../../api/health/system', () => ({
      checkSystemHealth: jest.fn().mockResolvedValue({
        status: 'unavailable',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: 0,
        components: [],
        metrics: {
          requestsPerMinute: 0,
          averageLatency: 0,
          errorRate: 1,
          costPerRequest: 0,
        },
      }),
    }));

    const response = await request(app).get('/api/health/system');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('unavailable');
  });
});
```

### `/api/providers/status` Contract Tests

```javascript
// tests/contract/providers-status.test.js
const request = require('supertest');
const { app } = require('../../api/app');

describe('GET /api/providers/status', () => {
  it('should return provider configurations with proper schema', async () => {
    const response = await request(app).get('/api/providers/status');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const provider = response.body[0];
    expect(provider).toHaveProperty('id');
    expect(provider).toHaveProperty('name');
    expect(provider).toHaveProperty('models');
    expect(provider).toHaveProperty('limits');
    expect(provider).toHaveProperty('pricing');
    expect(provider).toHaveProperty('capabilities');

    expect(['groq', 'gemini', 'cerebras']).toContain(provider.id);
  });
});
```

## Integration Test Scenarios

### Multi-Agent Workflow Tests

```javascript
// tests/integration/multi-agent-workflow.test.js
describe('Multi-Agent Travel Planning Workflow', () => {
  it('should complete full 4-agent workflow', async () => {
    const travelFormData = {
      destination: 'Tokyo, Japan',
      startDate: '2025-10-01',
      endDate: '2025-10-07',
      groupSize: 2,
      travelVibe: 'cultural',
      interests: ['temples', 'food', 'museums'],
      accommodationType: 'hotel',
      budgetRange: 'mid-range',
    };

    // Agent 1: Data Gatherer
    const agent1Response = await request(app)
      .post('/api/llm/route')
      .send({
        sessionId: 'test-session-id',
        agentId: 1,
        prompt: `Extract and validate travel data: ${JSON.stringify(travelFormData)}`,
        metadata: {
          requestId: 'agent1-request',
          timestamp: new Date().toISOString(),
        },
      });

    expect(agent1Response.status).toBe(200);
    expect(agent1Response.body.content).toContain('Tokyo');

    // Agent 2: Information Gatherer
    const agent2Response = await request(app)
      .post('/api/llm/route')
      .send({
        sessionId: 'test-session-id',
        agentId: 2,
        prompt: 'Research current information about Tokyo travel, cultural sites, and dining',
        metadata: {
          requestId: 'agent2-request',
          timestamp: new Date().toISOString(),
        },
      });

    expect(agent2Response.status).toBe(200);

    // Agent 3: Planning Strategist
    const agent3Response = await request(app)
      .post('/api/llm/route')
      .send({
        sessionId: 'test-session-id',
        agentId: 3,
        prompt: 'Create itinerary framework based on research and user preferences',
        metadata: {
          requestId: 'agent3-request',
          timestamp: new Date().toISOString(),
        },
      });

    expect(agent3Response.status).toBe(200);

    // Agent 4: Content Compiler
    const agent4Response = await request(app)
      .post('/api/llm/route')
      .send({
        sessionId: 'test-session-id',
        agentId: 4,
        prompt: 'Compile final personalized itinerary',
        metadata: {
          requestId: 'agent4-request',
          timestamp: new Date().toISOString(),
        },
      });

    expect(agent4Response.status).toBe(200);
    expect(agent4Response.body.content).toContain('Day 1');
  });
});
```

### Provider Fallback Tests

```javascript
// tests/integration/provider-fallback.test.js
describe('Provider Fallback Scenarios', () => {
  it('should fallback to secondary provider when primary fails', async () => {
    // Mock primary provider failure
    jest.mock('../../src/api/providers/groq', () => ({
      GroqProvider: {
        processRequest: jest.fn().mockRejectedValue(new Error('Provider unavailable')),
      },
    }));

    const response = await request(app)
      .post('/api/llm/route')
      .send({
        sessionId: 'fallback-test',
        agentId: 1,
        prompt: 'Simple test prompt',
        metadata: {
          requestId: 'fallback-request',
          timestamp: new Date().toISOString(),
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.providerId).not.toBe('groq');
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'api/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup

```javascript
// tests/setup.js
const { TextEncoder, TextDecoder } = require('util');

// Polyfills for edge runtime compatibility
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.CEREBRAS_API_KEY = 'test-cerebras-key';
process.env.LANGSMITH_API_KEY = 'test-langsmith-key';

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
```

## Test Execution

```bash
# Run all contract tests
npm run test:contract

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/contract/llm-route.test.js
```

**Expected Results**: All contract tests must pass before implementation, following TDD principles. These tests define the exact API behavior and will guide implementation development.
