/**
 * API Client for Public Portal
 * Lightweight fetch-based HTTP client with error handling
 */

// Use empty string to proxy through Next.js API routes (bypasses CORS)
const API_BASE_URL = '';

/**
 * Custom API Error class for better error handling
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API Client class with fetch wrapper
 */
class APIClient {
  private baseURL: string;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request method with error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new APIError(
          response.status,
          `API request failed: ${response.statusText}`,
          endpoint
        );
      }

      return await response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof APIError) throw error;
      throw new APIError(0, 'Network error', endpoint);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Singleton API client instance
 */
export const api = new APIClient();
