/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by failing fast when a service is unavailable.
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold?: number;

  /** Time window for counting failures (ms) */
  failureWindow?: number;

  /** How long to wait before trying again (ms) */
  resetTimeout?: number;

  /** Number of successful calls to close circuit from half-open */
  successThreshold?: number;

  /** Called when circuit state changes */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;

  /** Called when circuit opens */
  onOpen?: (error: Error) => void;

  /** Called when circuit closes */
  onClose?: () => void;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number[] = []; // Timestamps of failures
  private lastFailureTime: number | null = null;
  private successfulCalls = 0;

  private failureThreshold: number;
  private failureWindow: number;
  private resetTimeout: number;
  private successThreshold: number;
  private onStateChange?: (from: CircuitState, to: CircuitState) => void;
  private onOpen?: (error: Error) => void;
  private onClose?: () => void;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.failureWindow = options.failureWindow ?? 60000; // 1 minute
    this.resetTimeout = options.resetTimeout ?? 30000; // 30 seconds
    this.successThreshold = options.successThreshold ?? 2;
    this.onStateChange = options.onStateChange;
    this.onOpen = options.onOpen;
    this.onClose = options.onClose;
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should try to recover
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Service unavailable. Retry after ${this.timeUntilReset()}ms`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats() {
    const recentFailures = this.getRecentFailures();
    return {
      state: this.state,
      failures: recentFailures,
      successfulCalls: this.successfulCalls,
      threshold: this.failureThreshold,
      timeUntilReset: this.state === 'OPEN' ? this.timeUntilReset() : null,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.failures = [];
    this.successfulCalls = 0;
    this.lastFailureTime = null;
    this.transitionTo('CLOSED');
  }

  /**
   * Force open the circuit (for maintenance mode)
   */
  forceOpen(): void {
    this.transitionTo('OPEN');
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successfulCalls++;

      if (this.successfulCalls >= this.successThreshold) {
        // Recovered! Close the circuit
        this.reset();
      }
    } else if (this.state === 'CLOSED') {
      // Remove old failures from sliding window
      this.failures = this.getRecentFailures().map((f) => f);
    }
  }

  private onFailure(error: Error): void {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    // Remove failures outside the window
    const recentFailures = this.getRecentFailures();

    if (this.state === 'HALF_OPEN') {
      // Failed during recovery, go back to OPEN
      this.successfulCalls = 0;
      this.transitionTo('OPEN');
      this.onOpen?.(error);
    } else if (this.state === 'CLOSED') {
      // Check if we should open the circuit
      if (recentFailures.length >= this.failureThreshold) {
        this.transitionTo('OPEN');
        this.onOpen?.(error);
      }
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  private timeUntilReset(): number {
    if (!this.lastFailureTime) return 0;
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.resetTimeout - elapsed);
  }

  private getRecentFailures(): number[] {
    const cutoff = Date.now() - this.failureWindow;
    return this.failures.filter((timestamp) => timestamp > cutoff);
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;

    console.log(`Circuit breaker state: ${oldState} → ${newState}`);

    this.onStateChange?.(oldState, newState);

    if (newState === 'CLOSED') {
      this.onClose?.();
    }
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different services
 */
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(
    serviceName: string,
    options?: CircuitBreakerOptions
  ): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(
        serviceName,
        new CircuitBreaker({
          ...options,
          onStateChange: (from, to) => {
            console.log(`[${serviceName}] Circuit: ${from} → ${to}`);
            options?.onStateChange?.(from, to);
          },
        })
      );
    }

    return this.breakers.get(serviceName)!;
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats() {
    const stats: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }

  /**
   * Get breakers that are currently open
   */
  getOpenBreakers(): string[] {
    const open: string[] = [];
    this.breakers.forEach((breaker, name) => {
      if (breaker.getState() === 'OPEN') {
        open.push(name);
      }
    });
    return open;
  }
}

// Export singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();
