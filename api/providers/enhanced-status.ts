/**
 * Enhanced Provider Status API Endpoints
 *
 * Edge function endpoints for enhanced provider status monitoring.
 * Provides detailed provider health, metrics, and capability information.
 */

import { enhancedProviderStatusService } from '../services/enhancedProviderStatusService';

export const config = { runtime: 'edge' };

/**
 * Handle enhanced provider status requests
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
    if (req.method === 'GET' && pathname.endsWith('/status')) {
      return await handleGetAllStatus(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.includes('/status/')) {
      return await handleGetProviderStatus(req, corsHeaders);
    }

    if (req.method === 'POST' && pathname.endsWith('/refresh')) {
      return await handleRefreshStatus(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.endsWith('/simple')) {
      return await handleGetSimpleStatus(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.endsWith('/providers')) {
      return await handleListProviders(req, corsHeaders);
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
    console.error('Enhanced provider status API error:', error);

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
 * Get detailed status for all providers
 */
async function handleGetAllStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const statusMap = await enhancedProviderStatusService.getAllProviderStatus();

    // Convert Map to object for JSON response
    const statusObject: Record<string, any> = {};
    for (const [providerId, status] of statusMap) {
      statusObject[providerId] = status;
    }

    return new Response(
      JSON.stringify({
        providers: statusObject,
        timestamp: new Date().toISOString(),
        count: statusMap.size,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get provider status',
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
 * Get detailed status for a specific provider
 */
async function handleGetProviderStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const providerId = pathParts[pathParts.length - 1];

    if (!providerId) {
      return new Response(JSON.stringify({ error: 'Provider ID is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const status = await enhancedProviderStatusService.getProviderStatus(providerId);

    if (!status) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        provider: status,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get provider status',
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
 * Refresh provider status (bypass cache)
 */
async function handleRefreshStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const providerId = url.searchParams.get('provider');

    // Refresh specific provider or all providers
    await enhancedProviderStatusService.refreshProviderStatus(providerId || undefined);

    return new Response(
      JSON.stringify({
        message: providerId ? `Provider ${providerId} refreshed` : 'All providers refreshed',
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
        error: 'Failed to refresh provider status',
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
 * Get simple status summary (compatibility endpoint)
 */
async function handleGetSimpleStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const simpleStatus = await enhancedProviderStatusService.getSimpleStatus();

    return new Response(
      JSON.stringify({
        status: simpleStatus,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=30', // Cache for 30 seconds
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get simple status',
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
 * List all configured providers
 */
async function handleListProviders(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const providerIds = enhancedProviderStatusService.getProviderIds();

    return new Response(
      JSON.stringify({
        providers: providerIds,
        count: providerIds.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to list providers',
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
