'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// T134: PRODUCT SEARCH COMPONENT (Phase 6 - User Story 3)
// ============================================================================

interface AutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface AutocompleteCategory {
  id: string;
  name: string;
  slug: string;
}

interface AutocompleteResults {
  products: AutocompleteProduct[];
  categories: AutocompleteCategory[];
}

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function ProductSearch({ onSearch, className = '' }: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced autocomplete fetch
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !results) return;

    const totalItems = results.products.length + results.categories.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          // Navigate to selected item
          if (selectedIndex < results.categories.length) {
            const category = results.categories[selectedIndex];
            router.push(`/products/category/${category.slug}`);
          } else {
            const product = results.products[selectedIndex - results.categories.length];
            router.push(`/products/${product.slug}`);
          }
          setShowDropdown(false);
        }
        break;
    }
  };

  const hasResults = results && (results.products.length > 0 || results.categories.length > 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && hasResults && setShowDropdown(true)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoComplete="off"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isLoading && (
            <div
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
              role="status"
              aria-label="Loading"
            />
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && hasResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="border-b border-gray-100 p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                Categories
              </div>
              {results.categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  className={`block rounded px-3 py-2 text-sm hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="font-medium text-gray-900">{category.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                Products
              </div>
              {results.products.map((product, index) => {
                const itemIndex = results.categories.length + index;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-gray-50 ${
                      selectedIndex === itemIndex ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setShowDropdown(false)}
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showDropdown && results && !hasResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="text-center text-sm text-gray-600">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
