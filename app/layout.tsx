import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
        </SessionProvider>
      </body>
    </html>
  );
}
