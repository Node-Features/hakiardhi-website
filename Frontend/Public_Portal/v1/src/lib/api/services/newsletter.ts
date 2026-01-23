/**
 * Newsletter API Service
 * Service layer for newsletter subscription
 */

import { api, APIError } from '../client';

/**
 * Newsletter subscription request
 */
export interface NewsletterSubscribeRequest {
  email: string;
  name?: string;
  interests?: string[];
}

/**
 * Newsletter subscription response
 */
export interface NewsletterSubscribeResponse {
  success: boolean;
  data?: {
    success: boolean;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Subscribe to newsletter
 *
 * @param data - Subscription data (email, name, interests)
 * @returns Subscription response
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const result = await subscribeToNewsletter({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   interests: ['research', 'events']
 * });
 * ```
 */
export async function subscribeToNewsletter(
  data: NewsletterSubscribeRequest
): Promise<NewsletterSubscribeResponse> {
  const endpoint = '/api/newsletter/subscribe';

  try {
    const response = await api.post<NewsletterSubscribeResponse>(endpoint, data);
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      // Handle specific error codes
      if (error.status === 409) {
        return {
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: 'This email is already subscribed to our newsletter.',
          },
        };
      }
    }
    throw error;
  }
}
