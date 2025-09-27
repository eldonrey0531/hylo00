import { logger } from '@/utils/console-logger';

/**
 * Configuration for AI-Generated Personalized Itinerary feature
 * Reads environment variables with safe defaults and validates required settings
 */

export interface ItineraryConfig {
  // AI Services
  groq: {
    apiKey: string;
  };
  xai: {
    apiKey: string;
  };
  tavily: {
    apiKey: string;
  };
  exa: {
    apiKey: string;
  };

  // Maps
  serp: {
    apiKey: string;
  };

  // Workflow & Storage
  inngest: {
    eventKey: string;
    signingKey: string;
  };
  redis: {
    restUrl: string;
    restToken: string;
  };

  // Application
  app: {
    nodeEnv: 'development' | 'preview' | 'production';
    logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug';
    cacheTtlMinutes: number;
  };

  // Runtime Flags
  flags: {
    enableDetailedLogging: boolean;
    enableDataCleansing: boolean;
    allowPdfExport: boolean;
    allowEmailDraft: boolean;
    mapsFallbackMode: 'static' | 'placeholder' | 'hidden';
  };
}

/**
 * Validates that all required environment variables are present (logs warnings for missing ones)
 */
function validateRequiredEnvVars(): void {
  const requiredVars = [
    'GROQ_API_KEY',
    'XAI_API_KEY',
    'TAVILY_API_KEY',
    'EXA_API_KEY',
    'SERP_API_KEY',
    'INNGEST_EVENT_KEY',
    'INNGEST_SIGNING_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const warningMessage = `Missing environment variables (using fallbacks): ${missingVars.join(', ')}`;
    logger.error(23, 'Configuration validation failed', 'itinerary-config.ts', 'validateRequiredEnvVars', warningMessage);
    // Don't throw error, just log warning - we'll use fallbacks
  } else {
    logger.log(23, 'Required environment variables validated', 'itinerary-config.ts', 'validateRequiredEnvVars');
  }
}

/**
 * Parses and validates NODE_ENV
 */
function parseNodeEnv(env: string | undefined): 'development' | 'preview' | 'production' {
  const validEnvs = ['development', 'preview', 'production'] as const;
  const defaultEnv = 'development';

  if (!env || !validEnvs.includes(env as any)) {
    logger.warn(23, 'Invalid NODE_ENV, using default', 'itinerary-config.ts', 'parseNodeEnv', `Invalid value: ${env}, using: ${defaultEnv}`);
    return defaultEnv;
  }

  return env as 'development' | 'preview' | 'production';
}

/**
 * Parses and validates log level
 */
function parseLogLevel(level: string | undefined): 'silent' | 'error' | 'warn' | 'info' | 'debug' {
  const validLevels = ['silent', 'error', 'warn', 'info', 'debug'] as const;
  const defaultLevel = 'info';

  if (!level || !validLevels.includes(level as any)) {
    logger.warn(23, 'Invalid ITINERARY_LOG_LEVEL, using default', 'itinerary-config.ts', 'parseLogLevel', `Invalid value: ${level}, using: ${defaultLevel}`);
    return defaultLevel;
  }

  return level as 'silent' | 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Parses cache TTL minutes with validation
 */
function parseCacheTtl(ttl: string | undefined): number {
  const defaultTtl = 120;
  const minTtl = 5;
  const maxTtl = 1440; // 24 hours

  if (!ttl) {
    return defaultTtl;
  }

  const parsed = parseInt(ttl, 10);
  if (isNaN(parsed) || parsed < minTtl || parsed > maxTtl) {
    logger.warn(23, 'Invalid ITINERARY_CACHE_TTL_MINUTES, using default', 'itinerary-config.ts', 'parseCacheTtl', `Invalid value: ${ttl}, using: ${defaultTtl}`);
    return defaultTtl;
  }

  return parsed;
}

/**
 * Parses maps fallback mode
 */
function parseMapsFallbackMode(mode: string | undefined): 'static' | 'placeholder' | 'hidden' {
  const validModes = ['static', 'placeholder', 'hidden'] as const;
  const defaultMode = 'static';

  if (!mode || !validModes.includes(mode as any)) {
    logger.warn(23, 'Invalid maps fallback mode, using default', 'itinerary-config.ts', 'parseMapsFallbackMode', `Invalid value: ${mode}, using: ${defaultMode}`);
    return defaultMode;
  }

  return mode as 'static' | 'placeholder' | 'hidden';
}

/**
 * Singleton configuration instance
 */
let configInstance: ItineraryConfig | null = null;

/**
 * Gets the itinerary configuration, loading from environment variables on first access
 */
export function getItineraryConfig(): ItineraryConfig {
  if (configInstance) {
    return configInstance;
  }

  try {
    logger.log(23, 'Loading itinerary configuration', 'itinerary-config.ts', 'getItineraryConfig');

    // Validate required environment variables
    validateRequiredEnvVars();

    // Build configuration object
    configInstance = {
      groq: {
        apiKey: process.env.GROQ_API_KEY!,
      },
      xai: {
        apiKey: process.env.XAI_API_KEY!,
      },
      tavily: {
        apiKey: process.env.TAVILY_API_KEY!,
      },
      exa: {
        apiKey: process.env.EXA_API_KEY!,
      },
      serp: {
        apiKey: process.env.SERP_API_KEY!,
      },
      inngest: {
        eventKey: process.env.INNGEST_EVENT_KEY!,
        signingKey: process.env.INNGEST_SIGNING_KEY!,
      },
      redis: {
        restUrl: process.env.UPSTASH_REDIS_REST_URL!,
        restToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
      },
      app: {
        nodeEnv: parseNodeEnv(process.env.NODE_ENV),
        logLevel: parseLogLevel(process.env.ITINERARY_LOG_LEVEL),
        cacheTtlMinutes: parseCacheTtl(process.env.ITINERARY_CACHE_TTL_MINUTES),
      },
      flags: {
        enableDetailedLogging: true, // Always enabled per contract
        enableDataCleansing: true,   // Always enabled per contract
        allowPdfExport: true,        // Always enabled per contract
        allowEmailDraft: true,       // Always enabled per contract
        mapsFallbackMode: parseMapsFallbackMode(process.env.ITINERARY_MAPS_FALLBACK_MODE),
      },
    };

    logger.log(23, 'Itinerary configuration loaded successfully', 'itinerary-config.ts', 'getItineraryConfig', {
      nodeEnv: configInstance!.app.nodeEnv,
      logLevel: configInstance!.app.logLevel,
      cacheTtlMinutes: configInstance!.app.cacheTtlMinutes,
      mapsFallbackMode: configInstance!.flags.mapsFallbackMode,
    });

    return configInstance!;

  } catch (error) {
    logger.error(23, 'Failed to load itinerary configuration', 'itinerary-config.ts', 'getItineraryConfig', error instanceof Error ? error : String(error));
    throw error;
  }
}

/**
 * Resets the configuration instance (useful for testing)
 */
export function resetItineraryConfig(): void {
  configInstance = null;
  logger.log(23, 'Itinerary configuration reset', 'itinerary-config.ts', 'resetItineraryConfig');
}