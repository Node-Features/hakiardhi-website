/**
 * Parallel Processing Utility
 *
 * Provides utilities for processing arrays of items in parallel with concurrency control.
 * Prevents overwhelming external services and manages system resources efficiently.
 */

export interface ProcessResult<T, R> {
  success: boolean;
  item: T;
  result?: R;
  error?: Error;
  duration: number;
}

export interface ParallelProcessOptions {
  /** Maximum number of concurrent operations */
  concurrency?: number;

  /** Callback for progress updates */
  onProgress?: (completed: number, total: number) => void;

  /** Callback for each successful item */
  onSuccess?: (result: any) => void;

  /** Callback for each failed item */
  onError?: (error: Error, item: any) => void;

  /** Stop processing on first error */
  failFast?: boolean;

  /** Timeout for each item (ms) */
  timeout?: number;
}

/**
 * Process an array of items in parallel with concurrency control
 *
 * @example
 * ```typescript
 * const results = await processInParallel(
 *   recipients,
 *   async (recipient) => await sendSMS(recipient),
 *   { concurrency: 10 }
 * );
 * ```
 */
export async function processInParallel<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: ParallelProcessOptions = {}
): Promise<ProcessResult<T, R>[]> {
  const {
    concurrency = 10,
    onProgress,
    onSuccess,
    onError,
    failFast = false,
    timeout,
  } = options;

  const results: ProcessResult<T, R>[] = [];
  let completed = 0;
  let hasError = false;

  // Process in batches to control concurrency
  for (let i = 0; i < items.length; i += concurrency) {
    if (hasError && failFast) {
      // Add remaining items as skipped
      for (let j = i; j < items.length; j++) {
        results.push({
          success: false,
          item: items[j],
          error: new Error('Skipped due to previous failure'),
          duration: 0,
        });
      }
      break;
    }

    const batch = items.slice(i, i + concurrency);

    const batchPromises = batch.map(async (item) => {
      const startTime = Date.now();

      try {
        let processPromise = processor(item);

        // Add timeout if specified
        if (timeout) {
          processPromise = Promise.race([
            processPromise,
            new Promise<R>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            ),
          ]);
        }

        const result = await processPromise;
        const duration = Date.now() - startTime;

        onSuccess?.(result);

        return {
          success: true,
          item,
          result,
          duration,
        } as ProcessResult<T, R>;
      } catch (error) {
        const duration = Date.now() - startTime;
        const err = error instanceof Error ? error : new Error(String(error));

        onError?.(err, item);

        if (failFast) {
          hasError = true;
        }

        return {
          success: false,
          item,
          error: err,
          duration,
        } as ProcessResult<T, R>;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    completed += batchResults.length;
    onProgress?.(completed, items.length);
  }

  return results;
}

/**
 * Process items in batches with a delay between batches
 * Useful for rate-limited APIs
 */
export async function processInBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: ParallelProcessOptions & { batchDelay?: number } = {}
): Promise<ProcessResult<T, R>[]> {
  const { batchDelay = 1000, concurrency = 10 } = options;
  const results: ProcessResult<T, R>[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    const batchResults = await processInParallel(batch, processor, {
      ...options,
      concurrency: batch.length, // Process entire batch in parallel
    });

    results.push(...batchResults);

    // Wait between batches (except after the last batch)
    if (i + concurrency < items.length) {
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  return results;
}

/**
 * Chunk an array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 10000,
    onRetry,
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw err;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      onRetry?.(attempt, err);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Process with a rate limiter (max operations per second)
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(
    private maxPerSecond: number,
    private maxConcurrent: number = Infinity
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if we're at max concurrency
    while (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;

      // Rate limiting: wait before next execution
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 / this.maxPerSecond)
      );
    }
  }

  async processAll<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    return Promise.all(
      items.map((item) => this.execute(() => processor(item)))
    );
  }
}
