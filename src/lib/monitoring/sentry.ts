/**
 * Sentry Error Tracking Integration
 *
 * Centralized error tracking and monitoring for production debugging.
 * Uncomment and configure when ready to use Sentry.
 *
 * Setup Instructions:
 * 1. Install Sentry: npm install @sentry/nextjs
 * 2. Add NEXT_PUBLIC_SENTRY_DSN to .env
 * 3. Uncomment the import and initialization code below
 * 4. Run: npx @sentry/wizard@latest -i nextjs
 */

// import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  correlationId?: string;
  endpoint?: string;
  method?: string;
  status?: number;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Initialize Sentry (call this in _app.tsx or layout.tsx)
 */
export function initSentry() {
  // Uncomment when ready to use Sentry
  /*
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // Adjust this value in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Capture 100% of errors
      sampleRate: 1.0,

      // Enable session replay for debugging
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }

        // Remove sensitive query params
        if (event.request?.query_string) {
          const queryParams = new URLSearchParams(event.request.query_string);
          if (queryParams.has('token')) queryParams.delete('token');
          if (queryParams.has('password')) queryParams.delete('password');
          event.request.query_string = queryParams.toString();
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',

        // Network errors that are expected
        'NetworkError',
        'Failed to fetch',
        'Network request failed',

        // 404 errors (not really errors)
        'Request failed with status code 404',
      ],
    });
  }
  */
}

/**
 * Capture an error with context
 */
export function captureError(error: Error, context?: ErrorContext) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Sentry]', error, context);
  }

  // Uncomment when Sentry is configured
  /*
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      // Add context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, { value });
        });

        // Add tags for filtering
        if (context.correlationId) {
          scope.setTag('correlation_id', context.correlationId);
        }
        if (context.endpoint) {
          scope.setTag('endpoint', context.endpoint);
        }
        if (context.status) {
          scope.setTag('http_status', context.status);
        }
      }

      // Capture the error
      Sentry.captureException(error);
    });
  }
  */
}

/**
 * Capture an API error
 */
export function captureAPIError(
  error: Error,
  endpoint: string,
  method: string,
  status: number,
  correlationId?: string
) {
  captureError(error, {
    type: 'api_error',
    endpoint,
    method,
    status,
    correlationId,
  });
}

/**
 * Capture a message (for logging important events)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Sentry ${level}]`, message);
  }

  // Uncomment when Sentry is configured
  /*
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
  */
}

/**
 * Set user context for error tracking
 */
export function setUser(/* user: { id: string; email?: string; username?: string } | null */) {
  // Uncomment when Sentry is configured
  /*
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } else {
      Sentry.setUser(null);
    }
  }
  */
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(/* message: string, category: string, data?: Record<string, unknown> */) {
  // Uncomment when Sentry is configured
  /*
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }
  */
}
