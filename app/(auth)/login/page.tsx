import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

// ============================================================================
// LOGIN PAGE
// ============================================================================

export const metadata = {
  title: 'Sign In | ShopApp',
  description: 'Sign in to your ShopApp account',
};

function LoginContent() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* OAuth Buttons */}
        <OAuthButtons callbackUrl="/" />

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
