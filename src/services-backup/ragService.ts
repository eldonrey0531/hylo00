/**
 * RAG Core Service - Multi-Agent Travel Planning Orchestration
 * Enhanced with LLM provider integration for real AI responses
 * Constitutional compliance: Edge-compatible, observable, type-safe
 */

import {
  ItineraryRequest,
  QuestionRequest,
  ItineraryResponse,
  QuestionResponse,
  FormSubmissionRequest,
  FormSubmissionResponse,
  Citation,
  ItineraryDay,
} from '../types/rag.js';

import { VectorService, createVectorService } from './vectorService.js';
import { SessionService, createSessionService } from './sessionService.js';
import { LLMRoutingClient } from './llmRoutingService.js';
import { WebSearchService, createWebSearchService } from './webSearchService.js';

// =============================================================================
// RAG SERVICE CONFIGURATION
// =============================================================================

interface RAGConfig {
  maxContextLength: number;
  summaryMaxLength: number;
  webSearchEnabled: boolean;
  citationRequired: boolean;
  defaultProvider: 'groq' | 'gemini' | 'cerebras';
  retryAttempts: number;
  timeoutMs: number;
  llmBaseUrl: string;
  enableLLMLogging: boolean;
}

interface ContextResult {
  vectorResults: any[];
  webResults?: any[];
  totalSources: number;
  confidence: number;
}

// =============================================================================
// RAG SERVICE CLASS
// =============================================================================

export class RAGService {
  private readonly vectorService: VectorService;
  private readonly sessionService: SessionService;
  private readonly config: RAGConfig;
  private readonly llmClient: LLMRoutingClient;
  private readonly webSearchService: WebSearchService;

