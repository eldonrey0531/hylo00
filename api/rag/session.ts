/**
 * RAG Session Management API - Manage user sessions
 * T047: Session status and management endpoint
 * Vercel Edge Function for constitutional compliance
 */

import { z } from 'zod';
import { createSessionService } from '../../src/services/sessionService.js';

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

const SessionRequestSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  action: z.enum(['get', 'extend', 'flush']),
});

/**
 * Validate and parse session request
 */
function validateSessionRequest(body: any) {
  try {
    return SessionRequestSchema.parse(body);
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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

  const startTime = Date.now();

  try {
    let sessionId: string;
    let action: string;

    // Handle GET request (session status)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      sessionId = url.searchParams.get('session_id') || '';
      action = 'get';

      if (!sessionId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing session_id parameter',
            message: 'session_id is required in query parameters',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Validate session ID format
      if (!z.string().uuid().safeParse(sessionId).success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid session ID format',
            message: 'session_id must be a valid UUID',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }
    // Handle POST request (session actions)
    else if (req.method === 'POST') {
      const body = await req.json();
      const validatedRequest = validateSessionRequest(body);
      sessionId = validatedRequest.session_id;
      action = validatedRequest.action;
    }
    // Invalid method
    else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
          message: 'Only GET and POST requests are supported',
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

    // Log request for observability
    console.log('[RAG Session Management] Request received:', {
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      action,
      method: req.method,
      user_agent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });

    // Create session service instance
    const sessionService = createSessionService();

    let result: any;

    // Execute the requested action
    switch (action) {
      case 'get':
        result = await sessionService.getSession(sessionId);
        if (result.success && result.sessionData) {
          // Transform to session status response
          const sessionData = result.sessionData;
          result = {
            success: true,
            session_id: sessionId,
            session_state: sessionData.session_state,
            form_count: sessionData.metadata.form_count,
            vectorization_status: sessionData.flags.vectorized ? 'completed' : 'pending',
            last_activity_at: sessionData.last_activity_at,
            expires_at: sessionData.expires_at,
            budget_status: {
              spent_usd: 0, // Mock value - will be implemented with budget tracking
              limit_usd: 100,
              remaining_usd: 100,
              is_over_budget: false,
            },
          };
        }
        break;

      case 'extend':
        result = await sessionService.extendSession(sessionId, 24); // Extend by 24 hours
        if (result.success) {
          result = {
            success: true,
            session_id: sessionId,
            message: 'Session extended by 24 hours',
            new_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
        }
        break;

      case 'flush':
        result = await sessionService.flushSession(sessionId);
        if (result.success) {
          result = {
            success: true,
            session_id: sessionId,
            message: 'Session flushed successfully',
          };
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Add processing metadata
    const response = {
      ...result,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    console.log('[RAG Session Management] Request completed:', {
      session_id: sessionId,
      action,
      success: result.success,
      processing_time_ms: response.processing_time_ms,
    });

    return new Response(JSON.stringify(response), {
      status: result.success ? 200 : 404,
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

    console.error('[RAG Session Management] Error:', {
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
// SERVERLESS RUNTIME CONFIGURATION
// =============================================================================

// Uses Node.js runtime due to Supabase and Upstash dependencies
// No config export = defaults to Node.js serverless function
