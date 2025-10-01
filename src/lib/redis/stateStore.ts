import { Redis } from '@upstash/redis';
import { logger } from '@/utils/console-logger';
import { getItineraryConfig } from '@/lib/config/itinerary-config';
import type { ItineraryLayout } from '@/types/itinerary/layout';
import * as fs from 'fs';
import * as path from 'path';

interface ItineraryState {
  workflowId: string;
  sessionId: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  formData: Record<string, any>;
  itinerary?: any;
  research?: any;
  vector?: any;
  rawItinerary?: string;
  layout?: {
    model: string;
    usedGroq: boolean;
    content: ItineraryLayout;
    rawText?: string;
  };
  createdAt: string;
  updatedAt: string;
  error?: string;
}

interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
  createdAt: string;
}

class StateStore {
  private redis: Redis | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const config = getItineraryConfig();
      if (!config.redis.restUrl || !config.redis.restToken) {
        logger.warn(0, 'REDIS_CONFIG_MISSING', 'stateStore.ts', 'initialize', 'Redis configuration incomplete, using mock mode', {
          hasRestUrl: !!config.redis.restUrl,
          hasRestToken: !!config.redis.restToken,
        });
        return;
      }

      this.redis = new Redis({
        url: config.redis.restUrl,
        token: config.redis.restToken,
      });

