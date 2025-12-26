/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents repeated requests to a failing service by "opening the circuit"
 * after a threshold of failures. Automatically attempts to recover after a timeout.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail immediately
 * - HALF_OPEN: Testing if service has recovered
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time in ms before attempting recovery
  successThreshold: number; // Number of successes in HALF_OPEN before closing
}

interface CircuitStats {
  failures: number;
  successes: number;
  lastFailureTime: number | null;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private stats: CircuitStats = {
    failures: 0,
    successes: 0,
    lastFailureTime: null,
  };
  private config: CircuitBreakerConfig;
  private circuits: Map<string, { state: CircuitState; stats: CircuitStats }> = new Map();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      recoveryTimeout: config.recoveryTimeout || 30000, // 30 seconds
      successThreshold: config.successThreshold || 2,
    };
  }

  /**
   * Get or create circuit for a specific endpoint
   */
  private getCircuit(endpoint: string) {
    if (!this.circuits.has(endpoint)) {
      this.circuits.set(endpoint, {
        state: 'CLOSED',
        stats: { failures: 0, successes: 0, lastFailureTime: null },
      });
    }
    return this.circuits.get(endpoint)!;
  }

  /**
   * Check if request should be allowed
   */
  canRequest(endpoint: string): boolean {
    const circuit = this.getCircuit(endpoint);

    if (circuit.state === 'CLOSED') {
      return true;
    }

    if (circuit.state === 'OPEN') {
      // Check if recovery timeout has passed
      if (
        circuit.stats.lastFailureTime &&
        Date.now() - circuit.stats.lastFailureTime >= this.config.recoveryTimeout
      ) {
        // Attempt recovery
        circuit.state = 'HALF_OPEN';
        circuit.stats.successes = 0;
        return true;
      }
      return false;
    }

    if (circuit.state === 'HALF_OPEN') {
      return true;
    }

    return false;
  }

  /**
   * Record a successful request
   */
  recordSuccess(endpoint: string): void {
    const circuit = this.getCircuit(endpoint);

    if (circuit.state === 'HALF_OPEN') {
      circuit.stats.successes++;

      // Close circuit if success threshold met
      if (circuit.stats.successes >= this.config.successThreshold) {
        circuit.state = 'CLOSED';
        circuit.stats.failures = 0;
        circuit.stats.successes = 0;
        circuit.stats.lastFailureTime = null;

        if (process.env.NODE_ENV === 'development') {
          console.log(`🔧 Circuit CLOSED for ${endpoint}`);
        }
      }
    } else if (circuit.state === 'CLOSED') {
      // Reset failure count on success
      circuit.stats.failures = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(endpoint: string, status: number): void {
    const circuit = this.getCircuit(endpoint);

    // Only count server errors (5xx) and timeouts as circuit breaker failures
    // Don't count client errors (4xx) as they won't be fixed by circuit breaking
    if (status >= 500 || status === 408 || status === 0) {
      circuit.stats.failures++;
      circuit.stats.lastFailureTime = Date.now();

      if (circuit.state === 'HALF_OPEN') {
        // Failed during recovery, reopen circuit
        circuit.state = 'OPEN';
        circuit.stats.successes = 0;

        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Circuit REOPENED for ${endpoint}`);
        }
      } else if (circuit.state === 'CLOSED') {
        // Check if failure threshold exceeded
        if (circuit.stats.failures >= this.config.failureThreshold) {
          circuit.state = 'OPEN';

          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `🔴 Circuit OPENED for ${endpoint} (${circuit.stats.failures} failures)`
            );
          }
        }
      }
    }
  }

  /**
   * Get current state for an endpoint
   */
  getState(endpoint: string): CircuitState {
    return this.getCircuit(endpoint).state;
  }

  /**
   * Get statistics for an endpoint
   */
  getStats(endpoint: string): CircuitStats {
    return { ...this.getCircuit(endpoint).stats };
  }

  /**
   * Reset circuit for an endpoint
   */
  reset(endpoint: string): void {
    const circuit = this.getCircuit(endpoint);
    circuit.state = 'CLOSED';
    circuit.stats = { failures: 0, successes: 0, lastFailureTime: null };
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    this.circuits.clear();
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30 seconds
  successThreshold: 2,
});

/**
 * Circuit Breaker Error - thrown when circuit is open
 */
export class CircuitBreakerError extends Error {
  constructor(endpoint: string) {
    super(`Service temporarily unavailable. Circuit breaker is OPEN for ${endpoint}`);
    this.name = 'CircuitBreakerError';
  }
}
