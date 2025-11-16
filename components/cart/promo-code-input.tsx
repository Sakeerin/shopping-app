'use client';

import { useState } from 'react';
import { applyPromoCode, removePromoCode } from '@/actions/cart';

// ============================================================================
// PROMO CODE INPUT COMPONENT (T124)
// ============================================================================

interface PromoCodeInputProps {
  subtotal: number;
  onApply: (discount: number, code: string, promoDetails: any) => void;
  onRemove: () => void;
  currentPromoCode?: string | null;
  currentDiscount?: number;
}

export function PromoCodeInput({
  subtotal,
  onApply,
  onRemove,
  currentPromoCode,
  currentDiscount = 0,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await applyPromoCode(code.trim(), subtotal);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid promo code');
      return;
    }

    setSuccess(true);
    setCode('');
    onApply(result.data.discount, result.data.code, result.data.promoCode);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRemove = async () => {
    await removePromoCode();
    onRemove();
    setError(null);
    setSuccess(false);
  };

  if (currentPromoCode) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900">
                Promo Code: {currentPromoCode}
              </p>
              <p className="text-xs text-green-700">
                You saved ${currentDiscount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter promo code"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">Promo code applied successfully!</p>
        </div>
      )}
    </div>
  );
}
