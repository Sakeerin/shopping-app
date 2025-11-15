import { Suspense } from 'react';
import { NewPasswordForm } from '@/components/auth/password-reset-form';

// ============================================================================
// RESET PASSWORD PAGE (WITH TOKEN)
// ============================================================================

export const metadata = {
  title: 'Reset Password | ShopApp',
  description: 'Set your new password',
};

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

function ResetPasswordContent({ token }: { token: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <NewPasswordForm token={token} />
    </div>
  );
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      }
    >
      <ResetPasswordContent token={params.token} />
    </Suspense>
  );
}
