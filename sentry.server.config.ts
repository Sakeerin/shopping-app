// ============================================================================
// T202: SENTRY SERVER CONFIGURATION (Phase 9 - Monitoring & Analytics)
// ============================================================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  environment: process.env.NODE_ENV,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive information
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Filter sensitive data from context
    if (event.contexts) {
      // Remove database connection strings
      if (event.contexts.runtime) {
        delete event.contexts.runtime.DATABASE_URL;
      }
    }

    // Filter request data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers['X-Auth-Token'];
      }

      // Filter sensitive data from request body
      if (event.request.data) {
        const data = event.request.data;
        if (typeof data === 'object') {
          // Remove password fields
          if (data.password) data.password = '[Filtered]';
          if (data.confirmPassword) data.confirmPassword = '[Filtered]';
          if (data.oldPassword) data.oldPassword = '[Filtered]';

          // Remove payment data
          if (data.cardNumber) data.cardNumber = '[Filtered]';
          if (data.cvv) data.cvv = '[Filtered]';
          if (data.creditCard) data.creditCard = '[Filtered]';

          // Remove API keys
          if (data.apiKey) data.apiKey = '[Filtered]';
          if (data.token) data.token = '[Filtered]';
        }
      }
    }

    // Filter exception values
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => {
        if (exception.value) {
          // Remove potential sensitive data from error messages
          exception.value = exception.value
            .replace(/password[=:]\s*\S+/gi, 'password=[Filtered]')
            .replace(/token[=:]\s*\S+/gi, 'token=[Filtered]')
            .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=[Filtered]');
        }
        return exception;
      });
    }

    return event;
  },

  // Ignore common errors
  ignoreErrors: [
    // Database connection errors during development
    'ECONNREFUSED',
    'connect ECONNREFUSED',
    // Rate limiting errors (expected behavior)
    'Too many requests',
    'Rate limit exceeded',
  ],
});
