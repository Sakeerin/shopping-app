import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-gray-900">404</CardTitle>
          <CardDescription className="text-lg">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
