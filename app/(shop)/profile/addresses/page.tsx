import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getUserAddresses } from '@/services/users';
import { AddressCard } from '@/components/profile/address-card';
import { AddAddressButton } from '@/components/profile/add-address-button';

// ============================================================================
// ADDRESSES PAGE (T111)
// ============================================================================

export const metadata = {
  title: 'My Addresses | ShopApp',
  description: 'Manage your shipping and billing addresses',
};

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect('/login');
  }

  const addresses = await getUserAddresses(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
            <p className="mt-2 text-gray-600">
              Manage your shipping and billing addresses
            </p>
          </div>
          <AddAddressButton />
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No addresses saved yet
            </h2>
            <p className="mt-2 text-gray-600">
              Add an address to make checkout faster
            </p>
            <div className="mt-6">
              <AddAddressButton />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
