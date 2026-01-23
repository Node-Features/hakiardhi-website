/**
 * Contact Form Submission API Proxy Route
 * Proxies POST requests to the external API
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Build the external API URL
    const apiUrl = `${API_BASE_URL}/api/public/contact/submit`;

    console.log('Submitting contact form to:', apiUrl);
    console.log('Request body:', JSON.stringify(body));

    // Forward request to external API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    console.log('API Response status:', response.status);
    console.log('API Response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If not JSON, return a formatted error
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from server',
          message: responseText || 'No response from server'
        },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Contact Form API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit contact form',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
