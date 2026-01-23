/**
 * Program Categories API Proxy Route
 * Proxies requests to the external API to bypass CORS restrictions
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api.config';

export async function GET() {
  try {
    const apiUrl = `${API_BASE_URL}/api/public/programs/categories`;

    console.log('Fetching program categories from:', apiUrl);

    // Fetch from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Program Categories API Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: { code: 'API_ERROR', message: 'Failed to fetch categories' } },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Program Categories API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PROXY_ERROR', message: 'Failed to fetch categories' } },
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
