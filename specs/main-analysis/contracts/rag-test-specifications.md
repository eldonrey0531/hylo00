# RAG Multi-Agent System Test Specifications

**Date**: September 17, 2025  
**Context**: Session-aware RAG travel planning system  
**Status**: Phase 1 Contract Design

## Test Framework Overview

This document defines comprehensive test specifications for the RAG multi-agent system, covering contract tests, integration tests, unit tests, and end-to-end validation scenarios. All tests must maintain constitutional compliance and validate the complete RAG pipeline.

## Contract Tests

### API Endpoint Contract Tests

#### save-form Endpoint Tests

```typescript
describe('POST /api/rag/save-form', () => {
  describe('Request Validation', () => {
    it('should validate required fields', async () => {
      const invalidRequest = {
        // Missing session_id, form_id, form_data
      };

      const response = await request(app).post('/api/rag/save-form').send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('bad_request');
      expect(response.body.message).toContain('session_id is required');
    });

    it('should validate session_id format', async () => {
      const invalidRequest = {
        session_id: 'invalid-uuid',
        form_id: 'TripDetailsForm',
        form_data: { destination: 'Tokyo' },
      };

      const response = await request(app).post('/api/rag/save-form').send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid UUID format');
    });

    it('should validate form_id enum values', async () => {
      const invalidRequest = {
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        form_id: 'InvalidFormName',
        form_data: { destination: 'Tokyo' },
      };

      const response = await request(app).post('/api/rag/save-form').send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid form_id');
    });
  });

  describe('Successful Operations', () => {
    it('should save form data successfully', async () => {
      const validRequest = {
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        form_id: 'TripDetailsForm',
        form_data: {
          destination: 'Tokyo',
          startDate: '2025-10-01T00:00:00.000Z',
          endDate: '2025-10-07T00:00:00.000Z',
          groupSize: 2,
        },
      };

      const response = await request(app).post('/api/rag/save-form').send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body).toMatchSchema(SaveFormResponseSchema);
      expect(response.body.success).toBe(true);
      expect(response.body.session_id).toBe(validRequest.session_id);
      expect(response.body.vectorization_status).toBeOneOf(['queued', 'processing', 'completed']);
    });

    it('should trigger vectorization by default', async () => {
      const validRequest = {
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        form_id: 'TravelInterests',
        form_data: {
          interests: [
            { category: 'food', intensity: 'high' },
            { category: 'culture', intensity: 'medium' },
          ],
        },
      };

      const response = await request(app).post('/api/rag/save-form').send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body.vectorization_status).not.toBe('pending');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(11)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/rag/save-form')
            .send({
              session_id: '123e4567-e89b-12d3-a456-426614174000',
              form_id: 'TripDetailsForm',
              form_data: { destination: 'Tokyo' },
            })
        );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses[0].body.error).toBe('rate_limited');
      expect(rateLimitedResponses[0].body.retry_after).toBeGreaterThan(0);
    });
  });
});
```

#### generate-itinerary Endpoint Tests

