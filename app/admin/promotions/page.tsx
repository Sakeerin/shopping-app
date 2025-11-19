'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Plus, Loader2 } from 'lucide-react';
import { createPromoCode } from '@/actions/admin';

// ============================================================================
// T167: PROMOTIONS PAGE (Phase 7 - User Story 6)
// ============================================================================

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createPromoCode({
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
        expiresAt: formData.expiresAt || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        setSuccess(true);
        setShowForm(false);
        setFormData({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          minPurchase: '',
          maxUses: '',
          expiresAt: '',
          isActive: true,
        });
        router.refresh();
      } else {
        setError(result.error || 'Failed to create promo code');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage promo codes and discounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          role="alert"
        >
          Promo code created successfully!
        </div>
      )}

      {/* Create Promo Code Form */}
      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Promo Code</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Promo Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-foreground"
              >
                Promo Code <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVE20"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Uppercase letters and numbers only (e.g., SAVE20, WELCOME10)
              </p>
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-foreground"
                >
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-foreground"
                >
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  id="discountValue"
                  type="number"
                  name="discountValue"
                  step="0.01"
                  min="0"
                  max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={
                    formData.discountType === 'PERCENTAGE' ? '20' : '10.00'
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Minimum Purchase and Max Uses */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="minPurchase"
                  className="block text-sm font-medium text-foreground"
                >
                  Minimum Purchase ($)
                </label>
                <input
                  id="minPurchase"
                  type="number"
                  name="minPurchase"
                  step="0.01"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchase: e.target.value })
                  }
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional: Leave empty for no minimum
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxUses"
                  className="block text-sm font-medium text-foreground"
                >
                  Maximum Uses
                </label>
                <input
                  id="maxUses"
                  type="number"
                  name="maxUses"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  placeholder="Unlimited"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional: Leave empty for unlimited uses
                </p>
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label
                htmlFor="expiresAt"
                className="block text-sm font-medium text-foreground"
              >
                Expiration Date
              </label>
              <input
                id="expiresAt"
                type="date"
                name="expiresAt"
                min={new Date().toISOString().split('T')[0]}
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Optional: Leave empty for no expiration
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-foreground">
                Active (visible to customers)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Promo Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes List Placeholder */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Existing Promo Codes</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Promo codes will appear here</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first promo code to get started
          </p>
        </div>
      </div>
    </div>
  );
}
