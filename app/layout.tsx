import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

// T191: Font optimization with next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use font-display: swap for better performance
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: 'Shopping App - Modern E-Commerce Platform',
    template: '%s | Shopping App',
  },
  description:
    'Discover amazing products at great prices. Shop electronics, clothing, books, and more.',
  keywords: ['ecommerce', 'shopping', 'online store', 'products'],
  authors: [{ name: 'Shopping App Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Shopping App - Modern E-Commerce Platform',
    description: 'Discover amazing products at great prices',
    siteName: 'Shopping App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopping App',
    description: 'Discover amazing products at great prices',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
          {/* T203: Vercel Analytics & Speed Insights */}
          <Analytics />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  );
}
