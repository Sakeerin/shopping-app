import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail } from '@/services/users';
import { ProfileForm } from '@/components/profile/profile-form';

// ============================================================================
// PROFILE PAGE (T110)
// ============================================================================

export const metadata = {
  title: 'My Profile | ShopApp',
  description: 'Manage your account settings and profile information',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Profile Form */}
        <div className="rounded-lg bg-white p-6 shadow">
          <ProfileForm
            user={{
              name: user.name,
              email: user.email,
              image: user.image,
            }}
          />
        </div>
      </div>
    </div>
  );
}
