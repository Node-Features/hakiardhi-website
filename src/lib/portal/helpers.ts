/**
 * Portal API Helper Functions
 * Shared utilities for public portal API routes
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API success response wrapper
 */
export function apiResponse<T>(data: T, meta?: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

/**
 * Error response wrapper
 */
export function errorResponse(message: string, code: string = 'ERROR', status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

/**
 * Parse query parameters from URL
 */
export function getQueryParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    current_page: page,
    per_page: limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

/**
 * Parse boolean query parameter
 */
export function parseBoolean(value: string | null | undefined): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  return value === 'true' || value === '1';
}

/**
 * Parse number query parameter
 */
export function parseNumber(value: string | null | undefined, defaultValue: number): number {
  if (value === null || value === undefined) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe string to integer conversion
 */
export function toInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Generate reference number
 */
export function generateReferenceNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
