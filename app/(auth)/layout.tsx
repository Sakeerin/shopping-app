import { ReactNode } from 'react';
import Link from 'next/link';

// ============================================================================
// AUTH LAYOUT
// ============================================================================

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <div className="mb-8">
          <Link href="/" className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">ShopApp</span>
            </div>
          </Link>
        </div>

        {/* Auth Form Content */}
        <main className="w-full">{children}</main>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} ShopApp. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
