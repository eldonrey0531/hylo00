/**
 * RAG Service Test Suite
 * T066-T072: Comprehensive testing for RAG multi-agent system
 * Constitutional compliance: Edge-compatible test infrastructure
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RAGService, createRAGService } from '../services/ragService.js';
import { FormSubmissionRequest, ItineraryRequest, QuestionRequest } from '../types/rag.js';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

// Mock environment for testing
const mockEnv = {
  RAG_MAX_CONTEXT_LENGTH: '8000',
  RAG_SUMMARY_MAX_LENGTH: '1000',
  RAG_WEB_SEARCH_ENABLED: 'true',
  RAG_CITATION_REQUIRED: 'true',
  RAG_DEFAULT_PROVIDER: 'groq',
  RAG_RETRY_ATTEMPTS: '3',
  RAG_TIMEOUT_MS: '30000',
  LLM_BASE_URL: '/api/llm',
  NODE_ENV: 'test',
  VECTOR_SERVICE_URL: 'http://localhost:3001',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'test-key',
  REDIS_URL: 'redis://localhost:6379',
  SERP_API_KEY: 'test-serp-key',
};

describe('RAG Service Integration Tests', () => {
  let ragService: RAGService;
  const testSessionId = 'test-session-123';
  const testRequestId = 'test-request-456';

  beforeEach(() => {
    // Set mock environment
    Object.assign(process.env, mockEnv);

    // Create RAG service instance
    ragService = createRAGService();
  });

  afterEach(() => {
    // Clean up
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  // =============================================================================
  // T066: Form Submission Tests
  // =============================================================================

  describe('Form Submission Processing (T066)', () => {
    it('should process valid form submission successfully', async () => {
      const request: FormSubmissionRequest = {
        session_id: testSessionId,
        form_id: 'TripDetailsForm',
        form_data: {
          destination: 'Tokyo, Japan',
          startDate: '2025-10-01T00:00:00Z',
          endDate: '2025-10-07T00:00:00Z',
          groupSize: 2,
          travelVibe: 'cultural',
        },
        trigger_vectorization: true,
      };

      const response = await ragService.processFormSubmission(request);

      expect(response.success).toBe(true);
      expect(response.session_id).toBe(testSessionId);
      expect(response.vectorization_status).toMatch(/completed|pending|queued/);
      expect(response.message).toContain('processed successfully');
    });

    it('should handle form submission validation errors', async () => {
      const invalidRequest = {
        session_id: '',
        form_id: '',
        form_data: null,
        trigger_vectorization: false,
      } as any;

      const response = await ragService.processFormSubmission(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.message).toContain('error');
    });

    it('should handle vectorization failures gracefully', async () => {
      const request: FormSubmissionRequest = {
        session_id: 'invalid-session',
        form_id: 'TestForm',
        form_data: { test: 'data' },
        trigger_vectorization: true,
      };

      const response = await ragService.processFormSubmission(request);

      // Should still succeed even if vectorization fails
      expect(response.session_id).toBe('invalid-session');
      expect(typeof response.vectorization_status).toBe('string');
    });
  });

  // =============================================================================
  // T067: Session Summary Tests
  // =============================================================================

  describe('Session Summary Generation (T067)', () => {
    it('should generate session summary from form data', async () => {
      // First submit some form data
      await ragService.processFormSubmission({
        session_id: testSessionId,
        form_id: 'TripDetailsForm',
        form_data: {
          destination: 'Paris, France',
          startDate: '2025-09-15T00:00:00Z',
          endDate: '2025-09-22T00:00:00Z',
          groupSize: 4,
          travelVibe: 'luxury',
        },
        trigger_vectorization: false,
      });

      const summary = await ragService.generateSessionSummary(testSessionId);

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(10);
      expect(summary.toLowerCase()).toContain('paris');
    });

    it('should handle empty session gracefully', async () => {
      const summary = await ragService.generateSessionSummary('non-existent-session');

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should respect summary length limits', async () => {
      const summary = await ragService.generateSessionSummary(testSessionId);

      // Should not exceed configured maximum length
      expect(summary.length).toBeLessThanOrEqual(1000);
    });
  });

  // =============================================================================
  // T068: Context Retrieval Tests
  // =============================================================================

  describe('Context Retrieval (T068)', () => {
    it('should retrieve contextual data from vectors', async () => {
      const contextResult = await ragService.retrieveContextualData(
        testSessionId,
        'travel recommendations for Tokyo',
        {
          includeWebSearch: false,
          maxResults: 5,
          similarityThreshold: 0.7,
        }
      );

      expect(contextResult.vectorResults).toBeDefined();
      expect(Array.isArray(contextResult.vectorResults)).toBe(true);
      expect(contextResult.totalSources).toBeGreaterThanOrEqual(0);
      expect(contextResult.confidence).toBeGreaterThanOrEqual(0);
      expect(contextResult.confidence).toBeLessThanOrEqual(1);
    });

    it('should include web search results when enabled', async () => {
      const contextResult = await ragService.retrieveContextualData(
        testSessionId,
        'best restaurants in Tokyo',
        {
          includeWebSearch: true,
          maxResults: 10,
        }
      );

      expect(contextResult.vectorResults).toBeDefined();
      // Web results may or may not be available depending on service configuration
      expect(contextResult.totalSources).toBeGreaterThanOrEqual(0);
    });

    it('should handle web search failures gracefully', async () => {
      // Test with invalid session to potentially trigger web search errors
      const contextResult = await ragService.retrieveContextualData(
        'invalid-session',
        'travel query',
        {
          includeWebSearch: true,
        }
      );

      // Should not throw, should return valid result structure
      expect(contextResult).toBeDefined();
      expect(typeof contextResult.confidence).toBe('number');
    });
  });

  // =============================================================================
  // T069: Itinerary Generation Tests
  // =============================================================================

  describe('Itinerary Generation (T069)', () => {
    it('should generate comprehensive itinerary', async () => {
      const request: ItineraryRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        operation: 'generate_itinerary',
        options: {
          include_web_search: true,
          max_results: 10,
          max_tokens: 4000,
          similarity_threshold: 0.7,
        },
      };

      const response = await ragService.generateItinerary(request);

      expect(response.request_id).toBe(testRequestId);
      expect(response.session_id).toBe(testSessionId);
      expect(response.data.type).toBe('itinerary');
      expect(Array.isArray(response.data.itinerary)).toBe(true);
      expect(typeof response.data.summary).toBe('string');
      expect(Array.isArray(response.citations)).toBe(true);
      expect(response.confidence_score).toBeGreaterThanOrEqual(0);
      expect(response.confidence_score).toBeLessThanOrEqual(1);
      expect(response.processing_time_ms).toBeGreaterThan(0);
      expect(Array.isArray(response.data.actions)).toBe(true);
    });

    it('should include token usage and cost information', async () => {
      const request: ItineraryRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        operation: 'generate_itinerary',
        options: {},
      };

      const response = await ragService.generateItinerary(request);

      expect(response.tokens_used).toBeDefined();
      expect(typeof response.tokens_used.total_tokens).toBe('number');
      expect(typeof response.tokens_used.cost_usd).toBe('number');
      expect(response.tokens_used.operation).toBe('generation');
      expect(['groq', 'gemini', 'cerebras'].includes(response.tokens_used.provider)).toBe(true);
    });

    it('should handle empty session data gracefully', async () => {
      const request: ItineraryRequest = {
        session_id: 'empty-session',
        request_id: 'empty-request',
        operation: 'generate_itinerary',
        options: {},
      };

      const response = await ragService.generateItinerary(request);

      // Should not throw, should return valid response structure
      expect(response.data.type).toBe('itinerary');
      expect(Array.isArray(response.data.itinerary)).toBe(true);
    });
  });

  // =============================================================================
  // T070: Question Answering Tests
  // =============================================================================

  describe('Question Answering (T070)', () => {
    it('should answer travel-related questions', async () => {
      const request: QuestionRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        question: 'What are the best times to visit Japan?',
        options: {
          include_web_search: false,
          max_results: 5,
          similarity_threshold: 0.6,
        },
      };

      const response = await ragService.handleFollowUpQuestion(request);

      expect(response.request_id).toBe(testRequestId);
      expect(response.session_id).toBe(testSessionId);
      expect(response.data.type).toBe('question_answer');
      expect(typeof response.data.answer).toBe('string');
      expect(response.data.answer.length).toBeGreaterThan(10);
      expect(Array.isArray(response.data.context_used)).toBe(true);
      expect(Array.isArray(response.data.related_suggestions)).toBe(true);
      expect(Array.isArray(response.citations)).toBe(true);
    });

    it('should provide related suggestions', async () => {
      const request: QuestionRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        question: 'Where should I stay in Tokyo?',
        options: {},
      };

      const response = await ragService.handleFollowUpQuestion(request);

      expect(response.data.related_suggestions.length).toBeGreaterThan(0);
      expect(response.data.related_suggestions.length).toBeLessThanOrEqual(5);
      response.data.related_suggestions.forEach((suggestion) => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.length).toBeGreaterThan(5);
      });
    });

    it('should handle complex questions with web search', async () => {
      const request: QuestionRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        question:
          'What is the current weather in Tokyo and what activities are best for this season?',
        options: {
          include_web_search: true,
          max_results: 8,
        },
      };

      const response = await ragService.handleFollowUpQuestion(request);

      // Should handle web search integration
      expect(response.data.answer).toBeDefined();
      expect(response.processing_time_ms).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // T071: Error Handling and Resilience Tests
  // =============================================================================

  describe('Error Handling and Resilience (T071)', () => {
    it('should handle service timeouts gracefully', async () => {
      // Test with very short timeout to trigger timeout behavior
      const originalTimeout = process.env['RAG_TIMEOUT_MS'];
      process.env['RAG_TIMEOUT_MS'] = '1'; // 1ms timeout

      try {
        const request: ItineraryRequest = {
          session_id: testSessionId,
          request_id: testRequestId,
          operation: 'generate_itinerary',
          options: {},
        };

        // Should not throw, should handle timeout gracefully
        const response = await ragService.generateItinerary(request);
        expect(response).toBeDefined();
      } finally {
        process.env['RAG_TIMEOUT_MS'] = originalTimeout;
      }
    });

    it('should handle invalid session IDs', async () => {
      const invalidSessions = [
        '',
        'null',
        'undefined',
        '   ',
        'very-long-invalid-session-id-that-does-not-exist',
      ];

      for (const sessionId of invalidSessions) {
        const summary = await ragService.generateSessionSummary(sessionId);
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedRequest = {
        session_id: testSessionId,
        form_id: null,
        form_data: undefined,
        trigger_vectorization: 'invalid',
      } as any;

      const response = await ragService.processFormSubmission(malformedRequest);

      expect(response.success).toBe(false);
      expect(response.message).toContain('error');
    });
  });

  // =============================================================================
  // T072: Performance and Metrics Tests
  // =============================================================================

  describe('Performance and Metrics (T072)', () => {
    it('should complete operations within reasonable time limits', async () => {
      const startTime = Date.now();

      const request: FormSubmissionRequest = {
        session_id: testSessionId,
        form_id: 'PerformanceTest',
        form_data: { test: 'performance' },
        trigger_vectorization: false,
      };

      const response = await ragService.processFormSubmission(request);
      const duration = Date.now() - startTime;

      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should track processing times accurately', async () => {
      const request: ItineraryRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        operation: 'generate_itinerary',
        options: {},
      };

      const response = await ragService.generateItinerary(request);

      expect(response.processing_time_ms).toBeGreaterThan(0);
      expect(response.processing_time_ms).toBeLessThan(60000); // Should be less than 60 seconds
      expect(typeof response.processing_time_ms).toBe('number');
    });

    it('should provide cost tracking information', async () => {
      const request: QuestionRequest = {
        session_id: testSessionId,
        request_id: testRequestId,
        question: 'Test cost tracking',
        options: {},
      };

      const response = await ragService.handleFollowUpQuestion(request);

      expect(response.tokens_used.cost_usd).toBeGreaterThanOrEqual(0);
      expect(typeof response.tokens_used.cost_usd).toBe('number');
      expect(response.tokens_used.total_tokens).toBeGreaterThanOrEqual(0);
    });

    it('should maintain consistent response structure', async () => {
      const requests = [
        { session_id: testSessionId, request_id: 'test-1', question: 'Question 1', options: {} },
        { session_id: testSessionId, request_id: 'test-2', question: 'Question 2', options: {} },
        { session_id: testSessionId, request_id: 'test-3', question: 'Question 3', options: {} },
      ];

      const responses = await Promise.all(
        requests.map((req) => ragService.handleFollowUpQuestion(req))
      );

      responses.forEach((response, index) => {
        expect(response.request_id).toBe(requests[index]?.request_id);
        expect(response.data.type).toBe('question_answer');
        expect(typeof response.data.answer).toBe('string');
        expect(Array.isArray(response.citations)).toBe(true);
        expect(typeof response.confidence_score).toBe('number');
      });
    });
  });
});

// =============================================================================
// UTILITY FUNCTIONS FOR TESTING
// =============================================================================

/**
 * Create mock form data for testing
 */
export function createMockFormData(overrides: Partial<any> = {}) {
  return {
    destination: 'Test Destination',
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2025-10-07T00:00:00Z',
    groupSize: 2,
    travelVibe: 'adventure',
    ...overrides,
  };
}

/**
 * Create mock session for testing
 */
export function createMockSession(sessionId: string = 'test-session') {
  return {
    id: sessionId,
    created_at: new Date().toISOString(),
    raw_forms: {},
    summary: '',
    status: 'active',
  };
}

/**
 * Assertion helper for response validation
 */
export function assertValidRAGResponse(response: any, expectedType: string) {
  expect(response).toBeDefined();
  expect(typeof response.request_id).toBe('string');
  expect(typeof response.session_id).toBe('string');
  expect(typeof response.timestamp).toBe('string');
  expect(typeof response.processing_time_ms).toBe('number');
  expect(response.data.type).toBe(expectedType);
  expect(Array.isArray(response.citations)).toBe(true);
  expect(typeof response.confidence_score).toBe('number');
  expect(response.confidence_score).toBeGreaterThanOrEqual(0);
  expect(response.confidence_score).toBeLessThanOrEqual(1);
}
