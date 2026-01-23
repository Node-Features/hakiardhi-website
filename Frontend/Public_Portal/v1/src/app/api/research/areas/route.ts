/**
 * Research Areas API Proxy Route
 * Proxies requests to the external API to bypass CORS restrictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api.config';

export async function GET(request: NextRequest) {
  try {
    // Build the external API URL
    const apiUrl = `${API_BASE_URL}/api/public/research/areas`;

    console.log('📚 Fetching research areas from:', apiUrl);

    // Fetch from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes since areas don't change frequently
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch research areas', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Research Areas API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
