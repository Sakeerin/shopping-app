'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { updateCartItem, removeFromCart } from '@/actions/cart';
import type { CartItemData } from '@/types/cart';

// ============================================================================
// CART ITEM COMPONENT (Client Component with Quantity Controls)
// ============================================================================

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  const formattedLineTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.lineTotal);

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock || newQuantity === quantity) {
      return;
    }

    setQuantity(newQuantity);
    startTransition(async () => {
      const result = await updateCartItem(item.id, newQuantity);
      if (!result.success) {
        // Revert on error
        setQuantity(item.quantity);
        alert(result.error || 'Failed to update quantity');
      }
    });
  };

  const handleRemove = () => {
    if (!confirm('Remove this item from your cart?')) {
      return;
    }

    setIsRemoving(true);
    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (!result.success) {
        setIsRemoving(false);
        alert(result.error || 'Failed to remove item');
      }
    });
  };

  if (isRemoving) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
        <span className="text-sm text-gray-500">Removing item...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Product Image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
      >
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          sizes="96px"
          className="object-cover object-center"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                <Link href={`/products/${item.productSlug}`} className="hover:text-blue-600">
                  {item.productName}
                </Link>
              </h3>
              {item.variantDetails && (
                <p className="mt-1 text-xs text-gray-500">{item.variantDetails}</p>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900">{formattedLineTotal}</p>
          </div>
          <p className="mt-1 text-xs text-gray-600">{formattedPrice} each</p>
        </div>

        {/* Quantity Controls and Remove Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${item.id}`} className="sr-only">
              Quantity
            </label>
            <div className="flex items-center rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={isPending || quantity <= 1}
                className="px-2 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                id={`quantity-${item.id}`}
                type="number"
                min="1"
                max={item.stock}
                value={quantity}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  handleUpdateQuantity(newQty);
                }}
                disabled={isPending}
                className="w-12 border-x border-gray-300 py-1 text-center text-sm font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleUpdateQuantity(quantity + 1)}
                disabled={isPending || quantity >= item.stock}
                className="px-2 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {quantity >= item.stock && (
              <span className="text-xs text-red-600">Max stock</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
