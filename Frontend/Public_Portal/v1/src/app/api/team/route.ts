/**
 * Team Members API Proxy Route
 * Proxies requests to the external API to bypass CORS restrictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api.config';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const memberType = searchParams.get('type');

    // Build the external API URL
    let apiUrl = `${API_BASE_URL}/api/public/about/team`;
    if (memberType) {
      apiUrl += `?type=${memberType}`;
    }

    console.log('Fetching team from:', apiUrl);

    // Forward request to external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Team API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team members',
        data: {
          leadership: [],
          board: [],
          staff: [],
          advisor: [],
        },
      },
      { status: 500 }
    );
  }
}
