/**
 * RAG System Health API - Health monitoring and status
 * T049: System health endpoint for monitoring
 * Vercel Edge Function for constitutional compliance
 */

import { createSessionService } from '../../src/services/sessionService.js';
import { createVectorService } from '../../src/services/vectorService.js';

// =============================================================================
// EDGE FUNCTION HANDLER
// =============================================================================

export default async function handler(req: Request) {
  // CORS headers for edge compatibility
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        message: 'Only GET requests are supported',
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
    console.log('[RAG Health Check] Request received:', {
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });

    // Initialize service health checks
    const sessionService = createSessionService();
    const vectorService = createVectorService();

    // Run health checks in parallel
    const [sessionHealth, vectorHealth] = await Promise.allSettled([
      sessionService.healthCheck().catch(() => ({ supabase: false, redis: false, overall: false })),
      vectorService
        .healthCheck()
        .catch(() => ({ qdrant: false, huggingface: false, overall: false })),
    ]);

    // Extract health check results
    const sessionHealthResult =
      sessionHealth.status === 'fulfilled'
        ? sessionHealth.value
        : { supabase: false, redis: false, overall: false };

    const vectorHealthResult =
      vectorHealth.status === 'fulfilled'
        ? vectorHealth.value
        : { qdrant: false, huggingface: false, overall: false };

    // Environment configuration check
    const envCheck = {
      supabase_configured: !!(
        process.env['SUPABASE_URL'] && process.env['SUPABASE_SERVICE_ROLE_KEY']
      ),
      redis_configured: !!(
        process.env['UPSTASH_REDIS_REST_URL'] && process.env['UPSTASH_REDIS_REST_TOKEN']
      ),
      qdrant_configured: !!(process.env['QDRANT_URL'] && process.env['QDRANT_API_KEY']),
      huggingface_configured: !!process.env['HUGGINGFACE_API_KEY'],
    };

    // Calculate overall system health
    const componentsHealthy = sessionHealthResult.overall && vectorHealthResult.overall;
    const configurationComplete = Object.values(envCheck).every(Boolean);
    const overallHealthy = componentsHealthy && configurationComplete;

    // Build health response
    const healthResponse = {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      version: '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      components: {
        session_service: {
          status: sessionHealthResult.overall ? 'healthy' : 'unhealthy',
          supabase: sessionHealthResult.supabase,
          redis: sessionHealthResult.redis,
        },
        vector_service: {
          status: vectorHealthResult.overall ? 'healthy' : 'unhealthy',
          qdrant: vectorHealthResult.qdrant,
          huggingface: vectorHealthResult.huggingface,
        },
        rag_service: {
          status: 'healthy', // RAG service doesn't have external dependencies
          initialized: true,
        },
      },
      configuration: envCheck,
      features: {
        form_submission: true,
        vectorization: vectorHealthResult.overall,
        session_management: sessionHealthResult.overall,
        itinerary_generation: true, // Mock generation always available
        question_answering: true,
        web_search: false, // Will be implemented in T050-T054
      },
      metrics: {
        uptime_ms: Date.now() - startTime, // Approximate for edge function
        request_count: 1, // This request
        error_count: 0,
        average_response_time_ms: Date.now() - startTime,
      },
    };

    console.log('[RAG Health Check] Completed:', {
      overall_status: healthResponse.status,
      session_healthy: sessionHealthResult.overall,
      vector_healthy: vectorHealthResult.overall,
      config_complete: configurationComplete,
      processing_time_ms: healthResponse.processing_time_ms,
    });

    return new Response(JSON.stringify(healthResponse), {
      status: overallHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      components: {
        session_service: { status: 'unknown' },
        vector_service: { status: 'unknown' },
        rag_service: { status: 'error' },
      },
    };

    console.error('[RAG Health Check] Error:', {
      error: errorResponse.message,
      processing_time_ms: errorResponse.processing_time_ms,
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    return new Response(JSON.stringify(errorResponse), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