```typescript
describe('POST /api/rag/generate-itinerary', () => {
  beforeEach(async () => {
    // Set up test session with form data
    await setupTestSession('test-session-id', {
      destination: 'Kyoto',
      startDate: '2025-10-05',
      endDate: '2025-10-08',
      interests: ['food', 'culture', 'temples'],
    });
  });

  describe('Request Validation', () => {
    it('should validate RAG request schema', async () => {
      const invalidRequest = {
        session_id: 'invalid-uuid',
        operation: 'invalid-operation',
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('bad_request');
    });

    it('should require session to exist', async () => {
      const validRequest = {
        session_id: '99999999-9999-9999-9999-999999999999',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(validRequest);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('session_not_found');
    });
  });

  describe('Successful Generation', () => {
    it('should generate structured itinerary', async () => {
      const validRequest = {
        session_id: 'test-session-id',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
        options: {
          include_web_search: true,
          include_citations: true,
        },
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body).toMatchSchema(ItineraryResponseSchema);
      expect(response.body.data.type).toBe('itinerary');
      expect(response.body.data.itinerary).toBeArray();
      expect(response.body.data.itinerary.length).toBeGreaterThan(0);
      expect(response.body.citations).toBeArray();
      expect(response.body.tokens_used).toBeDefined();
      expect(response.body.processing_time_ms).toBeGreaterThan(0);
    });

    it('should include proper citations', async () => {
      const validRequest = {
        session_id: 'test-session-id',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
        options: { include_citations: true },
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body.citations).toBeArray();

      const webCitations = response.body.citations.filter((c) => c.source_type === 'web_search');
      expect(webCitations.length).toBeGreaterThan(0);

      webCitations.forEach((citation) => {
        expect(citation).toHaveProperty('url');
        expect(citation).toHaveProperty('title');
        expect(citation).toHaveProperty('snippet');
        expect(citation).toHaveProperty('accessed_at');
      });
    });
  });

  describe('Provider Routing', () => {
    it('should route complex requests to Cerebras', async () => {
      const complexRequest = {
        session_id: 'test-session-id',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
        options: {
          complexity_override: 'complex',
          max_tokens: 4000,
        },
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(complexRequest);

      expect(response.status).toBe(200);
      expect(response.body.tokens_used.provider).toBe('cerebras');
    });

    it('should route simple requests to Groq', async () => {
      const simpleRequest = {
        session_id: 'test-session-id',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
        options: {
          complexity_override: 'simple',
          max_tokens: 1000,
        },
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(simpleRequest);

      expect(response.status).toBe(200);
      expect(response.body.tokens_used.provider).toBe('groq');
    });
  });

  describe('Budget Management', () => {
    it('should reject requests when budget exceeded', async () => {
      // Simulate budget exhaustion
      await exhaustSessionBudget('test-session-id');

      const validRequest = {
        session_id: 'test-session-id',
        operation: 'generate_itinerary',
        request_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const response = await request(app).post('/api/rag/generate-itinerary').send(validRequest);

      expect(response.status).toBe(402);
      expect(response.body.error).toBe('budget_exceeded');
      expect(response.body.current_usage).toBeDefined();
      expect(response.body.limit).toBeDefined();
    });
  });
});
```

## Integration Tests

### Multi-Agent RAG Pipeline Tests

