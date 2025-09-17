/**
 * Session Management Service for RAG Multi-Agent System
 * Handles user sessions with Supabase persistence and Upstash Redis caching
 * Constitutional compliance: Edge-compatible, observable, type-safe
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import {
  SessionData,
  SessionDataSchema,
  FormId,
  TravelFormData,
  SessionStatusResponse,
} from '../types/rag.js';

// =============================================================================
// SESSION SERVICE CONFIGURATION
// =============================================================================

interface SessionConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  upstashUrl: string;
  upstashToken: string;
  defaultTtlHours: number;
  maxSessionsPerUser: number;
  cacheExpirySeconds: number;
}

interface SessionOperationResult {
  success: boolean;
  operation: 'create' | 'update' | 'get' | 'extend' | 'flush' | 'cleanup';
  sessionId?: string;
  error?: string;
  durationMs: number;
  cacheHit?: boolean;
}

// =============================================================================
// SESSION SERVICE CLASS
// =============================================================================

export class SessionService {
  private supabase: SupabaseClient;
  private redis: Redis;
  private config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;

    // T031: Supabase client configuration
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey, // Use service key for backend operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // T032: Upstash Redis client setup
    this.redis = new Redis({
      url: config.upstashUrl,
      token: config.upstashToken,
    });
  }

  /**
   * T033: createSession() method with UUID generation and TTL
   * Create a new session with unique ID and expiration
   */
  async createSession(userId?: string, customTtlHours?: number): Promise<SessionOperationResult> {
    const startTime = Date.now();

    try {
      const sessionId = crypto.randomUUID();
      const now = new Date();
      const ttlHours = customTtlHours || this.config.defaultTtlHours;
      const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

      const sessionData: SessionData = {
        session_id: sessionId,
        session_state: 'active',
        created_at: now.toISOString(),
        last_activity_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        raw_forms: {},
        flags: {
          vectorized: false,
          has_itinerary: false,
          budget_exceeded: false,
        },
        metadata: {
          form_count: 0,
        },
      };

      // Add user_id only if provided
      if (userId) {
        sessionData.user_id = userId;
      }

      // Validate session data
      const validationResult = SessionDataSchema.safeParse(sessionData);
      if (!validationResult.success) {
        throw new Error(`Invalid session data: ${validationResult.error.message}`);
      }

      // Store in Supabase
      const { error: dbError } = await this.supabase.from('sessions').insert(sessionData);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Cache in Redis with TTL
      const cacheKey = `session:${sessionId}`;
      await this.redis.setex(cacheKey, this.config.cacheExpirySeconds, JSON.stringify(sessionData));

      const result: SessionOperationResult = {
        success: true,
        operation: 'create',
        sessionId,
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_create', {
        success: true,
        session_id: sessionId,
        user_id: userId,
        ttl_hours: ttlHours,
        duration_ms: result.durationMs,
      });

      return result;
    } catch (error) {
      const result: SessionOperationResult = {
        success: false,
        operation: 'create',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_create', {
        success: false,
        user_id: userId,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * T034: updateSessionData() method for form data storage
   * Update session with new form data and extend activity timestamp
   */
  async updateSessionData(
    sessionId: string,
    formId: FormId,
    formData: TravelFormData
  ): Promise<SessionOperationResult> {
    const startTime = Date.now();

    try {
      // Get current session
      const getResult = await this.getSession(sessionId);
      if (!getResult.success || !getResult.sessionData) {
        throw new Error('Session not found or expired');
      }

      const currentSession = getResult.sessionData;

      // Check if session is still active
      if (currentSession.session_state !== 'active') {
        throw new Error(`Session is ${currentSession.session_state}`);
      }

      // Check if session has expired
      if (new Date() > new Date(currentSession.expires_at)) {
        await this.expireSession(sessionId);
        throw new Error('Session has expired');
      }

      // Update session data
      const updatedSession: SessionData = {
        ...currentSession,
        last_activity_at: new Date().toISOString(),
        raw_forms: {
          ...currentSession.raw_forms,
          [formId]: formData,
        },
        metadata: {
          ...currentSession.metadata,
          form_count: Object.keys({
            ...currentSession.raw_forms,
            [formId]: formData,
          }).length,
          last_form_id: formId,
        },
      };

      // Update in Supabase
      const { error: dbError } = await this.supabase
        .from('sessions')
        .update(updatedSession)
        .eq('session_id', sessionId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update cache
      const cacheKey = `session:${sessionId}`;
      await this.redis.setex(
        cacheKey,
        this.config.cacheExpirySeconds,
        JSON.stringify(updatedSession)
      );

      const result: SessionOperationResult = {
        success: true,
        operation: 'update',
        sessionId,
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_update', {
        success: true,
        session_id: sessionId,
        form_id: formId,
        form_count: updatedSession.metadata.form_count,
        duration_ms: result.durationMs,
      });

      return result;
    } catch (error) {
      const result: SessionOperationResult = {
        success: false,
        operation: 'update',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_update', {
        success: false,
        session_id: sessionId,
        form_id: formId,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * T035: getSession() method with cache-first lookup
   * Retrieve session data with Redis cache optimization
   */
  async getSession(
    sessionId: string
  ): Promise<SessionOperationResult & { sessionData?: SessionData }> {
    const startTime = Date.now();

    try {
      // Try cache first
      const cacheKey = `session:${sessionId}`;
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        try {
          const sessionData = JSON.parse(cachedData as string) as SessionData;

          const result = {
            success: true,
            operation: 'get' as const,
            sessionId,
            sessionData,
            durationMs: Date.now() - startTime,
            cacheHit: true,
          };

          await this.observeSessionOperation('session_get', {
            success: true,
            session_id: sessionId,
            cache_hit: true,
            duration_ms: result.durationMs,
          });

          return result;
        } catch (parseError) {
          // Invalid cache data, continue to database
          console.warn('Failed to parse cached session data:', parseError);
          await this.redis.del(cacheKey);
        }
      }

      // Fallback to database
      const { data, error: dbError } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          // Session not found
          const result = {
            success: false,
            operation: 'get' as const,
            sessionId,
            error: 'Session not found',
            durationMs: Date.now() - startTime,
            cacheHit: false,
          };

          await this.observeSessionOperation('session_get', {
            success: false,
            session_id: sessionId,
            cache_hit: false,
            error: 'Session not found',
            duration_ms: result.durationMs,
          });

          return result;
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      const sessionData = data as SessionData;

      // Update cache for future requests
      await this.redis.setex(cacheKey, this.config.cacheExpirySeconds, JSON.stringify(sessionData));

      const result = {
        success: true,
        operation: 'get' as const,
        sessionId,
        sessionData,
        durationMs: Date.now() - startTime,
        cacheHit: false,
      };

      await this.observeSessionOperation('session_get', {
        success: true,
        session_id: sessionId,
        cache_hit: false,
        duration_ms: result.durationMs,
      });

      return result;
    } catch (error) {
      const result = {
        success: false,
        operation: 'get' as const,
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        cacheHit: false,
      };

      await this.observeSessionOperation('session_get', {
        success: false,
        session_id: sessionId,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * T036: extendTTL() method for session lifetime management
   * Extend session expiration time
   */
  async extendTTL(sessionId: string, additionalHours: number): Promise<SessionOperationResult> {
    const startTime = Date.now();

    try {
      const getResult = await this.getSession(sessionId);
      if (!getResult.success || !getResult.sessionData) {
        throw new Error('Session not found');
      }

      const currentSession = getResult.sessionData;
      const currentExpiry = new Date(currentSession.expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);

      const updatedSession: SessionData = {
        ...currentSession,
        expires_at: newExpiry.toISOString(),
        last_activity_at: new Date().toISOString(),
      };

      // Update in database
      const { error: dbError } = await this.supabase
        .from('sessions')
        .update({
          expires_at: newExpiry.toISOString(),
          last_activity_at: updatedSession.last_activity_at,
        })
        .eq('session_id', sessionId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update cache
      const cacheKey = `session:${sessionId}`;
      await this.redis.setex(
        cacheKey,
        this.config.cacheExpirySeconds,
        JSON.stringify(updatedSession)
      );

      const result: SessionOperationResult = {
        success: true,
        operation: 'extend',
        sessionId,
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_extend_ttl', {
        success: true,
        session_id: sessionId,
        additional_hours: additionalHours,
        new_expiry: newExpiry.toISOString(),
        duration_ms: result.durationMs,
      });

      return result;
    } catch (error) {
      const result: SessionOperationResult = {
        success: false,
        operation: 'extend',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_extend_ttl', {
        success: false,
        session_id: sessionId,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * T037: flushSession() method for complete data cleanup
   * Remove session and all associated data
   */
  async flushSession(sessionId: string): Promise<SessionOperationResult> {
    const startTime = Date.now();

    try {
      // Get session first to log cleanup details
      const getResult = await this.getSession(sessionId);
      const formCount = getResult.sessionData?.metadata.form_count || 0;

      // Mark session as flushed in database
      const { error: dbError } = await this.supabase
        .from('sessions')
        .update({
          session_state: 'flushed',
          last_activity_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Remove from cache
      const cacheKey = `session:${sessionId}`;
      await this.redis.del(cacheKey);

      const result: SessionOperationResult = {
        success: true,
        operation: 'flush',
        sessionId,
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_flush', {
        success: true,
        session_id: sessionId,
        form_count: formCount,
        duration_ms: result.durationMs,
      });

      return result;
    } catch (error) {
      const result: SessionOperationResult = {
        success: false,
        operation: 'flush',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_flush', {
        success: false,
        session_id: sessionId,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * Extend session expiration time (alias for extendTTL)
   */
  async extendSession(sessionId: string, additionalHours: number): Promise<SessionOperationResult> {
    return this.extendTTL(sessionId, additionalHours);
  }

  /**
   * Get session status for API responses
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse | null> {
    const getResult = await this.getSession(sessionId);
    if (!getResult.success || !getResult.sessionData) {
      return null;
    }

    const session = getResult.sessionData;

    return {
      session_id: sessionId,
      session_state: session.session_state,
      form_count: session.metadata.form_count,
      vectorization_status: session.flags.vectorized ? 'completed' : 'pending',
      last_activity_at: session.last_activity_at,
      expires_at: session.expires_at,
      budget_status: {
        spent_usd: 0, // Will be populated by budget service
        limit_usd: 5.0, // Default limit
        remaining_usd: 5.0,
        is_over_budget: session.flags.budget_exceeded,
      },
    };
  }

  /**
   * Mark session as expired
   */
  private async expireSession(sessionId: string): Promise<void> {
    await this.supabase
      .from('sessions')
      .update({
        session_state: 'expired',
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    // Remove from cache
    const cacheKey = `session:${sessionId}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Cleanup expired sessions (batch operation)
   */
  async cleanupExpiredSessions(): Promise<SessionOperationResult> {
    const startTime = Date.now();

    try {
      const cutoffTime = new Date().toISOString();

      // Update expired sessions in database
      const { data, error: dbError } = await this.supabase
        .from('sessions')
        .update({ session_state: 'expired' })
        .lt('expires_at', cutoffTime)
        .eq('session_state', 'active')
        .select('session_id');

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Remove expired sessions from cache
      if (data && data.length > 0) {
        const cacheKeys = data.map((session) => `session:${session.session_id}`);
        await this.redis.del(...cacheKeys);
      }

      const result: SessionOperationResult = {
        success: true,
        operation: 'cleanup',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_cleanup', {
        success: true,
        expired_count: data?.length || 0,
        duration_ms: result.durationMs,
        cutoff_time: cutoffTime,
      });

      return result;
    } catch (error) {
      const result: SessionOperationResult = {
        success: false,
        operation: 'cleanup',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await this.observeSessionOperation('session_cleanup', {
        success: false,
        error: result.error,
        duration_ms: result.durationMs,
      });

      return result;
    }
  }

  /**
   * Simple observability for session operations
   */
  private async observeSessionOperation(
    operationName: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`[Session Operation] ${operationName}:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Session observability logging failed:', error);
    }
  }

  /**
   * Health check for session service
   */
  async healthCheck(): Promise<{ supabase: boolean; redis: boolean; overall: boolean }> {
    try {
      // Test Supabase connection
      const { error: dbError } = await this.supabase.from('sessions').select('session_id').limit(1);

      const supabaseHealthy = !dbError;

      // Test Redis connection
      const testKey = 'health_check';
      await this.redis.set(testKey, 'ok', { ex: 10 });
      const redisValue = await this.redis.get(testKey);
      const redisHealthy = redisValue === 'ok';

      return {
        supabase: supabaseHealthy,
        redis: redisHealthy,
        overall: supabaseHealthy && redisHealthy,
      };
    } catch (error) {
      console.warn('Health check failed:', error);
      return {
        supabase: false,
        redis: false,
        overall: false,
      };
    }
  }
}

// =============================================================================
// FACTORY FUNCTION FOR EDGE-COMPATIBLE INITIALIZATION
// =============================================================================

/**
 * Create SessionService instance with environment configuration
 * Edge-compatible factory function
 */
export function createSessionService(): SessionService {
  const config: SessionConfig = {
    supabaseUrl: process.env['SUPABASE_URL'] || '',
    supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
    supabaseServiceKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
    upstashUrl: process.env['UPSTASH_REDIS_REST_URL'] || '',
    upstashToken: process.env['UPSTASH_REDIS_REST_TOKEN'] || '',
    defaultTtlHours: parseInt(process.env['RAG_SESSION_TTL_HOURS'] || '24'),
    maxSessionsPerUser: 10, // Prevent abuse
    cacheExpirySeconds: 3600, // 1 hour cache TTL
  };

  // Validate required configuration
  if (
    !config.supabaseUrl ||
    !config.supabaseServiceKey ||
    !config.upstashUrl ||
    !config.upstashToken
  ) {
    throw new Error('Missing required session service configuration');
  }

  return new SessionService(config);
}
