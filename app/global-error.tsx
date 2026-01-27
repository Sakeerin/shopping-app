'use client';

// ============================================================================
// T202: GLOBAL ERROR BOUNDARY (Phase 9 - Monitoring & Analytics)
// ============================================================================

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">
                Something went wrong!
              </h1>
              <p className="text-lg text-gray-600">
                We apologize for the inconvenience. An error has occurred.
              </p>
            </div>

            {error.digest && (
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-sm text-gray-600">
                  Error ID: <code className="font-mono">{error.digest}</code>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try again
              </button>

              <a
                href="/"
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Go to homepage
              </a>
            </div>

            <p className="text-sm text-gray-500">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
