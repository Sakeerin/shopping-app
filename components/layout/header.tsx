import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ShoppingCart, User, Search } from 'lucide-react';
import { getCartItemCount } from '@/services/cart';

// ============================================================================
// T184: HEADER COMPONENT (Phase 9 - Polish & Cross-Cutting Concerns)
// ============================================================================

export async function Header() {
  const session = await getServerSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  // Get cart count if user is logged in
  const cartCount = userId ? await getCartItemCount(userId) : 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar with logo, search, and actions */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900">Shopping App</span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden flex-1 max-w-lg md:block">
            <form action="/search" method="GET" className="relative">
              <label htmlFor="search" className="sr-only">
                Search products
              </label>
              <input
                id="search"
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-gray-700 hover:text-primary"
              aria-label={`Shopping cart${cartCount > 0 ? ` with ${cartCount} items` : ''}`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-primary"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {session.user.name || 'Account'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 hidden w-48 rounded-md border bg-white py-1 shadow-lg group-hover:block">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="my-1 border-t" />
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-primary hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <div className="my-1 border-t" />
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-gray-700 hover:text-primary"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t py-3" aria-label="Main navigation">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li>
              <Link href="/products" className="text-gray-700 hover:text-primary">
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/electronics"
                className="text-gray-700 hover:text-primary"
              >
                Electronics
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/clothing"
                className="text-gray-700 hover:text-primary"
              >
                Clothing
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/home"
                className="text-gray-700 hover:text-primary"
              >
                Home & Garden
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/sports"
                className="text-gray-700 hover:text-primary"
              >
                Sports
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Search */}
        <div className="border-t py-3 md:hidden">
          <form action="/search" method="GET" className="relative">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <input
              id="mobile-search"
              type="search"
              name="q"
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
