import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

// ============================================================================
// T185: FOOTER COMPONENT (Phase 9 - Polish & Cross-Cutting Concerns)
// ============================================================================

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Shopping App
            </h3>
            <p className="text-sm text-gray-600">
              Your one-stop shop for quality products at great prices.
            </p>
            {/* Social Links */}
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products/category/electronics"
                  className="text-gray-600 hover:text-primary"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/products/category/clothing"
                  className="text-gray-600 hover:text-primary"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/products/category/home"
                  className="text-gray-600 hover:text-primary"
                >
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  href="/products/category/sports"
                  className="text-gray-600 hover:text-primary"
                >
                  Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-primary">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-primary">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-gray-600 hover:text-primary"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600">
              © {currentYear} Shopping App. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Accepted Payment Methods:</span>
              <div className="flex items-center gap-2">
                <span className="rounded border px-2 py-1 text-xs font-medium">
                  VISA
                </span>
                <span className="rounded border px-2 py-1 text-xs font-medium">
                  MC
                </span>
                <span className="rounded border px-2 py-1 text-xs font-medium">
                  AMEX
                </span>
                <span className="rounded border px-2 py-1 text-xs font-medium">
                  DISCOVER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
