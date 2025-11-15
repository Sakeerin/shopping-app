import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

// ============================================================================
// REGISTER PAGE
// ============================================================================

export const metadata = {
  title: 'Create Account | ShopApp',
  description: 'Create your ShopApp account',
};

function RegisterContent() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* OAuth Buttons */}
        <OAuthButtons callbackUrl="/" />

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
