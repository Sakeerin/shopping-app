'use client';

import { useState } from 'react';
import { AddressForm } from './address-form';

// ============================================================================
// ADD ADDRESS BUTTON COMPONENT
// ============================================================================

export function AddAddressButton() {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Address</h3>
        <AddressForm
          onSuccess={() => setIsAdding(false)}
          onCancel={() => setIsAdding(false)}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Address
    </button>
  );
}
