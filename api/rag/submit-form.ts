/**
 * RAG Form Submission API - Process travel form data
 * T044: Form submission endpoint with validation and vectorization
 * Vercel Edge Function for constitutional compliance
 */

import { z } from 'zod';
import { createRAGService } from '../../src/services/ragService.js';
import { FormSubmissionRequestSchema } from '../../src/types/rag.js';

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

/**
 * Validate and parse form submission request
 */
function validateFormSubmissionRequest(body: any) {
  try {
    return FormSubmissionRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`
      );
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
    console.log('[RAG Form Submission] Request received:', {
      timestamp: new Date().toISOString(),
      session_id: body.session_id,
      form_id: body.form_id,
      trigger_vectorization: body.trigger_vectorization,
      user_agent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });

    // Validate request
    const validatedRequest = validateFormSubmissionRequest(body);

    // Create RAG service instance
    const ragService = createRAGService();

    // Process form submission (cast to ensure TypeScript compatibility)
    const result = await ragService.processFormSubmission(validatedRequest as any);

    // Add processing metadata
    const response = {
      ...result,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    console.log('[RAG Form Submission] Request completed:', {
      session_id: validatedRequest.session_id,
      form_id: validatedRequest.form_id,
      success: result.success,
      vectorization_status: result.vectorization_status,
      processing_time_ms: response.processing_time_ms,
    });

    return new Response(JSON.stringify(response), {
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

    console.error('[RAG Form Submission] Error:', {
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
