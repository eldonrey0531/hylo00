import { Inngest } from 'inngest';
import { logger } from '@/utils/console-logger';
import { getItineraryConfig } from '@/lib/config/itinerary-config';

/**
 * Inngest client bootstrap for AI-Generated Personalized Itinerary workflows
 * Initializes the Inngest client with configuration derived from our feature config helper.
 */
let inngestInstance: Inngest | null = null;

export function getInngestClient(): Inngest {
  if (inngestInstance) {
    return inngestInstance;
  }

  try {
    const config = getItineraryConfig();

    inngestInstance = new Inngest({
      id: 'hylo00-itinerary',
      name: 'Hylo00 AI Itinerary Generator',
      eventKey: config.inngest.eventKey,
      signingKey: config.inngest.signingKey,
      baseUrl: config.app.nodeEnv === 'development' ? 'http://localhost:8288' : undefined,
      logger: {
        debug: (message: string, ...args: any[]) => {
          if (args.length > 0) {
            logger.log(0, `INNGEST_DEBUG: ${message}`, 'client.ts', 'debug', { args });
          } else {
            logger.log(0, `INNGEST_DEBUG: ${message}`, 'client.ts', 'debug');
          }
        },
        info: (message: string, ...args: any[]) => {
          if (args.length > 0) {
            logger.log(0, `INNGEST_INFO: ${message}`, 'client.ts', 'info', { args });
          } else {
            logger.log(0, `INNGEST_INFO: ${message}`, 'client.ts', 'info');
          }
        },
        warn: (message: string, ...args: any[]) => {
          if (args.length > 0) {
            logger.log(0, `INNGEST_WARN: ${message}`, 'client.ts', 'warn', { args });
          } else {
            logger.log(0, `INNGEST_WARN: ${message}`, 'client.ts', 'warn');
          }
        },
        error: (message: string, ...args: any[]) => {
          if (args.length > 0) {
            logger.log(0, `INNGEST_ERROR: ${message}`, 'client.ts', 'error', { args });
          } else {
            logger.log(0, `INNGEST_ERROR: ${message}`, 'client.ts', 'error');
          }
        },
      },
    });

    logger.log(0, 'INNGEST_CLIENT_INITIALIZED', 'client.ts', 'getInngestClient', {
      clientId: 'hylo00-itinerary',
      hasEventKey: Boolean(config.inngest.eventKey),
      hasSigningKey: Boolean(config.inngest.signingKey),
      isDevelopment: config.app.nodeEnv === 'development',
    });

    return inngestInstance;
  } catch (error) {
    logger.error(0, 'INNGEST_CLIENT_INITIALIZATION_FAILED', 'client.ts', 'getInngestClient', error instanceof Error ? error : String(error));
    throw error;
  }
}

export const inngest = getInngestClient();

export default inngest;
