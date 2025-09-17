import { createProviderFactory } from '../../src/api/providers/factory';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // In Edge Runtime, access environment variables
    const env = (globalThis as any).process?.env || {};

    const factory = createProviderFactory(env as Record<string, string | undefined>);

    // Get status for all providers
    const providers = factory.getAllProviders();

    // Get status for each provider
    const providerStatuses = await Promise.all(
      Object.entries(providers).map(async ([name, provider]) => {
        try {
          const status = await provider.getStatus();
          let providerStatus: string;
          if (status.isHealthy) {
            providerStatus = 'healthy';
          } else if (status.isAvailable) {
            providerStatus = 'available';
          } else {
            providerStatus = 'unavailable';
          }
          return {
            name,
            status: providerStatus,
            lastChecked: new Date().toISOString(),
            error: status.isHealthy ? null : 'Provider not healthy',
            details: {
              isEnabled: status.isEnabled,
              isAvailable: status.isAvailable,
              hasCapacity: status.hasCapacity,
              totalRequests: status.metrics.totalRequests,
              errorRate: status.metrics.failedRequests / Math.max(status.metrics.totalRequests, 1),
            },
          };
        } catch (error) {
          return {
            name,
            status: 'error',
            lastChecked: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            details: null,
          };
        }
      })
    );

    const status = {
      timestamp: new Date().toISOString(),
      providers: providerStatuses,
    };

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Provider status error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
