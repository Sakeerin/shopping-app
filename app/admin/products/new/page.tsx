import { prisma } from '@/lib/db';
import { ProductForm } from '@/components/admin/product-form';

// ============================================================================
// T161: ADD PRODUCT PAGE (Phase 7 - User Story 6)
// ============================================================================

export const metadata = {
  title: 'Add Product | Admin Dashboard',
  description: 'Create a new product',
};

export default async function NewProductPage() {
  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new product for your store
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ProductForm categories={categories} mode="create" />
      </div>
    </div>
  );
}
