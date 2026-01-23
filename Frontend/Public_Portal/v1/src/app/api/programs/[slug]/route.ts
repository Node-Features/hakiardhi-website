/**
 * Program Detail API Proxy Route
 * Proxies requests to the external API to bypass CORS restrictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api.config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const apiUrl = `${API_BASE_URL}/api/public/programs/${slug}`;

    console.log('Fetching program detail from:', apiUrl);

    // Fetch from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Program not found' } },
          { status: 404 }
        );
      }
      console.error('Program Detail API Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: { code: 'API_ERROR', message: 'Failed to fetch program' } },
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
    console.error('Program Detail API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PROXY_ERROR', message: 'Failed to fetch program' } },
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