```typescript
describe('Multi-Agent RAG Pipeline', () => {
  describe('End-to-End Itinerary Generation', () => {
    it('should complete 4-agent processing pipeline', async () => {
      const sessionId = await createTestSession();

      // Agent 1: Data Gatherer - Form validation and extraction
      await submitFormData(sessionId, 'TripDetailsForm', {
        destination: 'Barcelona',
        startDate: '2025-10-15',
        endDate: '2025-10-18',
        groupSize: 2,
      });

      await submitFormData(sessionId, 'TravelInterests', {
        interests: [
          { category: 'culture', intensity: 'high' },
          { category: 'food', intensity: 'medium' },
        ],
      });

      // Wait for vectorization
      await waitForVectorization(sessionId);

      // Agent 2: Information Gatherer - Web search integration
      const webData = await webSearchService.gatherTravelInfo({
        destination: 'Barcelona',
        interests: ['culture', 'food'],
        dates: { start: '2025-10-15', end: '2025-10-18' },
      });

      expect(webData.results).toBeArray();
      expect(webData.results.length).toBeGreaterThan(0);

      // Agent 3: Planning Strategist - Data-driven framework
      const itineraryRequest = {
        session_id: sessionId,
        operation: 'generate_itinerary',
        request_id: uuid(),
        options: {
          include_web_search: true,
          include_citations: true,
        },
      };

      const itineraryResponse = await request(app)
        .post('/api/rag/generate-itinerary')
        .send(itineraryRequest);

      expect(itineraryResponse.status).toBe(200);
      expect(itineraryResponse.body.data.itinerary.length).toBe(4); // 4 days

      // Agent 4: Content Compiler - Final assembly
      const compiledItinerary = itineraryResponse.body.data;
      expect(compiledItinerary.summary).toBeDefined();
      expect(compiledItinerary.actions).toBeArray();
      expect(itineraryResponse.body.citations).toBeArray();

      // Verify constitutional compliance
      expect(itineraryResponse.body.tokens_used.provider).toBeOneOf(['groq', 'gemini', 'cerebras']);
      expect(itineraryResponse.body.processing_time_ms).toBeLessThan(30000); // Under 30s
    });

    it('should handle partial form data gracefully', async () => {
      const sessionId = await createTestSession();

      // Submit only basic trip details
      await submitFormData(sessionId, 'TripDetailsForm', {
        destination: 'Rome',
        startDate: '2025-11-01',
        endDate: '2025-11-04',
        groupSize: 1,
      });

      const itineraryRequest = {
        session_id: sessionId,
        operation: 'generate_itinerary',
        request_id: uuid(),
      };

      const response = await request(app)
        .post('/api/rag/generate-itinerary')
        .send(itineraryRequest);

      expect(response.status).toBe(200);
      expect(response.body.data.itinerary).toBeDefined();
      expect(response.body.data.summary).toContain('general recommendations');
    });
  });

  describe('Session Lifecycle Integration', () => {
    it('should maintain session state across operations', async () => {
      const sessionId = await createTestSession();

      // Submit multiple forms
      await submitFormData(sessionId, 'TripDetailsForm', { destination: 'Tokyo' });
      await submitFormData(sessionId, 'TravelInterests', {
        interests: [{ category: 'food', intensity: 'high' }],
      });
      await submitFormData(sessionId, 'TripVibe', { vibe: 'cultural' });

      // Check session status
      const statusResponse = await request(app)
        .get('/api/rag/session-status')
        .query({ session_id: sessionId });

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.form_count).toBe(3);
      expect(statusResponse.body.vectorization_status).toBe('completed');

      // Generate itinerary
      const itineraryResponse = await request(app).post('/api/rag/generate-itinerary').send({
        session_id: sessionId,
        operation: 'generate_itinerary',
        request_id: uuid(),
      });

      expect(itineraryResponse.status).toBe(200);

      // Ask follow-up question
      const questionResponse = await request(app).post('/api/rag/ask-question').send({
        session_id: sessionId,
        question: 'What about vegetarian restaurants?',
        request_id: uuid(),
      });

      expect(questionResponse.status).toBe(200);
      expect(questionResponse.body.data.answer).toContain('vegetarian');
      expect(questionResponse.body.data.context_used).toContain('TravelInterests');
    });

    it('should handle session expiration', async () => {
      const expiredSessionId = await createExpiredSession();

      const itineraryRequest = {
        session_id: expiredSessionId,
        operation: 'generate_itinerary',
        request_id: uuid(),
      };

      const response = await request(app)
        .post('/api/rag/generate-itinerary')
        .send(itineraryRequest);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('session_not_found');
    });
  });
});
```

## Performance Tests

### Load Testing

```typescript
describe('Performance Tests', () => {
  describe('Concurrent Sessions', () => {
    it('should handle 100 concurrent form submissions', async () => {
      const sessionIds = await Promise.all(
        Array(100)
          .fill(null)
          .map(() => sessionService.createSession())
      );

      const startTime = Date.now();

      const submissions = sessionIds.map((sessionId) =>
        request(app)
          .post('/api/rag/save-form')
          .send({
            session_id: sessionId,
            form_id: 'TripDetailsForm',
            form_data: { destination: 'Tokyo', groupSize: 2 },
          })
      );

      const responses = await Promise.all(submissions);
      const endTime = Date.now();

      expect(responses.every((r) => r.status === 200)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
    });
  });

  describe('Vector Search Performance', () => {
    it('should return search results under 500ms', async () => {
      await seedVectorDatabase(1000); // 1000 test vectors

      const startTime = Date.now();

      const results = await vectorService.searchVectors(
        'test-session-id',
        'cultural experiences temples food',
        10
      );

      const endTime = Date.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Itinerary Generation Performance', () => {
    it('should generate itinerary under 30 seconds', async () => {
      const sessionId = await createCompleteTestSession();

      const startTime = Date.now();

      const response = await request(app).post('/api/rag/generate-itinerary').send({
        session_id: sessionId,
        operation: 'generate_itinerary',
        request_id: uuid(),
      });

      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(30000);
      expect(response.body.processing_time_ms).toBeLessThan(30000);
    });
  });
});
```

