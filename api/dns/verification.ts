/**
 * DNS Verification API Endpoints
 *
 * Edge function endpoints for DNS propagation monitoring and verification.
 * Provides REST API for starting, checking, and managing DNS verifications.
 */

import { dnsVerificationService } from '../../src/api/services/dnsVerificationService';
import {
  DNSVerificationRequestSchema,
  DNSVerificationInitiatedSchema,
  DNSVerificationResponseSchema,
} from '../../src/api/types/dns';

// DNS verification uses serverless runtime to avoid import complications
// (no export config = Node.js serverless function)

/**
 * Handle DNS verification requests
 */
export default async function handler(req: Request): Promise<Response> {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route based on path and method
    if (req.method === 'POST' && pathname.endsWith('/verify')) {
      return await handleStartVerification(req, corsHeaders);
    }

    if (req.method === 'POST' && pathname.endsWith('/verify-now')) {
      return await handleVerifyNow(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.includes('/status/')) {
      return await handleGetStatus(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.endsWith('/list')) {
      return await handleListVerifications(req, corsHeaders);
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('DNS verification API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Start DNS verification process
 */
async function handleStartVerification(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = DNSVerificationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Start verification
    const result = await dnsVerificationService.startVerification(parseResult.data);

    // Validate response
    const validatedResponse = DNSVerificationInitiatedSchema.parse({
      verificationId: result.verificationId,
      status: 'pending' as const,
      estimatedCompletion: result.estimatedCompletion,
    });

    return new Response(JSON.stringify(validatedResponse), {
      status: 202, // Accepted
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to start verification',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Perform immediate DNS verification
 */
async function handleVerifyNow(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = DNSVerificationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Perform immediate verification
    const result = await dnsVerificationService.verifyNow(parseResult.data);

    // Validate response
    const validatedResponse = DNSVerificationResponseSchema.parse(result);

    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Get verification status by ID
 */
async function handleGetStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const verificationId = pathParts[pathParts.length - 1];

    if (!verificationId) {
      return new Response(JSON.stringify({ error: 'Verification ID is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const record = await dnsVerificationService.getVerificationStatus(verificationId);

    if (!record) {
      return new Response(JSON.stringify({ error: 'Verification not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(record), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get verification status',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * List all active verifications
 */
async function handleListVerifications(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const verifications = await dnsVerificationService.listVerifications();

    return new Response(
      JSON.stringify({
        verifications,
        count: verifications.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to list verifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
