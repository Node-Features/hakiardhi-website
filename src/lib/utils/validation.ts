/**
 * Form validation utilities for LARRRI Admin Portal
 * These utilities can be used alongside Zod or standalone
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize Tanzania phone number to 255XXXXXXXXX format
 * @param phone - Phone number to normalize
 * @returns Normalized phone number (255XXXXXXXXX) or empty string if invalid
 */
export function normalizeTanzaniaPhone(phone: string): string {
  if (!phone) return '';

  // Remove all spaces and non-digit characters except +
  let cleaned = phone.replace(/\s/g, '');

  // Remove + if present
  cleaned = cleaned.replace(/\+/g, '');

  // Handle 0XXXXXXXXX format - replace leading 0 with 255
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '255' + cleaned.substring(1);
  }

  // Handle 255XXXXXXXXX format (already correct)
  if (cleaned.startsWith('255') && cleaned.length === 12) {
    return cleaned;
  }

  // Handle XXXXXXXXX format (9 digits) - add 255 prefix
  if (cleaned.length === 9 && /^[67]\d{8}$/.test(cleaned)) {
    return '255' + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number (Tanzania format)
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Tanzania phone formats: 255XXXXXXXXX, +255XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+?255|0)[67]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format Tanzania phone number for display (with spaces)
 * @param phone - Phone number to format
 * @returns Formatted phone number (255 XXX XXX XXX)
 */
export function formatTanzaniaPhone(phone: string): string {
  const normalized = normalizeTanzaniaPhone(phone);

  if (normalized.length === 12 && normalized.startsWith('255')) {
    return `255 ${normalized.substring(3, 6)} ${normalized.substring(6, 9)} ${normalized.substring(9, 12)}`;
  }

  return phone;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that passwords match
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Boolean indicating if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Boolean indicating if date range is valid (end > start)
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): boolean {
  if (!startDate || !endDate) return false;

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return end > start;
}

/**
 * Validate required field
 * @param value - Value to check
 * @returns Boolean indicating if field has value
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

/**
 * Validate string length
 * @param value - String to check
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns Boolean indicating if length is valid
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  if (!value) return false;

  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate number range
 * @param value - Number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Boolean indicating if number is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;

  return value >= min && value <= max;
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types or extensions
 * @returns Boolean indicating if file type is allowed
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  if (!file) return false;

  const fileType = file.type;
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

  return allowedTypes.some(
    type => fileType === type || fileExtension === type
  );
}

/**
 * Validate file size
 * @param file - File object
 * @param maxSizeInMB - Maximum file size in megabytes
 * @returns Boolean indicating if file size is within limit
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  if (!file) return false;

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Sanitize input string (remove potentially harmful characters)
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @returns Boolean indicating if UUID is valid
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate age group
 * @param age - Age value
 * @returns Boolean indicating if age is valid (1-150)
 */
export function isValidAge(age: number): boolean {
  return isInRange(age, 1, 150);
}

/**
 * Validate Tanzania national ID
 * @param nationalId - National ID to validate
 * @returns Boolean indicating if ID format is valid
 */
export function isValidNationalId(nationalId: string): boolean {
  if (!nationalId) return false;

  // Tanzania national ID format: 20 digits
  const idRegex = /^\d{20}$/;
  return idRegex.test(nationalId.replace(/\s/g, ''));
}

/**
 * Create validation error message
 * @param field - Field name
 * @param rule - Validation rule that failed
 * @returns Error message
 */
export function createValidationMessage(field: string, rule: string): string {
  const messages: Record<string, string> = {
    required: `${field} is required`,
    email: `${field} must be a valid email address`,
    phone: `${field} must be a valid phone number`,
    url: `${field} must be a valid URL`,
    min: `${field} is too short`,
    max: `${field} is too long`,
    range: `${field} is out of range`,
    match: `${field} does not match`,
    unique: `${field} already exists`,
  };

  return messages[rule] || `${field} is invalid`;
}

/**
 * Batch validate multiple fields
 * @param data - Object with field values
 * @param rules - Validation rules for each field
 * @returns Object with validation errors
 */
export function validateFields(
  data: Record<string, unknown>,
  rules: Record<string, Array<{ rule: string; message?: string }>>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const { rule, message } of fieldRules) {
      let isValid = true;

      switch (rule) {
        case 'required':
          isValid = isRequired(value);
          break;
        case 'email':
          isValid = isValidEmail(value as string);
          break;
        case 'phone':
          isValid = isValidPhoneNumber(value as string);
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        errors[field] = message || createValidationMessage(field, rule);
        break; // Stop at first error for this field
      }
    }
  }

  return errors;
}
