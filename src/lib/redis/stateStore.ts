import { Redis } from '@upstash/redis';
import { logger } from '@/utils/console-logger';
import { getItineraryConfig } from '@/lib/config/itinerary-config';

interface ItineraryState {
  workflowId: string;
  sessionId: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  formData: Record<string, any>;
  itinerary?: any;
  research?: any;
  vector?: any;
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
   * Store itinerary state in Redis
   */
  async storeItineraryState(state: ItineraryState): Promise<boolean> {
    if (!this.initialized || !this.redis) {
      logger.warn(101, 'REDIS_NOT_INITIALIZED', 'stateStore.ts', 'storeItineraryState', 'Redis not available, skipping storage', {
        workflowId: state.workflowId,
      });
      return false;
    }

    const key = `itinerary:${state.workflowId}`;
    const startedAt = Date.now();

    try {
      await this.redis.set(key, JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString(),
      }));

      // Set TTL for completed/error states (7 days), processing states (1 day)
      const ttlSeconds = state.status === 'completed' || state.status === 'error' ? 604800 : 86400;
      await this.redis.expire(key, ttlSeconds);

      logger.log(102, 'ITINERARY_STATE_STORED', 'stateStore.ts', 'storeItineraryState', {
        workflowId: state.workflowId,
        status: state.status,
        durationMs: Date.now() - startedAt,
        ttlSeconds,
      });

      return true;
    } catch (error) {
      logger.error(103, 'ITINERARY_STATE_STORE_FAILED', 'stateStore.ts', 'storeItineraryState', error instanceof Error ? error : String(error), {
        workflowId: state.workflowId,
        status: state.status,
      });
      return false;
    }
  }

  /**
   * Retrieve itinerary state from Redis
   */
  async getItineraryState(workflowId: string): Promise<ItineraryState | null> {
    if (!this.initialized || !this.redis) {
      logger.warn(104, 'REDIS_NOT_INITIALIZED', 'stateStore.ts', 'getItineraryState', 'Redis not available, returning null', {
        workflowId,
      });
      return null;
    }

    const key = `itinerary:${workflowId}`;
    const startedAt = Date.now();

    try {
      const data = await this.redis.get<string>(key);

      if (!data) {
        logger.log(105, 'ITINERARY_STATE_NOT_FOUND', 'stateStore.ts', 'getItineraryState', {
          workflowId,
          durationMs: Date.now() - startedAt,
        });
        return null;
      }

      const state = JSON.parse(data) as ItineraryState;

      logger.log(106, 'ITINERARY_STATE_RETRIEVED', 'stateStore.ts', 'getItineraryState', {
        workflowId,
        status: state.status,
        durationMs: Date.now() - startedAt,
      });

      return state;
    } catch (error) {
      logger.error(107, 'ITINERARY_STATE_RETRIEVE_FAILED', 'stateStore.ts', 'getItineraryState', error instanceof Error ? error : String(error), {
        workflowId,
      });
      return null;
    }
  }

  /**
   * Update itinerary status
   */
  async updateItineraryStatus(workflowId: string, status: ItineraryState['status'], error?: string): Promise<boolean> {
    const existingState = await this.getItineraryState(workflowId);
    if (!existingState) {
      logger.warn(108, 'ITINERARY_STATE_UPDATE_FAILED_NO_EXISTING', 'stateStore.ts', 'updateItineraryStatus', 'No existing state found', {
        workflowId,
        newStatus: status,
      });
      return false;
    }

    const updatedState: ItineraryState = {
      ...existingState,
      status,
      ...(error && { error }),
      updatedAt: new Date().toISOString(),
    };

    return this.storeItineraryState(updatedState);
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
