import Link from 'next/link';
import { getFeaturedProducts } from '@/services/products';
import { ProductGrid } from '@/components/products/product-grid';

// ============================================================================
// HOMEPAGE (Server Component)
// ============================================================================

export const metadata = {
  title: 'Home | Shopping App',
  description: 'Browse our collection of quality products',
};

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-24 text-white shadow-xl sm:px-12 lg:px-16">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Shopping App
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100 sm:text-xl">
            Discover quality products at great prices. Shop our curated selection and enjoy free shipping on orders over $50.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Shop Now
            </Link>
            <Link
              href="/products?sortBy=newest"
              className="rounded-lg border-2 border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              New Arrivals
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 left-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Free Shipping</h3>
          <p className="mt-2 text-sm text-gray-600">On all orders over $50</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Secure Checkout</h3>
          <p className="mt-2 text-sm text-gray-600">SSL encrypted payments</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">30-Day Returns</h3>
          <p className="mt-2 text-sm text-gray-600">Hassle-free returns</p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Featured Products</h2>
            <p className="mt-2 text-gray-600">Check out our handpicked selection</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all products →
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          emptyMessage="No featured products available at the moment"
        />
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-gray-100 px-6 py-16 text-center sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Ready to start shopping?
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Browse our full catalog and find exactly what you need
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Browse All Products
        </Link>
      </section>
    </div>
  );
}
