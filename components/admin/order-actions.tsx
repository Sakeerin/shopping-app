'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { updateOrderStatus } from '@/actions/orders';

// ============================================================================
// T155: ORDER ACTIONS COMPONENT (Phase 7 - User Story 6)
// ============================================================================

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  className?: string;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function OrderActions({
  orderId,
  currentStatus,
  className = '',
}: OrderActionsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateOrderStatus(orderId, selectedStatus);

      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update order status');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={className}>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the order status and notify the customer
        </p>

        {/* Current Status Badge */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground">
            Current Status
          </label>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[currentStatus]
            }`}
          >
            {statusOptions.find((opt) => opt.value === currentStatus)?.label}
          </span>
        </div>

        {/* Status Selector */}
        <div className="mt-6">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-foreground"
          >
            Change Status To
          </label>
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isUpdating}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Descriptions */}
        <div className="mt-4 rounded-md bg-muted p-3 text-sm">
          {selectedStatus === 'PENDING' && (
            <p>Order is awaiting payment confirmation or processing.</p>
          )}
          {selectedStatus === 'PROCESSING' && (
            <p>Order is being prepared and packaged.</p>
          )}
          {selectedStatus === 'SHIPPED' && (
            <p>
              <strong>Customer will be notified via email</strong> that their
              order has been shipped.
            </p>
          )}
          {selectedStatus === 'DELIVERED' && (
            <p>
              <strong>Customer will be notified via email</strong> that their
              order has been delivered.
            </p>
          )}
          {selectedStatus === 'CANCELLED' && (
            <p className="text-red-600">
              Order is cancelled. Please ensure any payments are refunded.
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            role="alert"
          >
            Order status updated successfully!
          </div>
        )}

        {/* Update Button */}
        <button
          type="button"
          onClick={handleStatusUpdate}
          disabled={isUpdating || selectedStatus === currentStatus}
          className="mt-6 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Status...
            </>
          ) : (
            'Update Status'
          )}
        </button>

        {selectedStatus === currentStatus && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Select a different status to update
          </p>
        )}
      </div>
    </div>
  );
}
