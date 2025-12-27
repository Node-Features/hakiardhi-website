/**
 * Phone Number Formatting Utilities
 *
 * Handles phone number normalization for database storage and display
 */

/**
 * Normalize phone number for database storage
 * Removes '+' prefix and any whitespace/dashes
 *
 * @param phoneNumber - Raw phone number input
 * @returns Normalized phone number without '+' prefix
 *
 * @example
 * normalizePhoneForDB('+255712345678') // '255712345678'
 * normalizePhoneForDB('255 712 345 678') // '255712345678'
 * normalizePhoneForDB('+255-712-345-678') // '255712345678'
 */
export function normalizePhoneForDB(phoneNumber: string): string {
    if (!phoneNumber) return '';

    return phoneNumber
        .trim()
        .replace(/^\+/, '')  // Remove leading '+'
        .replace(/[\s\-()]/g, '');  // Remove spaces, dashes, parentheses
}

/**
 * Format phone number for display
 * Adds '+' prefix if not present
 *
 * @param phoneNumber - Database phone number
 * @returns Phone number with '+' prefix for display
 *
 * @example
 * formatPhoneForDisplay('255712345678') // '+255712345678'
 * formatPhoneForDisplay('+255712345678') // '+255712345678'
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
    if (!phoneNumber) return '';

    const normalized = phoneNumber.trim();
    return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

/**
 * Validate phone number format
 * Checks if phone number meets minimum requirements
 *
 * @param phoneNumber - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;

    const normalized = normalizePhoneForDB(phoneNumber);

    // Must be at least 10 digits and contain only numbers
    return /^\d{10,15}$/.test(normalized);
}
