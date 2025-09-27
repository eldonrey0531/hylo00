import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';
import { getItineraryConfig } from '@/lib/config/itinerary-config';

interface ServiceHealth {
  status: string;
  latency: number;
  [key: string]: unknown;
}

type OverrideStatus = 'healthy' | 'degraded' | 'error';

interface SimulationOverride {
  status: OverrideStatus;
  latency?: number;
}

const REQUIRED_XAI_MODELS = [
  'grok-4-fast-reasoning',
  'grok-4-fast-non-reasoning',
];

const ALLOWED_OVERRIDE_STATUSES: readonly OverrideStatus[] = ['healthy', 'degraded', 'error'];

function parseSimulationOverrides(rawParam: string | null): Record<string, SimulationOverride> {
  if (!rawParam) {
    return {};
  }

  const overrides: Record<string, SimulationOverride> = {};

  for (const entry of rawParam.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }

    const [servicePart, valuePart] = trimmed.split('=');
    if (!servicePart || !valuePart) {
      continue;
    }

    const serviceName = servicePart.trim().toLowerCase();
    const [statusToken, latencyToken] = valuePart.split(':').map((segment) => segment.trim());

    if (!statusToken) {
      continue;
    }

    const normalizedStatus = statusToken.toLowerCase() as OverrideStatus;
    if (!ALLOWED_OVERRIDE_STATUSES.includes(normalizedStatus)) {
      continue;
    }

    const override: SimulationOverride = { status: normalizedStatus };

    if (latencyToken) {
      const parsedLatency = Number(latencyToken);
      if (Number.isFinite(parsedLatency) && parsedLatency >= 0) {
        override.latency = parsedLatency;
      }
    }

    overrides[serviceName] = override;
  }

  return overrides;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.log(1, 'AI health check request received', 'ai/health/route.ts', 'GET');

    const config = getItineraryConfig();

    logger.log(2, 'Checking xAI service health', 'ai/health/route.ts', 'GET', {
      apiKeyPresent: Boolean(config.xai.apiKey),
    });
    const xaiHealth = await checkXaiHealth(config.xai.apiKey);
    logger.log(3, 'xAI health check completed', 'ai/health/route.ts', 'GET', xaiHealth);

    const simulationOverrides = parseSimulationOverrides(request.nextUrl.searchParams.get('simulate'));

    // TODO: Replace simulated checks with real integrations for Groq, Tavily, and Exa (T024, T025)
    logger.log(4, 'Checking Groq AI service health', 'ai/health/route.ts', 'GET', {
      overrideRequested: Boolean(simulationOverrides.groq),
    });

    // Mock Groq health check
    const groqHealth = await simulateHealthCheck('groq', 100, simulationOverrides.groq);
    logger.log(5, 'Groq health check completed', 'ai/health/route.ts', 'GET', groqHealth);

    logger.log(6, 'Checking Tavily research service health', 'ai/health/route.ts', 'GET', {
      overrideRequested: Boolean(simulationOverrides.tavily),
    });

    // Mock Tavily health check
    const tavilyHealth = await simulateHealthCheck('tavily', 150, simulationOverrides.tavily);
    logger.log(7, 'Tavily health check completed', 'ai/health/route.ts', 'GET', tavilyHealth);

    logger.log(8, 'Checking Exa research service health', 'ai/health/route.ts', 'GET', {
      overrideRequested: Boolean(simulationOverrides.exa),
    });

    // Mock Exa health check
    const exaHealth = await simulateHealthCheck('exa', 120, simulationOverrides.exa);
    logger.log(9, 'Exa health check completed', 'ai/health/route.ts', 'GET', exaHealth);

    const services: Record<string, ServiceHealth> = {
      xai: xaiHealth,
      groq: groqHealth,
      tavily: tavilyHealth,
      exa: exaHealth,
    };

    // Determine overall health
    const allHealthy = Object.values(services).every((service) => service.status === 'healthy');

    logger.log(10, 'Overall health assessment completed', 'ai/health/route.ts', 'GET', {
      healthy: allHealthy,
      servicesCount: Object.keys(services).length
    });

    const processingTime = Date.now() - startTime;
    logger.log(11, 'AI health check completed successfully', 'ai/health/route.ts', 'GET', {
      healthy: allHealthy,
      processingTimeMs: processingTime
    });

    // Return health status per contract
    return NextResponse.json({
      healthy: allHealthy,
      services
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(12, 'Unexpected error in AI health check', 'ai/health/route.ts', 'GET', error instanceof Error ? error : String(error), {
      processingTimeMs: processingTime
    });

    return NextResponse.json(
      {
        healthy: false,
        services: {
          xai: { status: 'error', latency: 0 },
          groq: { status: 'error', latency: 0 },
          tavily: { status: 'error', latency: 0 },
          exa: { status: 'error', latency: 0 }
        },
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}

// Mock health check function
async function simulateHealthCheck(serviceName: string, baseLatency: number, override?: SimulationOverride): Promise<ServiceHealth> {
  if (override) {
    return {
      status: override.status,
      latency: Math.round(override.latency ?? baseLatency),
      overrideApplied: true,
      simulatedService: serviceName,
    };
  }

  const latency = baseLatency + Math.random() * 30;

  return {
    status: 'healthy',
    latency: Math.round(latency),
    overrideApplied: false,
    simulatedService: serviceName,
  };
}

async function checkXaiHealth(apiKey?: string): Promise<ServiceHealth> {
  if (!apiKey) {
    return {
      status: 'missing',
      latency: 0,
      message: 'XAI_API_KEY is not configured',
    };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.x.ai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      let errorText: string | undefined;
      try {
        errorText = await response.text();
      } catch {
        errorText = response.statusText;
      }

      const status = response.status === 401 || response.status === 403 ? 'unauthorized' : 'error';

      return {
        status,
        latency,
        message: errorText?.slice(0, 300) ?? 'Unexpected response from xAI',
        statusCode: response.status,
      };
    }

    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      // Ignore JSON parse issues for now
    }

    const models = Array.isArray(payload?.data) ? payload.data : [];
    const sampleModels = models
      .slice(0, 3)
      .map((model: any) => model?.id ?? model?.name)
      .filter((id: unknown): id is string => typeof id === 'string');

    const modelIds = models
      .map((model: any) => (typeof model === 'string' ? model : model?.id || model?.name))
      .filter((id: unknown): id is string => typeof id === 'string');

    const missingModels = REQUIRED_XAI_MODELS.filter((required) => !modelIds.includes(required));
    const requiredModelsAvailable = missingModels.length === 0;

    const prioritizedSamples = Array.from(
      new Set([
        ...REQUIRED_XAI_MODELS.filter((model) => modelIds.includes(model)),
        ...modelIds,
      ])
    ).slice(0, 5);

    return {
      status: requiredModelsAvailable ? 'healthy' : 'degraded',
      latency,
      modelsCount: modelIds.length,
      sampleModels: prioritizedSamples,
      requiredModelsAvailable,
      missingModels,
    };
  } catch (error) {
    const latency = Date.now() - start;

    return {
      status: 'error',
      latency,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}