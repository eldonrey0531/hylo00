/**
 * RAG Question Answering API - Handle follow-up questions
 * T046: Question answering endpoint with contextual retrieval
 * Vercel Edge Function for constitutional compliance
 */

import { z } from 'zod';
import { createRAGService } from '../../src/services/ragService.js';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

const QuestionRequestSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(1000, 'Question is too long'),
  options: z
    .object({
      include_web_search: z.boolean().optional(),
      max_results: z.number().int().min(1).max(10).optional(),
      similarity_threshold: z.number().min(0).max(1).optional(),
      max_tokens: z.number().int().min(50).max(2000).optional(),
    })
    .optional(),
});

/**
 * Validate and parse question request
 */
function validateQuestionRequest(body: any) {
  try {
    const validated = QuestionRequestSchema.parse(body);
    return {
      request_id: uuidv4(),
      ...validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

// =============================================================================
// EDGE FUNCTION HANDLER
// =============================================================================

export default async function handler(req: Request) {
  // CORS headers for edge compatibility
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  const startTime = Date.now();

  try {
    // Parse request body
    const body = await req.json();

    // Log request for observability
    console.log('[RAG Question Answering] Request received:', {
      timestamp: new Date().toISOString(),
      session_id: body.session_id,
      question_length: body.question?.length || 0,
      options: body.options,
      user_agent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });

    // Validate request
    const validatedRequest = validateQuestionRequest(body);

    // Create RAG service instance
    const ragService = createRAGService();

    // Handle follow-up question
    const result = await ragService.handleFollowUpQuestion(validatedRequest as any);

    console.log('[RAG Question Answering] Request completed:', {
      session_id: validatedRequest.session_id,
      request_id: validatedRequest.request_id,
      question_length: validatedRequest.question.length,
      answer_length: result.data.answer.length,
      processing_time_ms: result.processing_time_ms,
      tokens_used: result.tokens_used.total_tokens,
      confidence_score: result.confidence_score,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    console.error('[RAG Question Answering] Error:', {
      error: errorResponse.message,
      processing_time_ms: errorResponse.processing_time_ms,
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    return new Response(JSON.stringify(errorResponse), {
      status: error instanceof Error && error.message.includes('Validation failed') ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// =============================================================================
// EDGE RUNTIME CONFIGURATION
// =============================================================================

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'fra1'], // Multi-region deployment
};
