'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// T135: PRODUCT FILTERS COMPONENT (Phase 6 - User Story 3)
// ============================================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface FilterState {
  categoryIds: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
}

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  className?: string;
}

export function ProductFilters({
  categories,
  onFilterChange,
  initialFilters,
  className = '',
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categoryIds: initialFilters?.categoryIds || [],
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    inStock: initialFilters?.inStock || false,
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds };
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFilters((prev) => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
    }));
  };

  const handleStockToggle = () => {
    setFilters((prev) => ({ ...prev, inStock: !prev.inStock }));
  };

  const handleClearAll = () => {
    setFilters({
      categoryIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    filters.categoryIds.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={handleClearAll}
          disabled={!hasActiveFilters}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear all
        </button>
      </div>

      {/* Categories Filter */}
      <div role="group" aria-label="Categories" className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={expandedSections.categories}
        >
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              expandedSections.categories ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.categories && (
          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
              >
                <input
                  type="checkbox"
                  checked={filters.categoryIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Filter by ${category.name}`}
                />
                <span className="text-sm text-gray-700">
                  {category.name}
                  <span className="ml-1 text-gray-500">({category.productCount})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div role="group" aria-label="Price Range" className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={expandedSections.price}
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.price && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="min-price" className="block text-xs text-gray-600 mb-1">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="min-price"
                  min="0"
                  step="0.01"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="max-price" className="block text-xs text-gray-600 mb-1">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="max-price"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="999.99"
                  className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div role="group" aria-label="Availability" className="pb-6">
        <button
          onClick={() => toggleSection('availability')}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={expandedSections.availability}
        >
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              expandedSections.availability ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.availability && (
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={handleStockToggle}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="In Stock Only"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-40 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
        aria-label="Toggle Filters"
      >
        Filters {hasActiveFilters && `(${filters.categoryIds.length + (filters.inStock ? 1 : 0)})`}
      </button>
    </div>
  );
}
