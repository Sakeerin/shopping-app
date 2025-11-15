'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAddress, setDefaultAddress } from '@/actions/profile';
import { AddressForm } from './address-form';

// ============================================================================
// ADDRESS CARD COMPONENT
// ============================================================================

interface AddressCardProps {
  address: {
    id: string;
    fullName: string;
    street: string;
    street2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
  };
}

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteAddress(address.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete address');
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    const result = await setDefaultAddress(address.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to set default address');
    }
    setIsSettingDefault(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Edit Address</h3>
        <AddressForm
          address={address}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow hover:shadow-md transition-shadow">
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Default
          </span>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{address.fullName}</h3>
        <div className="text-sm text-gray-600">
          <p>{address.street}</p>
          {address.street2 && <p>{address.street2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
          <p className="mt-2">{address.phone}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit
        </button>

        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={isSettingDefault}
            className="rounded-md bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSettingDefault ? 'Setting...' : 'Set as Default'}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
