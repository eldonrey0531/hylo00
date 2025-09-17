/**
 * Enhanced Provider Status Service
 *
 * Comprehensive monitoring service for LLM provider status, metrics,
 * and availability tracking with detailed reporting capabilities.
 */

import {
  DetailedProviderStatus,
  ProviderMetrics,
  KeyStatus,
  RateLimitStatus,
  SimpleProviderStatus,
} from '../types/providers';

// =============================================================================
// Simple Provider Configuration for Status Checking
// =============================================================================

interface SimpleProviderConfig {
  readonly providerId: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly models: string[];
  readonly tier: 'complex' | 'balanced' | 'fast';
  readonly enabled: boolean;
}

// =============================================================================
// Provider Status Cache
// =============================================================================

interface CachedProviderStatus {
  status: DetailedProviderStatus;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ProviderStatusCache {
  private readonly cache = new Map<string, CachedProviderStatus>();
  private readonly defaultTTL = 30000; // 30 seconds

  set(providerId: string, status: DetailedProviderStatus, ttl?: number): void {
    this.cache.set(providerId, {
      status,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get(providerId: string): DetailedProviderStatus | null {
    const cached = this.cache.get(providerId);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(providerId);
      return null;
    }

    return cached.status;
  }

  clear(): void {
    this.cache.clear();
  }

  getAll(): Map<string, DetailedProviderStatus> {
    const result = new Map<string, DetailedProviderStatus>();
    const now = Date.now();

    for (const [providerId, cached] of this.cache) {
      if (now - cached.timestamp <= cached.ttl) {
        result.set(providerId, cached.status);
      } else {
        this.cache.delete(providerId);
      }
    }

    return result;
  }
}

// =============================================================================
// Provider Status Checker
// =============================================================================

interface ProviderHealthChecker {
  checkAvailability(config: SimpleProviderConfig): Promise<boolean>;
  checkAPIKey(config: SimpleProviderConfig): Promise<KeyStatus[]>;
  getRateLimitStatus(config: SimpleProviderConfig): Promise<RateLimitStatus>;
  getMetrics(config: SimpleProviderConfig): Promise<ProviderMetrics>;
}

class DefaultProviderHealthChecker implements ProviderHealthChecker {
  async checkAvailability(config: SimpleProviderConfig): Promise<boolean> {
    try {
      // Basic health check - try to make a lightweight request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(config.baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Hylo-Health-Check/1.0',
        },
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 Method Not Allowed is OK for HEAD
    } catch (error) {
      console.warn(`Provider ${config.providerId} availability check failed:`, error);
      return false;
    }
  }

  async checkAPIKey(config: SimpleProviderConfig): Promise<KeyStatus[]> {
    if (!config.apiKey) {
      return [
        {
          keyId: 'primary',
          type: 'primary',
          isActive: false,
          quotaUsed: 0,
          quotaLimit: 0,
          quotaResetTime: Date.now(),
          lastUsed: 0,
          errorCount: 0,
          successRate: 0,
          avgLatency: 0,
        },
      ];
    }

    // For demo purposes, return mock key status
    return [
      {
        keyId: 'primary',
        type: 'primary',
        isActive: true,
        quotaUsed: 100,
        quotaLimit: 1000,
        quotaResetTime: Date.now() + 3600000, // 1 hour from now
        lastUsed: Date.now() - 300000, // 5 minutes ago
        errorCount: 0,
        successRate: 0.95,
        avgLatency: 250,
      },
    ];
  }

  async getRateLimitStatus(config: SimpleProviderConfig): Promise<RateLimitStatus> {
    // For demo purposes, return mock rate limit data
    return {
      requestsPerMinute: 60,
      currentRpm: 15,
      tokensPerMinute: 100000,
      currentTpm: 25000,
    };
  }

  async getMetrics(config: SimpleProviderConfig): Promise<ProviderMetrics> {
    // For demo purposes, return mock metrics
    return {
      totalRequests: 142,
      successfulRequests: 135,
      failedRequests: 7,
      avgLatency: 250,
      totalCost: 2.45,
      tokensUsed: 12500,
    };
  }
}

// =============================================================================
// Enhanced Provider Status Service
// =============================================================================

export class EnhancedProviderStatusService {
  private readonly cache: ProviderStatusCache;
  private readonly healthChecker: ProviderHealthChecker;
  private readonly providers: Map<string, SimpleProviderConfig>;

  constructor(healthChecker?: ProviderHealthChecker) {
    this.cache = new ProviderStatusCache();
    this.healthChecker = healthChecker || new DefaultProviderHealthChecker();
    this.providers = new Map();

    // Initialize default providers
    this.initializeProviders();
  }

  /**
   * Get detailed status for a specific provider
   */
  async getProviderStatus(providerId: string): Promise<DetailedProviderStatus | null> {
    // Check cache first
    const cached = this.cache.get(providerId);
    if (cached) {
      return cached;
    }

    const config = this.providers.get(providerId);
    if (!config) {
      return null;
    }

    // Perform fresh status check
    const status = await this.checkProviderStatus(config);

    // Cache the result
    this.cache.set(providerId, status);

    return status;
  }

  /**
   * Get status for all providers
   */
  async getAllProviderStatus(): Promise<Map<string, DetailedProviderStatus>> {
    const result = new Map<string, DetailedProviderStatus>();

    // Get cached results first
    const cached = this.cache.getAll();

    // Check which providers need fresh status
    const providersToCheck: string[] = [];
    for (const providerId of this.providers.keys()) {
      if (cached.has(providerId)) {
        result.set(providerId, cached.get(providerId)!);
      } else {
        providersToCheck.push(providerId);
      }
    }

    // Fetch fresh status for uncached providers
    if (providersToCheck.length > 0) {
      const freshStatuses = await Promise.allSettled(
        providersToCheck.map(async (providerId) => {
          const config = this.providers.get(providerId)!;
          const status = await this.checkProviderStatus(config);
          this.cache.set(providerId, status);
          return { providerId, status };
        })
      );

      for (const settledResult of freshStatuses) {
        if (settledResult.status === 'fulfilled') {
          const { providerId, status } = settledResult.value;
          result.set(providerId, status);
        }
      }
    }

    return result;
  }

  /**
   * Get simple status summary (for compatibility)
   */
  async getSimpleStatus(): Promise<Record<string, SimpleProviderStatus>> {
    const detailed = await this.getAllProviderStatus();
    const simple: Record<string, SimpleProviderStatus> = {};

    for (const [providerId, status] of detailed) {
      // Map detailed status to simple status
      if (!status.isEnabled) {
        simple[providerId] = 'maintenance';
      } else if (!status.isAvailable) {
        simple[providerId] = 'unavailable';
      } else if (!status.hasCapacity) {
        simple[providerId] = 'degraded';
      } else {
        simple[providerId] = 'available';
      }
    }

    return simple;
  }

  /**
   * Force refresh of provider status (bypass cache)
   */
  async refreshProviderStatus(providerId?: string): Promise<void> {
    if (providerId) {
      // Refresh specific provider
      const config = this.providers.get(providerId);
      if (config) {
        const status = await this.checkProviderStatus(config);
        this.cache.set(providerId, status, 0); // Set TTL to 0 to force immediate refresh next time
      }
    } else {
      // Refresh all providers
      this.cache.clear();
      await this.getAllProviderStatus();
    }
  }

  /**
   * Add or update provider configuration
   */
  addProvider(config: SimpleProviderConfig): void {
    this.providers.set(config.providerId, config);
  }

  /**
   * Remove provider
   */
  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.cache.clear(); // Clear cache to ensure consistency
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerId: string): SimpleProviderConfig | undefined {
    return this.providers.get(providerId);
  }

  /**
   * List all configured providers
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Perform comprehensive status check for a provider
   */
  private async checkProviderStatus(config: SimpleProviderConfig): Promise<DetailedProviderStatus> {
    try {
      // Run all checks in parallel
      const [isAvailable, keyStatusList, rateLimitStatus, metrics] = await Promise.allSettled([
        this.healthChecker.checkAvailability(config),
        this.healthChecker.checkAPIKey(config),
        this.healthChecker.getRateLimitStatus(config),
        this.healthChecker.getMetrics(config),
      ]);

      const available = isAvailable.status === 'fulfilled' ? isAvailable.value : false;
      const keys = keyStatusList.status === 'fulfilled' ? keyStatusList.value : [];
      const rateLimit =
        rateLimitStatus.status === 'fulfilled'
          ? rateLimitStatus.value
          : {
              requestsPerMinute: 0,
              currentRpm: 0,
              tokensPerMinute: 0,
              currentTpm: 0,
            };
      const providerMetrics =
        metrics.status === 'fulfilled'
          ? metrics.value
          : {
              totalRequests: 0,
              successfulRequests: 0,
              failedRequests: 0,
              avgLatency: 0,
              totalCost: 0,
              tokensUsed: 0,
            };

      // Get primary key status
      const primaryKey = keys.find((k) => k.type === 'primary');
      const hasValidKey = primaryKey?.isActive ?? false;
      const hasCapacity = rateLimit.currentRpm < rateLimit.requestsPerMinute;

      return {
        provider: config.providerId as 'cerebras' | 'gemini' | 'groq',
        isEnabled: config.enabled,
        isHealthy: available && hasValidKey,
        isAvailable: available,
        hasCapacity,
        keys,
        activeKeyId: primaryKey?.keyId ?? 'none',
        metrics: providerMetrics,
        rateLimits: rateLimit,
        lastHealthCheck: Date.now(),
        nextQuotaReset: primaryKey?.quotaResetTime ?? Date.now(),
      };
    } catch (error) {
      console.warn(`Provider ${config.providerId} status check failed:`, error);
      return {
        provider: config.providerId as 'cerebras' | 'gemini' | 'groq',
        isEnabled: config.enabled,
        isHealthy: false,
        isAvailable: false,
        hasCapacity: false,
        keys: [],
        activeKeyId: 'none',
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          avgLatency: 0,
          totalCost: 0,
          tokensUsed: 0,
        },
        rateLimits: {
          requestsPerMinute: 0,
          currentRpm: 0,
          tokensPerMinute: 0,
          currentTpm: 0,
        },
        lastHealthCheck: Date.now(),
        nextQuotaReset: Date.now(),
      };
    }
  }

  /**
   * Initialize default provider configurations
   */
  private initializeProviders(): void {
    const defaultProviders: SimpleProviderConfig[] = [
      {
        providerId: 'cerebras',
        name: 'Cerebras',
        baseUrl: 'https://api.cerebras.ai',
        apiKey: '',
        models: ['llama3.1-8b', 'llama3.1-70b'],
        tier: 'complex',
        enabled: true,
      },
      {
        providerId: 'gemini',
        name: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com',
        apiKey: '',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        tier: 'balanced',
        enabled: true,
      },
      {
        providerId: 'groq',
        name: 'Groq',
        baseUrl: 'https://api.groq.com',
        apiKey: '',
        models: ['llama3-8b-8192', 'llama3-70b-8192'],
        tier: 'fast',
        enabled: true,
      },
    ];

    for (const config of defaultProviders) {
      this.providers.set(config.providerId, config);
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const enhancedProviderStatusService = new EnhancedProviderStatusService();