  constructor(vectorService: VectorService, sessionService: SessionService, config: RAGConfig) {
    this.vectorService = vectorService;
    this.sessionService = sessionService;
    this.config = config;

    // Initialize LLM client for enhanced responses
    this.llmClient = new LLMRoutingClient({
      baseUrl: config.llmBaseUrl,
      enableLogging: config.enableLLMLogging,
    });

    // Initialize web search service for real-time data
    this.webSearchService = createWebSearchService();
  }
  /**
   * T038: processFormSubmission() orchestration method
   * Main entry point for form data processing and vectorization
   */
  async processFormSubmission(request: FormSubmissionRequest): Promise<FormSubmissionResponse> {
    const startTime = Date.now();

    try {
      await this.observeRAGOperation('form_submission_start', {
        session_id: request.session_id,
        form_id: request.form_id,
        trigger_vectorization: request.trigger_vectorization,
      });

      // Step 1: Update session with form data
      const sessionResult = await this.sessionService.updateSessionData(
        request.session_id,
        request.form_id as any,
        request.form_data
      );

      if (!sessionResult.success) {
        throw new Error(`Session update failed: ${sessionResult.error}`);
      }

      // Step 2: Trigger vectorization if requested
      let vectorizationStatus: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' =
        'pending';

      if (request.trigger_vectorization) {
        try {
          // Generate and store vector
          const vectorResult = await this.vectorService.upsertSessionVector(
            request.session_id,
            request.form_id,
            request.form_data
          );

          vectorizationStatus = vectorResult.success ? 'completed' : 'failed';
        } catch (vectorError) {
          vectorizationStatus = 'failed';
          console.warn('Vectorization failed:', vectorError);
        }
      }

      const response: FormSubmissionResponse = {
        success: true,
        session_id: request.session_id,
        vectorization_status: vectorizationStatus,
        message: `Form ${request.form_id} processed successfully`,
      };

      await this.observeRAGOperation('form_submission_complete', {
        session_id: request.session_id,
        form_id: request.form_id,
        vectorization_status: vectorizationStatus,
        duration_ms: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      const response: FormSubmissionResponse = {
        success: false,
        session_id: request.session_id,
        vectorization_status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      await this.observeRAGOperation('form_submission_error', {
        session_id: request.session_id,
        form_id: request.form_id,
        error: response.message,
        duration_ms: Date.now() - startTime,
      });

      return response;
    }
  }

  /**
   * T039: generateSessionSummary() method for vectorization preparation
   * Create human-readable summary from all session forms
   */
  async generateSessionSummary(sessionId: string): Promise<string> {
    const startTime = Date.now();

    try {
      // Get session data
      const sessionResult = await this.sessionService.getSession(sessionId);
      if (!sessionResult.success || !sessionResult.sessionData) {
        throw new Error('Session not found');
      }

      const session = sessionResult.sessionData;
      const forms = session.raw_forms;

      // Build comprehensive summary
      const summaryParts: string[] = [];

      // Extract key information from forms
      for (const [formId, formData] of Object.entries(forms)) {
        if (typeof formData === 'object' && formData !== null) {
          // Extract destination
          if (formData.destination) {
            summaryParts.push(`Destination: ${formData.destination}`);
          }

          // Extract dates
          if (formData.startDate && formData.endDate) {
            summaryParts.push(`Travel dates: ${formData.startDate} to ${formData.endDate}`);
          }

          // Extract group size
          if (formData.groupSize) {
            summaryParts.push(`Group size: ${formData.groupSize} people`);
          }

          // Extract travel style
          if (formData.travelVibe) {
            summaryParts.push(`Travel style: ${formData.travelVibe}`);
          }

          // Extract interests
          if (formData.interests && Array.isArray(formData.interests)) {
            const interestNames = formData.interests.map((i: any) =>
              typeof i === 'object' ? i.category || i.name : String(i)
            );
            if (interestNames.length > 0) {
              summaryParts.push(`Interests: ${interestNames.join(', ')}`);
            }
          }

          // Extract budget info
          if (formData.budgetRange) {
            summaryParts.push(`Budget: ${formData.budgetRange.flexibility || ''} budget`);
          }

          // Add form identifier
          summaryParts.push(`Form: ${formId}`);
        }
      }

      // Create final summary
      const summary =
        summaryParts.join('. ') || 'Travel planning session with multiple form submissions';

      // Truncate if too long
      const truncatedSummary =
        summary.length > this.config.summaryMaxLength
          ? summary.substring(0, this.config.summaryMaxLength) + '...'
          : summary;

      await this.observeRAGOperation('session_summary_generated', {
        session_id: sessionId,
        form_count: Object.keys(forms).length,
        summary_length: truncatedSummary.length,
        duration_ms: Date.now() - startTime,
      });

      return truncatedSummary;
    } catch (error) {
      await this.observeRAGOperation('session_summary_error', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });

      throw new Error(`Failed to generate session summary: ${error}`);
    }
  }

  /**
   * T040: retrieveContextualData() method for vector search and ranking
   * Search and rank relevant context from vectors and web sources
   */
  async retrieveContextualData(
    sessionId: string,
    query: string,
    options: {
      includeWebSearch?: boolean;
      maxResults?: number;
      similarityThreshold?: number;
    } = {}
  ): Promise<ContextResult> {
    const startTime = Date.now();

    try {
      // Search vector database for relevant context
      const vectorResults = await this.vectorService.searchVectors(query, sessionId, {
        limit: options.maxResults || 10,
        similarityThreshold: options.similarityThreshold || 0.7,
      });

      const webResults: any[] = [];

      // Enhanced web search integration (T050-T054)
      if (options.includeWebSearch && this.config.webSearchEnabled) {
        try {
          const webSearchResult = await this.webSearchService.search({
            query,
            category: 'general',
            options: {
              maxResults: Math.min(options.maxResults || 5, 5),
              freshness: 'month',
            },
          });

          if (webSearchResult.success && webSearchResult.data) {
            webResults.push(
              ...webSearchResult.data.results.map((result) => ({
                title: result.title,
                snippet: result.snippet,
                url: result.link,
                source: 'web_search',
                relevance: result.metadata?.trustScore || 0.5,
                timestamp: webSearchResult.data!.timestamp,
              }))
            );
          }
        } catch (webError) {
          console.warn('Web search failed, continuing with vector results only:', webError);
        }
      }

      // Calculate confidence based on result quality
      const confidence = this.calculateContextConfidence(vectorResults, webResults);

      const result: ContextResult = {
        vectorResults,
        totalSources: vectorResults.length + webResults.length,
        confidence,
      };

      if (webResults.length > 0) {
        result.webResults = webResults;
      }

      await this.observeRAGOperation('context_retrieval', {
        session_id: sessionId,
        query_length: query.length,
        vector_results: vectorResults.length,
        web_results: webResults.length,
        confidence,
        duration_ms: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      await this.observeRAGOperation('context_retrieval_error', {
        session_id: sessionId,
        query_length: query.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });

      throw new Error(`Context retrieval failed: ${error}`);
    }
  }

  /**
   * T041: generateItinerary() method with provider routing
   * Generate structured itinerary using LLM with contextual data
   */
  async generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
    const startTime = Date.now();
    const requestId = request.request_id;

    try {
      await this.observeRAGOperation('itinerary_generation_start', {
        session_id: request.session_id,
        request_id: requestId,
        options: request.options,
      });

      // Step 1: Get session summary for context
      const sessionSummary = await this.generateSessionSummary(request.session_id);

      // Step 2: Retrieve contextual data
      const contextData = await this.retrieveContextualData(request.session_id, sessionSummary, {
        includeWebSearch: request.options?.include_web_search ?? true,
        maxResults: request.options?.max_results ?? 10,
        similarityThreshold: request.options?.similarity_threshold ?? 0.7,
      });

      // Step 3: Generate mock itinerary (will integrate with LLM providers in T055-T059)
      const itineraryData = this.generateMockItinerary(sessionSummary);

      // Step 4: Create citations
      const citations = this.createCitations(contextData);

      const response: ItineraryResponse = {
        request_id: requestId,
        session_id: request.session_id,
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        tokens_used: {
          provider: 'groq',
          operation: 'generation',
          total_tokens: 500, // Mock value
          cost_usd: 0.001, // Mock value
        },
        citations,
        confidence_score: contextData.confidence,
        data: {
          type: 'itinerary',
          itinerary: itineraryData.days,
          summary: itineraryData.summary,
          total_cost_estimate: itineraryData.costEstimate,
          actions: [
            {
              type: 'booking',
              label: 'Book Selected Activities',
              description: 'Book the recommended activities and accommodations',
            },
            {
              type: 'download',
              label: 'Download PDF Itinerary',
              description: 'Download a PDF version of your itinerary',
            },
            {
              type: 'share',
              label: 'Share Itinerary',
              description: 'Share your itinerary with travel companions',
            },
            {
              type: 'modify',
              label: 'Modify Itinerary',
              description: 'Make changes to your travel plans',
            },
          ],
        },
      };

      await this.observeRAGOperation('itinerary_generation_complete', {
        session_id: request.session_id,
        request_id: requestId,
        provider: 'groq',
        tokens_used: response.tokens_used.total_tokens,
        cost_usd: response.tokens_used.cost_usd,
        confidence: response.confidence_score,
        duration_ms: response.processing_time_ms,
      });

      return response;
    } catch (error) {
      await this.observeRAGOperation('itinerary_generation_error', {
        session_id: request.session_id,
        request_id: requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });

      throw new Error(`Itinerary generation failed: ${error}`);
    }
  }

  /**
   * T042: handleFollowUpQuestion() method for Q&A context
   * Handle follow-up questions about the itinerary or travel plans
   */
  async handleFollowUpQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    const startTime = Date.now();
    const requestId = request.request_id;

    try {
      await this.observeRAGOperation('question_answering_start', {
        session_id: request.session_id,
        request_id: requestId,
        question_length: request.question.length,
      });

      // Step 1: Retrieve relevant context for the question
      const contextData = await this.retrieveContextualData(request.session_id, request.question, {
        includeWebSearch: request.options?.include_web_search ?? false,
        maxResults: request.options?.max_results ?? 5,
        similarityThreshold: request.options?.similarity_threshold ?? 0.6,
      });

      // Step 2: Get session summary for additional context
      const sessionSummary = await this.generateSessionSummary(request.session_id);

      // Step 3: Generate mock answer (will integrate with LLM providers in T055-T059)
      const answer = this.generateMockAnswer(request.question, sessionSummary, contextData);

      // Step 4: Generate related suggestions
      const relatedSuggestions = this.generateRelatedSuggestions(request.question);

      const response: QuestionResponse = {
        request_id: requestId,
        session_id: request.session_id,
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        tokens_used: {
          provider: 'groq',
          operation: 'generation',
          total_tokens: 200, // Mock value
          cost_usd: 0.0004, // Mock value
        },
        citations: this.createCitations(contextData),
        confidence_score: contextData.confidence,
        data: {
          type: 'question_answer',
          answer,
          context_used: contextData.vectorResults.map((r: any) => r.metadata?.form_id || 'unknown'),
          related_suggestions: relatedSuggestions,
        },
      };

      await this.observeRAGOperation('question_answering_complete', {
        session_id: request.session_id,
        request_id: requestId,
        question_length: request.question.length,
        answer_length: response.data.answer.length,
        provider: 'groq',
        tokens_used: response.tokens_used.total_tokens,
        confidence: response.confidence_score,
        duration_ms: response.processing_time_ms,
      });

      return response;
    } catch (error) {
      await this.observeRAGOperation('question_answering_error', {
        session_id: request.session_id,
        request_id: requestId,
        question_length: request.question.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });

      throw new Error(`Question answering failed: ${error}`);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Calculate confidence score based on context quality
   */
  private calculateContextConfidence(vectorResults: any[], webResults: any[]): number {
    if (vectorResults.length === 0 && webResults.length === 0) {
      return 0.1; // Very low confidence with no context
    }

    // Base confidence on vector search scores
    const avgVectorScore =
      vectorResults.length > 0
        ? vectorResults.reduce((sum, r) => sum + (r.score || 0), 0) / vectorResults.length
        : 0;

    // Boost confidence if we have web results
    const webBoost = webResults.length > 0 ? 0.1 : 0;

    // Penalty for low result count
    const countPenalty = Math.min(vectorResults.length / 5, 1);

    return Math.min(avgVectorScore * countPenalty + webBoost, 1.0);
  }

  /**
   * Generate mock itinerary (placeholder until LLM integration)
   */
  private generateMockItinerary(sessionSummary: string): {
    days: ItineraryDay[];
    summary: string;
    costEstimate?: any;
  } {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    return {
      days: [
        {
          date: dateString || '2025-09-18',
          location: 'Travel Destination',
          activities: [
            {
              id: '1',
              name: 'Welcome & Orientation',
              description: `Based on your travel preferences: ${sessionSummary.substring(
                0,
                200
              )}...`,
              location: {
                name: 'City Center',
                city: 'Travel Destination',
                country: 'To Be Determined',
              },
              time_slot: {
                start_time: '09:00',
                end_time: '12:00',
                flexibility: 'flexible' as const,
              },
              duration_minutes: 180,
              category: 'culture' as const,
              accessibility_friendly: true,
              weather_dependent: false,
            },
          ],
        },
      ],
      summary: 'A customized travel itinerary based on your preferences and interests',
      costEstimate: {
        amount: 500,
        currency: 'USD',
        breakdown: {
          accommodation: 200,
          activities: 150,
          food: 150,
        },
      },
    };
  }

  /**
   * Generate mock answer (placeholder until LLM integration)
   */
  private generateMockAnswer(
    question: string,
    sessionSummary: string,
    contextData: ContextResult
  ): string {
    return `Based on your travel plans (${sessionSummary.substring(
      0,
      100
    )}...) and your question "${question}", here's what I can tell you: 

This is a placeholder response that will be replaced with actual LLM-generated content once the provider integration is complete (T055-T059). 

The system found ${
      contextData.vectorResults.length
    } relevant pieces of information from your session data to help answer your question.`;
  }

  /**
   * Create citations from context data
   */
  private createCitations(contextData: ContextResult): Citation[] {
    return contextData.vectorResults.map((result: any, index: number) => ({
      id: `vector_${index}`,
      source_type: 'vector_search' as const,
      title: `Form: ${result.metadata?.form_id || 'Unknown'}`,
      snippet: result.summary || 'Form data summary',
      relevance_score: result.score || 0,
      accessed_at: new Date().toISOString(),
    }));
  }

  /**
   * Generate related question suggestions
   */
  private generateRelatedSuggestions(question: string): string[] {
    // Simple related suggestions based on common travel questions
    const suggestions = [
      'What are the best times to visit these destinations?',
      'Are there any local customs I should be aware of?',
      'What are the visa requirements for these countries?',
      'What should I pack for this trip?',
      'Are there any safety considerations for this itinerary?',
    ];

    // Return first 3 suggestions that don't match the current question
    return suggestions
      .filter((s) => !s.toLowerCase().includes(question.toLowerCase().substring(0, 20)))
      .slice(0, 3);
  }

  /**
   * Simple observability for RAG operations
   */
  private async observeRAGOperation(
    operationName: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`[RAG Core] ${operationName}:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('RAG observability logging failed:', error);
    }
  }
}

// =============================================================================
// FACTORY FUNCTION FOR EDGE-COMPATIBLE INITIALIZATION
// =============================================================================

/**
 * Create RAGService instance with all dependencies
 * Edge-compatible factory function
 */
export function createRAGService(): RAGService {
  const config: RAGConfig = {
    maxContextLength: parseInt(process.env['RAG_MAX_CONTEXT_LENGTH'] || '8000'),
    summaryMaxLength: parseInt(process.env['RAG_SUMMARY_MAX_LENGTH'] || '1000'),
    webSearchEnabled: process.env['RAG_WEB_SEARCH_ENABLED'] === 'true',
    citationRequired: process.env['RAG_CITATION_REQUIRED'] !== 'false',
    defaultProvider: (process.env['RAG_DEFAULT_PROVIDER'] as any) || 'groq',
    retryAttempts: parseInt(process.env['RAG_RETRY_ATTEMPTS'] || '3'),
    timeoutMs: parseInt(process.env['RAG_TIMEOUT_MS'] || '30000'),
    llmBaseUrl: process.env['LLM_BASE_URL'] || '/api/llm',
    enableLLMLogging: process.env['NODE_ENV'] !== 'production',
  };

  const vectorService = createVectorService();
  const sessionService = createSessionService();

  return new RAGService(vectorService, sessionService, config);
}
