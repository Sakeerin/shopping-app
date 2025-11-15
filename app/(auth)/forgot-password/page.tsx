import { Suspense } from 'react';
import { PasswordResetRequestForm } from '@/components/auth/password-reset-form';

// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================

export const metadata = {
  title: 'Forgot Password | ShopApp',
  description: 'Reset your ShopApp account password',
};

function ForgotPasswordContent() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PasswordResetRequestForm />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
