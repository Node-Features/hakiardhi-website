/**
 * Date formatting utilities for LARRRI Admin Portal
 */

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param format - Format type: 'short' | 'long' | 'time' | 'datetime'
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  const options = formatOptions[format];

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export function formatDateISO(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Check if a date is in the past
 * @param date - Date string or Date object
 * @returns Boolean indicating if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 * @param date - Date string or Date object
 * @returns Boolean indicating if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Check if a date is today
 * @param date - Date string or Date object
 * @returns Boolean indicating if date is today
 */
export function isToday(date: string | Date): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Calculate days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between dates
 */
export function daysBetween(startDate: string | Date, endDate: string | Date): number {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date - Base date
 * @param months - Number of months to add
 * @returns New date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get start of day
 * @param date - Date object
 * @returns Date at start of day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 * @param date - Date object
 * @returns Date at end of day (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Parse date from various formats
 * @param dateString - Date string in various formats
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  if (!startDate || !endDate) return '';

  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');

  return `${start} - ${end}`;
}
