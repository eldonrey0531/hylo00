/**
 * Circuit Breaker for LLM Provider Resilience
 *
 * Implements the circuit breaker pattern to prevent cascading failures
 * and provide fast failure detection for unhealthy providers.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Provider is failing, requests fail fast
 * - HALF_OPEN: Testing if provider has recovered
 */

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number; // Time before trying half-open state (ms)
  successThreshold: number; // Successes needed in half-open to close
  monitoringWindow: number; // Time window for failure counting (ms)
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  successRate: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private lastStateChange: number = Date.now();

  constructor(private readonly name: string, private readonly config: CircuitBreakerConfig) {}

  /**
   * Execute an operation through the circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.shouldFailFast()) {
      throw new CircuitBreakerError(
        `Circuit breaker ${this.name} is OPEN - failing fast`,
        this.name,
        this.state
      );
    }

    this.totalRequests++;

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if the circuit breaker should fail fast
   */
  private shouldFailFast(): boolean {
    const now = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED:
        return false;

      case CircuitState.OPEN:
        // Check if we should transition to half-open
        if (now - this.lastStateChange >= this.config.recoveryTimeout) {
          this.transitionTo(CircuitState.HALF_OPEN);
          return false;
        }
        return true;

      case CircuitState.HALF_OPEN:
        return false;

      default:
        return false;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();

    switch (this.state) {
      case CircuitState.HALF_OPEN:
        this.successCount++;
        if (this.successCount >= this.config.successThreshold) {
          this.transitionTo(CircuitState.CLOSED);
        }
        break;

      case CircuitState.CLOSED:
        // Reset failure count on success
        this.failureCount = 0;
        break;
    }

    this.logMetrics('SUCCESS');
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    switch (this.state) {
      case CircuitState.CLOSED:
        if (this.failureCount >= this.config.failureThreshold) {
          this.transitionTo(CircuitState.OPEN);
        }
        break;

      case CircuitState.HALF_OPEN:
        this.transitionTo(CircuitState.OPEN);
        break;
    }

    this.logMetrics('FAILURE');
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();

    // Reset counters on state transitions
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }

    console.log(`🔄 Circuit Breaker ${this.name}: ${oldState} → ${newState}`);
    this.logMetrics('STATE_CHANGE');
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    // Calculate success rate over monitoring window
    const recentRequests = this.totalRequests; // Simplified - in production, track time-windowed requests
    const successRate =
      recentRequests > 0 ? ((recentRequests - this.failureCount) / recentRequests) * 100 : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      successRate: Math.max(0, Math.min(100, successRate)),
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.lastStateChange = Date.now();

    console.log(`🔄 Circuit Breaker ${this.name}: Manually reset to CLOSED`);
    this.logMetrics('RESET');
  }

  /**
   * Force the circuit breaker to open (for testing or emergency)
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Log metrics for observability
   */
  private logMetrics(event: string): void {
    const metrics = this.getMetrics();

    console.log(`🔍 CIRCUIT_BREAKER_${event}:`, {
      name: this.name,
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  }
}

/**
 * Custom error class for circuit breaker failures
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly circuitName: string,
    public readonly circuitState: CircuitState
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different providers
 */
export class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for a provider
   */
  getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5, // Open after 5 failures
        recoveryTimeout: 30000, // Try recovery after 30 seconds
        successThreshold: 3, // Close after 3 successes
        monitoringWindow: 60000, // 1 minute monitoring window
      };

      const finalConfig = { ...defaultConfig, ...config };
      this.breakers.set(name, new CircuitBreaker(name, finalConfig));
    }

    return this.breakers.get(name)!;
  }

  /**
   * Get metrics for all circuit breakers
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};

    for (const [name, breaker] of this.breakers) {
      metrics[name] = breaker.getMetrics();
    }

    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus(): Record<string, boolean> {
    const health: Record<string, boolean> = {};

    for (const [name, breaker] of this.breakers) {
      const metrics = breaker.getMetrics();
      health[name] = metrics.state !== CircuitState.OPEN;
    }

    return health;
  }
}

// Global registry instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();
