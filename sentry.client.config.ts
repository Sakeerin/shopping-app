// ============================================================================
// T202: SENTRY CLIENT CONFIGURATION (Phase 9 - Monitoring & Analytics)
// ============================================================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

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

    // Filter out sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          // Remove password fields
          if (breadcrumb.data.password) {
            breadcrumb.data.password = '[Filtered]';
          }
          // Remove credit card data
          if (breadcrumb.data.cardNumber) {
            breadcrumb.data.cardNumber = '[Filtered]';
          }
          if (breadcrumb.data.cvv) {
            breadcrumb.data.cvv = '[Filtered]';
          }
        }
        return breadcrumb;
      });
    }

    // Filter request data
    if (event.request) {
      // Remove cookies
      delete event.request.cookies;

      // Filter headers
      if (event.request.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
      }
    }

    return event;
  },

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input elements
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore common errors that don't need tracking
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Aborted requests
    'AbortError',
    'The user aborted a request',
  ],

  // Don't report errors from these URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
