# Error Handling Guide

This guide explains how to use the centralized error messaging system in the application.

## Overview

All error messages are centralized in `errorMessages.ts` to ensure consistency and user-friendly messaging throughout the application.

## Usage

### Basic Error Handling

```typescript
import { ERROR_MESSAGES, formatErrorMessage, getErrorMessage } from '@/lib/api/client';
// or
import { ERROR_MESSAGES } from '@/lib/utils/errorMessages';

try {
  await someApiCall();
} catch (error) {
  // Use the centralized error message formatter
  const userMessage = formatErrorMessage(error);
  showToast(userMessage, 'error');
}
```

### Using Predefined Messages

```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/api/client';

// Show specific error messages
showToast(ERROR_MESSAGES.NETWORK_ERROR, 'error');
showToast(ERROR_MESSAGES.UNAUTHORIZED, 'error');

// Show success messages
showToast(SUCCESS_MESSAGES.CREATED, 'success');
showToast(SUCCESS_MESSAGES.UPDATED, 'success');
```

### Available Message Categories

#### ERROR_MESSAGES
- `NETWORK_ERROR` - Connection issues
- `SERVER_UNAVAILABLE` - Server problems
- `UNAUTHORIZED` - Session expired
- `FORBIDDEN` - Permission denied
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `GENERIC_ERROR` - General errors
- And more...

#### SUCCESS_MESSAGES
- `CREATED` - Successfully created
- `UPDATED` - Successfully updated
- `DELETED` - Successfully deleted
- `SAVED` - Successfully saved
- And more...

#### WARNING_MESSAGES
- `UNSAVED_CHANGES` - Unsaved work warning
- `DELETE_CONFIRM` - Delete confirmation
- And more...

#### INFO_MESSAGES
- `LOADING` - Loading state
- `NO_DATA` - Empty state
- And more...

## Examples

### Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await api.post('/endpoint', data);
    showToast(SUCCESS_MESSAGES.CREATED, 'success');
  } catch (error) {
    // Automatically converts technical errors to user-friendly messages
    showToast(formatErrorMessage(error), 'error');
  }
};
```

### Delete Confirmation

```typescript
const handleDelete = async (id: string) => {
  if (!confirm(WARNING_MESSAGES.DELETE_CONFIRM)) return;

  try {
    await api.delete(`/endpoint/${id}`);
    showToast(SUCCESS_MESSAGES.DELETED, 'success');
  } catch (error) {
    showToast(formatErrorMessage(error), 'error');
  }
};
```

### Custom Error Messages

For specific error cases, you can still provide custom messages:

```typescript
try {
  await someOperation();
} catch (error) {
  // Use custom message with fallback
  const message = formatErrorMessage(error, 'Failed to complete the operation');
  showToast(message, 'error');
}
```

## Best Practices

1. **Always use centralized messages** - Don't hardcode error messages in components
2. **Use formatErrorMessage** - It automatically converts technical errors to user-friendly ones
3. **Provide context when needed** - For specific operations, you can override the default message
4. **Log technical details** - Use console.error for debugging, show user-friendly messages to users
5. **Be consistent** - Use the same message patterns across the application

## How It Works

1. **API Client Interceptor** - Automatically catches network errors and converts them
2. **formatErrorMessage** - Identifies technical messages and replaces them with user-friendly alternatives
3. **getErrorMessageByStatus** - Returns appropriate messages based on HTTP status codes
4. **Message Constants** - Reusable message strings organized by category

## Adding New Messages

To add new messages, edit `errorMessages.ts`:

```typescript
export const ERROR_MESSAGES = {
  // ... existing messages
  NEW_ERROR_TYPE: "User-friendly message for this error",
} as const;
```

Then use it anywhere in the application:

```typescript
import { ERROR_MESSAGES } from '@/lib/api/client';

showToast(ERROR_MESSAGES.NEW_ERROR_TYPE, 'error');
```

## Migration from Hardcoded Messages

Replace hardcoded error messages:

```typescript
// ❌ Before
showToast('Failed to load data', 'error');
showToast('An error occurred', 'error');

// ✅ After
showToast(ERROR_MESSAGES.LOAD_FAILED, 'error');
showToast(formatErrorMessage(error), 'error');
```

## Testing

The error messages are automatically applied through the API client interceptor, so network errors will always show user-friendly messages. Test by:

1. Stopping the backend server (tests NETWORK_ERROR)
2. Using invalid credentials (tests UNAUTHORIZED)
3. Trying to access forbidden resources (tests FORBIDDEN)
4. Submitting invalid data (tests VALIDATION_ERROR)