      this.initialized = true;
      logger.log(0, 'REDIS_CLIENT_INITIALIZED', 'stateStore.ts', 'initialize', {
        restUrlConfigured: !!config.redis.restUrl,
      });
    } catch (error) {
      logger.error(0, 'REDIS_INITIALIZATION_FAILED', 'stateStore.ts', 'initialize', error instanceof Error ? error : String(error));
    }
  }

  /**
   * Store itinerary state in Redis or fallback to file storage
   */
  async storeItineraryState(state: ItineraryState): Promise<boolean> {
    const key = `itinerary:${state.workflowId}`;
    const startedAt = Date.now();

    console.log('💾 [STORE] Storing itinerary state:', {
      workflowId: state.workflowId,
      status: state.status,
      hasItinerary: !!state.itinerary,
      hasLayout: !!state.layout,
      hasLayoutContent: !!state.layout?.content,
      itineraryType: typeof state.itinerary,
      layoutContentType: state.layout?.content ? typeof state.layout.content : 'undefined',
      dailyCount: state.layout?.content?.daily?.length,
      introLength: state.layout?.content?.intro?.body?.length,
    });

    try {
      const storedState: ItineraryState = {
        ...state,
        createdAt: state.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try Redis first if available
      if (this.initialized && this.redis) {
        await this.redis.set<ItineraryState>(key, storedState);

        // Set TTL for completed/error states (7 days), processing states (1 day)
        const ttlSeconds = state.status === 'completed' || state.status === 'error' ? 604800 : 86400;
        await this.redis.expire(key, ttlSeconds);

        logger.log(102, 'ITINERARY_STATE_STORED', 'stateStore.ts', 'storeItineraryState', {
          workflowId: state.workflowId,
          status: state.status,
          durationMs: Date.now() - startedAt,
          ttlSeconds,
          storage: 'redis',
        });

        return true;
      } else if (process.env.NODE_ENV !== 'production') {
        // Only use file storage fallback in development
        const stateDir = path.join(process.cwd(), 'state');
          
        try {
          if (!fs.existsSync(stateDir)) {
            fs.mkdirSync(stateDir, { recursive: true });
          }
          const filePath = path.join(stateDir, `${state.workflowId}.json`);
          fs.writeFileSync(filePath, JSON.stringify(storedState, null, 2));

          logger.log(102, 'ITINERARY_STATE_STORED', 'stateStore.ts', 'storeItineraryState', {
            workflowId: state.workflowId,
            status: state.status,
            durationMs: Date.now() - startedAt,
            storage: 'file',
            filePath,
          });

          return true;
        } catch (fileError) {
          logger.warn(102, 'ITINERARY_STATE_FILE_SAVE_FAILED', 'stateStore.ts', 'storeItineraryState', 'Failed to save state to file, continuing without file backup', {
            workflowId: state.workflowId,
            error: fileError instanceof Error ? fileError.message : String(fileError),
          });
          // Return true anyway since Redis storage might have succeeded
          return true;
        }
      } else {
        // Production mode - only use Redis, no file fallback
        logger.log(102, 'ITINERARY_STATE_STORED_REDIS_ONLY', 'stateStore.ts', 'storeItineraryState', {
          workflowId: state.workflowId,
          status: state.status,
          durationMs: Date.now() - startedAt,
          storage: 'redis-only',
        });
        return true;
      }
    } catch (error) {
      logger.error(103, 'ITINERARY_STATE_STORE_FAILED', 'stateStore.ts', 'storeItineraryState', error instanceof Error ? error : String(error), {
        workflowId: state.workflowId,
        status: state.status,
      });
      return false;
    }
  }

  /**
   * Retrieve itinerary state from Redis or fallback to file storage
   */
  async getItineraryState(workflowId: string): Promise<ItineraryState | null> {
    const key = `itinerary:${workflowId}`;
    const startedAt = Date.now();

    try {
      // Try Redis first if available
      if (this.initialized && this.redis) {
        const data = await this.redis.get<ItineraryState | string | null>(key);

        if (!data) {
          logger.log(105, 'ITINERARY_STATE_NOT_FOUND', 'stateStore.ts', 'getItineraryState', {
            workflowId,
            durationMs: Date.now() - startedAt,
            storage: 'redis',
          });
          return null;
        }

        const state = typeof data === 'string' ? (JSON.parse(data) as ItineraryState) : (data as ItineraryState);

        console.log('📥 [RETRIEVE] Retrieved itinerary state:', {
          workflowId,
          status: state.status,
          hasItinerary: !!state.itinerary,
          hasLayout: !!state.layout,
          hasLayoutContent: !!state.layout?.content,
          itineraryType: typeof state.itinerary,
          layoutContentType: state.layout?.content ? typeof state.layout.content : 'undefined',
          dailyCount: state.layout?.content?.daily?.length,
          introLength: state.layout?.content?.intro?.body?.length,
          rawDataKeys: Object.keys(state),
          layoutKeys: state.layout ? Object.keys(state.layout) : [],
          storage: 'redis',
        });

        logger.log(106, 'ITINERARY_STATE_RETRIEVED', 'stateStore.ts', 'getItineraryState', {
          workflowId,
          status: state.status,
          durationMs: Date.now() - startedAt,
          storage: 'redis',
        });

        return state;
      } else if (process.env.NODE_ENV !== 'production') {
        // Only use file storage fallback in development
        const stateDir = path.join(process.cwd(), 'state');
        const filePath = path.join(stateDir, `${workflowId}.json`);

        if (!fs.existsSync(filePath)) {
          logger.log(105, 'ITINERARY_STATE_NOT_FOUND', 'stateStore.ts', 'getItineraryState', {
            workflowId,
            durationMs: Date.now() - startedAt,
            storage: 'file',
            filePath,
          });
          return null;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const state = JSON.parse(fileContent) as ItineraryState;

        console.log('📥 [RETRIEVE] Retrieved itinerary state:', {
          workflowId,
          status: state.status,
          hasItinerary: !!state.itinerary,
          hasLayout: !!state.layout,
          hasLayoutContent: !!state.layout?.content,
          itineraryType: typeof state.itinerary,
          layoutContentType: state.layout?.content ? typeof state.layout.content : 'undefined',
          dailyCount: state.layout?.content?.daily?.length,
          introLength: state.layout?.content?.intro?.body?.length,
          rawDataKeys: Object.keys(state),
          layoutKeys: state.layout ? Object.keys(state.layout) : [],
          storage: 'file',
          filePath,
        });

        logger.log(106, 'ITINERARY_STATE_RETRIEVED', 'stateStore.ts', 'getItineraryState', {
          workflowId,
          status: state.status,
          durationMs: Date.now() - startedAt,
          storage: 'file',
          filePath,
        });

        return state;
      } else {
        // Production mode - only use Redis, no file fallback
        logger.log(105, 'ITINERARY_STATE_NOT_FOUND_REDIS_ONLY', 'stateStore.ts', 'getItineraryState', {
          workflowId,
          durationMs: Date.now() - startedAt,
          storage: 'redis-only',
        });
        return null;
      }
    } catch (error) {
      logger.error(107, 'ITINERARY_STATE_RETRIEVE_FAILED', 'stateStore.ts', 'getItineraryState', error instanceof Error ? error : String(error), {
        workflowId,
      });
      return null;
    }
  }

  /**
   * Clear itinerary state from Redis or file storage
   */
  async clearItineraryState(workflowId: string): Promise<boolean> {
    const key = `itinerary:${workflowId}`;
    let cleared = false;

    try {
      // Clear from Redis if available
      if (this.initialized && this.redis) {
        const existed = await this.redis.exists(key);
        if (existed) {
          await this.redis.del(key);
          logger.log(109, 'ITINERARY_STATE_CLEARED_FROM_REDIS', 'stateStore.ts', 'clearItineraryState', {
            workflowId,
          });
          cleared = true;
        }
      }

      // Clear from file storage
      const stateDir = path.join(process.cwd(), 'state');
      const filePath = path.join(stateDir, `${workflowId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.log(109, 'ITINERARY_STATE_CLEARED_FROM_FILE', 'stateStore.ts', 'clearItineraryState', {
          workflowId,
          filePath,
        });
        cleared = true;
      }

      return cleared;
    } catch (error) {
      logger.error(110, 'ITINERARY_STATE_CLEAR_FAILED', 'stateStore.ts', 'clearItineraryState', error instanceof Error ? error : String(error), {
        workflowId,
      });
      return false;
    }
  }

  /**
   * Update itinerary status
   */
  async updateItineraryStatus(workflowId: string, status: ItineraryState['status'], error?: string): Promise<boolean> {
    const existingState = await this.getItineraryState(workflowId);
    if (!existingState) {
      logger.warn(109, 'ITINERARY_STATE_UPDATE_FAILED_NO_EXISTING', 'stateStore.ts', 'updateItineraryStatus', 'No existing state found', {
        workflowId,
        newStatus: status,
      });
      return false;
    }

    logger.log(111, 'ITINERARY_STATUS_UPDATE_ATTEMPT', 'stateStore.ts', 'updateItineraryStatus', {
      workflowId,
      currentStatus: existingState.status,
      newStatus: status,
    });

    const updatedState: ItineraryState = {
      ...existingState,
      status,
      ...(error && { error }),
      updatedAt: new Date().toISOString(),
    };

    const result = await this.storeItineraryState(updatedState);
    logger.log(112, 'ITINERARY_STATUS_UPDATE_RESULT', 'stateStore.ts', 'updateItineraryStatus', {
      workflowId,
      success: result,
      finalStatus: status,
    });
    return result;
  }

  /**
   * Cache data with TTL
   */
  async setCache<T>(key: string, data: T, ttlMinutes: number = 60): Promise<boolean> {
    if (!this.initialized || !this.redis) {
      logger.warn(109, 'REDIS_NOT_INITIALIZED', 'stateStore.ts', 'setCache', 'Redis not available, skipping cache', {
        key,
        ttlMinutes,
      });
      return false;
    }

    const cacheKey = `cache:${key}`;
    const startedAt = Date.now();

    try {
      const entry: CacheEntry<T> = {
        data,
        expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
        createdAt: new Date().toISOString(),
      };

      await this.redis.set(cacheKey, JSON.stringify(entry));
      await this.redis.expire(cacheKey, ttlMinutes * 60);

      logger.log(110, 'CACHE_ENTRY_STORED', 'stateStore.ts', 'setCache', {
        key,
        ttlMinutes,
        durationMs: Date.now() - startedAt,
      });

      return true;
    } catch (error) {
      logger.error(111, 'CACHE_STORE_FAILED', 'stateStore.ts', 'setCache', error instanceof Error ? error : String(error), {
        key,
        ttlMinutes,
      });
      return false;
    }
  }

  /**
   * Get cached data
   */
  async getCache<T>(key: string): Promise<T | null> {
    if (!this.initialized || !this.redis) {
      logger.warn(112, 'REDIS_NOT_INITIALIZED', 'stateStore.ts', 'getCache', 'Redis not available, returning null', {
        key,
      });
      return null;
    }

    const cacheKey = `cache:${key}`;
    const startedAt = Date.now();

    try {
      const data = await this.redis.get<string>(cacheKey);

      if (!data) {
        logger.log(113, 'CACHE_MISS', 'stateStore.ts', 'getCache', {
          key,
          durationMs: Date.now() - startedAt,
        });
        return null;
      }

      const entry = JSON.parse(data) as CacheEntry<T>;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        logger.log(114, 'CACHE_EXPIRED', 'stateStore.ts', 'getCache', {
          key,
          durationMs: Date.now() - startedAt,
        });
        await this.redis.del(cacheKey);
        return null;
      }

      logger.log(115, 'CACHE_HIT', 'stateStore.ts', 'getCache', {
        key,
        durationMs: Date.now() - startedAt,
      });

      return entry.data;
    } catch (error) {
      logger.error(116, 'CACHE_RETRIEVE_FAILED', 'stateStore.ts', 'getCache', error instanceof Error ? error : String(error), {
        key,
      });
      return null;
    }
  }

  /**
   * Delete cached data
   */
  async deleteCache(key: string): Promise<boolean> {
    if (!this.initialized || !this.redis) {
      logger.warn(117, 'REDIS_NOT_INITIALIZED', 'stateStore.ts', 'deleteCache', 'Redis not available, skipping delete', {
        key,
      });
      return false;
    }

    const cacheKey = `cache:${key}`;
    const startedAt = Date.now();

    try {
      await this.redis.del(cacheKey);

      logger.log(118, 'CACHE_DELETED', 'stateStore.ts', 'deleteCache', {
        key,
        durationMs: Date.now() - startedAt,
      });

      return true;
    } catch (error) {
      logger.error(119, 'CACHE_DELETE_FAILED', 'stateStore.ts', 'deleteCache', error instanceof Error ? error : String(error), {
        key,
      });
      return false;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.initialized || !this.redis) {
      return {
        healthy: false,
        message: 'Redis client not initialized',
      };
    }

    try {
      const ping = await this.redis.ping();
      return {
        healthy: ping === 'PONG',
        message: ping === 'PONG' ? 'Redis connection healthy' : 'Redis ping failed',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Redis health check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// Export singleton instance
export const stateStore = new StateStore();

// Export types
export type { ItineraryState, CacheEntry };
