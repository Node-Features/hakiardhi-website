/**
 * Transaction Helper
 *
 * Provides transaction support for Supabase operations
 */

import { supabase } from '@/lib/database/supabase_client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TransactionOptions {
  isolationLevel?: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  timeout?: number; // milliseconds
}

type DbClient = ReturnType<typeof supabase>;

/**
 * Execute a function within a database transaction
 * Note: Supabase doesn't natively support transactions in the JS client,
 * so we simulate it using PostgreSQL transaction functions
 */
export async function withTransaction<T>(
  fn: (client: DbClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const client = supabase();
  const { isolationLevel = 'READ COMMITTED', timeout = 30000 } = options;

  try {
    // Begin transaction
    await client.rpc('begin_transaction', { isolation_level: isolationLevel });

    // Set statement timeout
    if (timeout) {
      await client.rpc('set_statement_timeout', { timeout_ms: timeout });
    }

    const result = await fn(client);

    // Commit transaction
    await client.rpc('commit_transaction');

    return result;
  } catch (error) {
    // Rollback on error
    try {
      await client.rpc('rollback_transaction');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }

    throw error;
  }
}

/**
 * Execute multiple operations atomically
 * Returns all results or rolls back on any failure
 */
export async function executeAtomic<T>(
  operations: Array<(client: DbClient) => Promise<T>>
): Promise<T[]> {
  return withTransaction(async (client) => {
    const results: T[] = [];

    for (const operation of operations) {
      const result = await operation(client);
      results.push(result);
    }

    return results;
  });
}

/**
 * Retry a function with exponential backoff
 * Useful for handling serialization failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 100,
    shouldRetry = (error) => {
      // Retry on serialization failures or deadlocks
      const message = error?.message || '';
      return (
        message.includes('serialization') ||
        message.includes('deadlock') ||
        message.includes('could not serialize')
      );
    },
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Create database functions for transaction support
 * Run this once during setup
 */
export const TRANSACTION_FUNCTIONS_SQL = `
-- Begin transaction
CREATE OR REPLACE FUNCTION begin_transaction(isolation_level TEXT DEFAULT 'READ COMMITTED')
RETURNS void AS $$
BEGIN
  EXECUTE 'SET TRANSACTION ISOLATION LEVEL ' || isolation_level;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
  COMMIT;
END;
$$ LANGUAGE plpgsql;

-- Rollback transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
  ROLLBACK;
END;
$$ LANGUAGE plpgsql;

-- Set statement timeout
CREATE OR REPLACE FUNCTION set_statement_timeout(timeout_ms INTEGER)
RETURNS void AS $$
BEGIN
  EXECUTE 'SET statement_timeout = ' || timeout_ms;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION begin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION commit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION set_statement_timeout TO authenticated;
`;
