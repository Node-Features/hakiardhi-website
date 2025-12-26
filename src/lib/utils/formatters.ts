/**
 * General formatting utilities for LARRRI Admin Portal
 */

/**
 * Format number with thousands separator
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';

  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency (Tanzanian Shillings)
 * @param value - Amount to format
 * @param currency - Currency code (default: 'TZS')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'TZS'): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';

  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format phone number (Tanzania format)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Tanzania phone format: +255 XXX XXX XXX
  if (cleaned.startsWith('255')) {
    const match = cleaned.match(/^(255)(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }

  // If starts with 0, format as 0XXX XXX XXX
  if (cleaned.startsWith('0')) {
    const match = cleaned.match(/^(0)(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]}${match[2]} ${match[3]} ${match[4]}`;
    }
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';

  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert snake_case to Title Case
 * @param text - Snake case text
 * @returns Title case text
 */
export function snakeToTitle(text: string): string {
  if (!text) return '';

  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate initials from name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "JD")
 */
export function getInitials(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return '';

  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

  return `${firstInitial}${lastInitial}`;
}

/**
 * Format full name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return '';

  return `${firstName || ''} ${lastName || ''}`.trim();
}

/**
 * Format status badge text
 * @param status - Status value
 * @returns Formatted status text
 */
export function formatStatus(status: string): string {
  if (!status) return '';

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate success rate percentage
 * @param actual - Actual value
 * @param target - Target value
 * @returns Success rate as percentage
 */
export function calculateSuccessRate(actual: number, target: number): number {
  if (!target || target === 0) return 0;

  return Math.round((actual / target) * 100);
}

/**
 * Format duration in minutes to human readable
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '0 minutes';

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
}

/**
 * Format array to comma-separated list
 * @param items - Array of items
 * @param maxItems - Maximum items to show before "and X more"
 * @returns Formatted list string
 */
export function formatList(items: string[], maxItems: number = 3): string {
  if (!items || items.length === 0) return '';

  if (items.length <= maxItems) {
    return items.join(', ');
  }

  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  return `${visible.join(', ')} and ${remaining} more`;
}

/**
 * Format boolean to Yes/No
 * @param value - Boolean value
 * @returns "Yes" or "No"
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format enum value to readable text
 * @param value - Enum value
 * @returns Readable text
 */
export function formatEnum(value: string): string {
  if (!value) return '';

  return value
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
