/**
 * Main LLM Routing API Endpoint
 *
 * Primary Vercel Edge Function for LLM query routing with constitutional compliance:
 * - Edge-first architecture with no client-side API keys
 * - Multi-LLM resilience with intelligent provider selection
 * - Observable operations with comprehensive tracing
 * - Streaming responses for progressive enhancement
 * - Cost-conscious design with quota management
 */

import type { LLMRequest, ProviderName } from '../types/index.js';
import type { LangSmithConfig } from '../types/observability.js';
import { ProviderFactory } from '../providers/factory.js';
import { RoutingEngine } from '../utils/routing.js';
import { FallbackHandler } from '../utils/fallback.js';
import { createObservabilityService } from '../utils/observability.js';

// =============================================================================
// Edge Runtime Configuration
// =============================================================================

export const config = {
  runtime: 'edge',
};

/**
 * Environment validation for edge runtime
 */
function validateEnvironment(env: Record<string, string | undefined>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = ['GROQ_API_KEY'];
  for (const key of required) {
    if (!env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Optional but recommended
  const optional = ['GEMINI_API_KEY', 'CEREBRAS_API_KEY', 'LANGSMITH_API_KEY'];
  for (const key of optional) {
    if (!env[key]) {
      warnings.push(`Missing optional environment variable: ${key}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create request ID for tracing
 */
function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse and validate request body
 */
async function parseRequest(request: Request): Promise<{
  llmRequest: LLMRequest;
  requestId: string;
  userAgent: string;
  timestamp: number;
}> {
  const requestId = createRequestId();
  const timestamp = Date.now();
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    throw new Error(
      `Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Validate required fields
  if (!body.query || typeof body.query !== 'string') {
    throw new Error('Missing or invalid "query" field in request body');
  }

  if (body.query.length > 50000) {
    throw new Error('Query too long (maximum 50,000 characters)');
  }

  const llmRequest: LLMRequest = {
    query: body.query,
    options: {
      maxTokens: Math.min(body.options?.maxTokens || 2000, 4000),
      temperature: Math.max(0, Math.min(body.options?.temperature || 0.7, 2)),
      stream: body.options?.stream || false,
    },
    metadata: {
      requestId,
      timestamp: timestamp.toString(),
    },
  };

  return { llmRequest, requestId, userAgent, timestamp };
}

/**
 * Create streaming response for real-time updates
 */
function createStreamingResponse(
  requestId: string,
  onData: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>
): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await onData(controller);
      } catch (error) {
        const errorMessage = JSON.stringify({
          type: 'error',
          requestId,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'stream_error',
          },
          timestamp: Date.now(),
        });

        controller.enqueue(new TextEncoder().encode(`data: ${errorMessage}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Send Server-Sent Event
 */
function sendSSE(
  controller: ReadableStreamDefaultController<Uint8Array>,
  type: string,
  data: any,
  requestId: string
): void {
  const message = JSON.stringify({
    type,
    requestId,
    data,
    timestamp: Date.now(),
  });

  controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
}

/**
 * Main request handler
 */
async function handleLLMRequest(
  request: Request,
  env: Record<string, string | undefined>
): Promise<Response> {
  const startTime = Date.now();

  // Parse and validate request
  const { llmRequest, requestId, userAgent, timestamp } = await parseRequest(request);

  // Initialize services
  const providerFactory = new ProviderFactory(env);
  const routingEngine = new RoutingEngine(providerFactory);
  const fallbackHandler = new FallbackHandler(providerFactory);

  // Initialize observability if configured
  const langsmithConfig: LangSmithConfig = {
    apiKey: env.LANGSMITH_API_KEY || '',
    projectName: env.LANGSMITH_PROJECT || 'hylo-travel-ai',
    tracingEnabled: env.LANGSMITH_TRACING !== 'false',
    debugMode: env.NODE_ENV === 'development',
    batchSize: 100,
    flushInterval: 5000,
    maxRetries: 3,
  };
  const observability = createObservabilityService(langsmithConfig);

  // Start session for request tracking
  await observability.startSession(undefined, `Request ${requestId}`);

  return createStreamingResponse(requestId, async (controller) => {
    try {
      // Send initial acknowledgment
      sendSSE(
        controller,
        'started',
        {
          message: 'Request received and processing started',
          requestId,
          timestamp: startTime,
        },
        requestId
      );

      // Step 1: Complexity Analysis
      sendSSE(
        controller,
        'step',
        {
          step: 'complexity_analysis',
          message: 'Analyzing query complexity...',
        },
        requestId
      );

      const complexity = await routingEngine.analyzeComplexity(llmRequest);

      sendSSE(
        controller,
        'complexity',
        {
          level: complexity.level,
          score: complexity.score,
          reasoning: complexity.reasoning,
          factors: complexity.factors,
          estimatedTokens: complexity.tokenEstimate,
        },
        requestId
      );

      // Step 2: Provider Selection
      sendSSE(
        controller,
        'step',
        {
          step: 'provider_selection',
          message: 'Selecting optimal provider...',
        },
        requestId
      );

      const routingDecision = await routingEngine.routeRequest(llmRequest);

      sendSSE(
        controller,
        'routing',
        {
          selectedProvider: routingDecision.selectedProvider,
          reasoning: routingDecision.reasoning,
          fallbackChain: routingDecision.fallbackChain,
          candidates: routingDecision.candidateProviders,
        },
        requestId
      );

      // Step 3: LLM Execution with Fallbacks
      sendSSE(
        controller,
        'step',
        {
          step: 'llm_execution',
          message: `Executing request with ${routingDecision.selectedProvider}...`,
        },
        requestId
      );

      const executionStart = Date.now();

      const result = await fallbackHandler.executeWithFallback(
        llmRequest,
        routingDecision.selectedProvider,
        routingDecision.fallbackChain
      );

      const executionEnd = Date.now();

      // Step 4: Results and Tracing
      sendSSE(
        controller,
        'step',
        {
          step: 'completion',
          message: 'Processing completed, recording metrics...',
        },
        requestId
      );

      // Record comprehensive tracing
      const finalProvider =
        'attempts' in result
          ? result.attempts.find((a) => a.success)?.provider || 'none'
          : routingDecision.selectedProvider;

      await observability.traceRequest(llmRequest, complexity, routingDecision, result, {
        startTime: executionStart,
        endTime: executionEnd,
        provider: finalProvider as ProviderName,
        fallbacksUsed: 'attempts' in result ? result.attempts.length - 1 : 0,
      });

      // Send final result
      const finalResponse =
        'response' in result ? result.response : 'Operation completed with degraded response';
      const success = !('degradedResponse' in result) || !result.degradedResponse;

      sendSSE(
        controller,
        'completed',
        {
          success,
          response: finalResponse,
          metadata: {
            provider: finalProvider,
            totalLatency: executionEnd - startTime,
            complexityLevel: complexity.level,
            fallbacksUsed: 'attempts' in result ? result.attempts.length - 1 : 0,
            usage: 'usage' in result ? result.usage : undefined,
          },
        },
        requestId
      );

      // Send final metrics
      sendSSE(
        controller,
        'metrics',
        {
          totalLatency: executionEnd - startTime,
          complexity: complexity.level,
          provider: finalProvider,
          success,
          timestamp: executionEnd,
        },
        requestId
      );
    } catch (error) {
      console.error('LLM routing error:', error);

      // Log error for monitoring
      console.error('Error details:', {
        requestId,
        userAgent,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      sendSSE(
        controller,
        'error',
        {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'routing_error',
          retryable: true,
        },
        requestId
      );
    } finally {
      // Cleanup
      await observability.endSession();
      await observability.flush();
    }
  });
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Main handler export for Vercel Edge Functions
 * Constitutional requirement: Edge-first architecture
 */
export default async function handler(request: Request): Promise<Response> {
  // Initialize environment access for edge runtime
  const env: Record<string, string | undefined> = {};
  try {
    // Try to access environment variables safely
    if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
      Object.assign(env, (globalThis as any).process.env);
    }
  } catch {
    // Fallback for edge runtime
    console.warn('Environment variables not accessible in edge runtime');
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
        allowedMethods: ['POST', 'OPTIONS'],
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          Allow: 'POST, OPTIONS',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Validate environment
    const envValidation = validateEnvironment(env);
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.errors);
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          message: 'Server configuration is invalid',
          details: envValidation.errors,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Log warnings but continue
    if (envValidation.warnings.length > 0) {
      console.warn('Environment warnings:', envValidation.warnings);
    }

    return await handleLLMRequest(request, env);
  } catch (error) {
    console.error('Handler error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
