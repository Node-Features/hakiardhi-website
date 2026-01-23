/**
 * Contact API Service
 * Service layer for submitting contact forms
 */

import { api } from '../client';

/**
 * Contact form data structure
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

/**
 * Contact form submission response
 */
export interface ContactSubmissionResponse {
  success: boolean;
  ticket_id?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Submit contact form to API
 *
 * @param data - Contact form data
 * @returns Submission response with ticket ID
 * @throws {Error} If the submission fails
 *
 * @example
 * ```typescript
 * const response = await submitContactForm({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   subject: 'General Inquiry',
 *   message: 'Hello, I have a question...'
 * });
 * console.log('Ticket:', response.ticket_id);
 * ```
 */
export async function submitContactForm(data: ContactFormData): Promise<ContactSubmissionResponse> {
  const endpoint = '/api/contact/submit';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    // Handle validation errors
    if (result.errors) {
      const error = new Error('Validation failed');
      (error as any).errors = result.errors;
      throw error;
    }
    throw new Error(result.error || result.message || 'Failed to submit contact form');
  }

  return result;
}