## Test Data and Utilities

### Test Data Factory

```typescript
export class TestDataFactory {
  static createSessionData(overrides = {}) {
    return {
      destination: 'Tokyo',
      startDate: '2025-10-01T00:00:00.000Z',
      endDate: '2025-10-07T00:00:00.000Z',
      groupSize: 2,
      travelVibe: 'cultural',
      interests: [
        { category: 'food', intensity: 'high' },
        { category: 'culture', intensity: 'medium' },
      ],
      budgetRange: {
        currency: 'USD',
        total: 2000,
        flexibility: 'flexible',
      },
      ...overrides,
    };
  }

  static createVectorMetadata(overrides = {}) {
    return {
      session_id: 'test-session-id',
      form_id: 'TripDetailsForm',
      summary_text: 'Cultural trip to Tokyo for 2 people, interested in food and temples',
      destination: 'Tokyo',
      trip_type: 'leisure',
      group_size: 2,
      budget_range: 'mid-range',
      created_at: new Date().toISOString(),
      ttl_hours: 24,
      content_type: 'destination',
      ...overrides,
    };
  }
}
```

### Test Utilities

```typescript
export class TestUtils {
  static async setupTestSession(sessionId: string, formData: any) {
    await sessionService.createSession(sessionId);
    await sessionService.updateSessionData(sessionId, 'TripDetailsForm', formData);
    await vectorService.upsertSessionVector(sessionId, 'TripDetailsForm', formData);
  }

  static async waitForVectorization(sessionId: string, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const session = await sessionService.getSession(sessionId);
      if (session.flags.vectorized) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('Vectorization timeout');
  }

  static async cleanupTestData() {
    // Clean up test sessions, vectors, and cache entries
    await sessionService.deleteTestSessions();
    await vectorService.deleteTestVectors();
    await cacheService.flushTestCache();
  }
}
```

## Test Execution Strategy

### Test Suites Organization

1. **Unit Tests**: Individual service and utility functions
2. **Contract Tests**: API endpoint validation and schema compliance
3. **Integration Tests**: Multi-component workflows and data flow
4. **Performance Tests**: Load testing and latency validation
5. **End-to-End Tests**: Complete user journey validation

### Continuous Integration

```yaml
# .github/workflows/test-rag-system.yml
name: RAG System Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'api/rag/**'
      - 'src/services/rag/**'
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit:rag
        env:
          NODE_ENV: test

  contract-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: hylo_test
      redis:
        image: redis:7

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Run contract tests
        run: npm run test:contract:rag
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/hylo_test
          REDIS_URL: redis://localhost:6379

  integration-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, contract-tests]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Setup test environment
        run: |
          docker-compose -f docker-compose.test.yml up -d
          npm run test:setup:rag

      - name: Run integration tests
        run: npm run test:integration:rag
        env:
          QDRANT_URL: http://localhost:6333
          SUPABASE_URL: http://localhost:54321
```

### Test Coverage Requirements

- **Unit Tests**: 90%+ line coverage for all RAG services
- **Contract Tests**: 100% API endpoint coverage
- **Integration Tests**: Complete user journey coverage
- **Performance Tests**: All critical path latency validation

### Constitutional Compliance Testing

All tests must verify constitutional compliance:

1. **Edge Runtime Compatibility**: No Node.js APIs used
2. **Multi-Provider Resilience**: Failover scenarios tested
3. **Observable Operations**: LangSmith tracing verified
4. **Type Safety**: Zod validation in all contracts
5. **Cost Consciousness**: Budget limits enforced

This comprehensive test suite ensures the RAG multi-agent system maintains reliability, performance, and constitutional compliance while providing robust travel planning capabilities.
