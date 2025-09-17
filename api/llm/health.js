// Provider health monitoring endpoint - Vercel Edge Function
import { groqProvider } from '../providers/groq.js';
import { googleProvider } from '../providers/google.js';
import { cerebrasProvider } from '../providers/cerebras.js';
import { router } from '../utils/routing.js';

export const config = {
  runtime: 'edge',
};

const providers = {
  groq: groqProvider,
  google: googleProvider,
  cerebras: cerebrasProvider,
};

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const healthChecks = {};
    const checkPromises = [];

    // Check each provider's health
    for (const [name, provider] of Object.entries(providers)) {
      checkPromises.push(
        (async () => {
          try {
            const startTime = Date.now();
            const isAvailable = await provider.isAvailable();
            const hasCapacity = await provider.hasCapacity();
            const latency = Date.now() - startTime;

            let status;
            if (isAvailable && hasCapacity) {
              status = 'healthy';
            } else {
              status = 'degraded';
            }

            healthChecks[name] = {
              available: isAvailable,
              capacity: hasCapacity,
              latency_ms: latency,
              status: status,
              last_check: new Date().toISOString(),
            };
          } catch (error) {
            healthChecks[name] = {
              available: false,
              capacity: false,
              latency_ms: null,
              status: 'unhealthy',
              error: error.message,
              last_check: new Date().toISOString(),
            };
          }
        })()
      );
    }

    // Wait for all health checks to complete
    await Promise.all(checkPromises);

    // Get router health information
    const routerHealth = router.getProviderHealth();

    // Calculate overall system health
    const healthyProviders = Object.values(healthChecks).filter(
      (h) => h.status === 'healthy'
    ).length;
    const totalProviders = Object.keys(healthChecks).length;

    let systemStatus;
    if (healthyProviders === totalProviders) {
      systemStatus = 'healthy';
    } else if (healthyProviders > 0) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'unhealthy';
    }

    const response = {
      system: {
        status: systemStatus,
        healthy_providers: healthyProviders,
        total_providers: totalProviders,
        last_check: new Date().toISOString(),
      },
      providers: healthChecks,
      router_state: routerHealth,
      routing_rules: {
        high_complexity: ['cerebras', 'groq', 'google'],
        medium_complexity: ['groq', 'cerebras', 'google'],
        low_complexity: ['groq', 'google', 'cerebras'],
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ Health check error:', error);

    return new Response(
      JSON.stringify({
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
