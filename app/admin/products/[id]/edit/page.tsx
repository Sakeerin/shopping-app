import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductForm } from '@/components/admin/product-form';

// ============================================================================
// T162: EDIT PRODUCT PAGE (Phase 7 - User Story 6)
// ============================================================================

export const metadata = {
  title: 'Edit Product | Admin Dashboard',
  description: 'Edit product details',
};

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;

  // Fetch product and categories
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-muted-foreground">
          Update product details for {product.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ProductForm
          categories={categories}
          initialData={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            stock: product.stock,
            images: product.images,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
          }}
          mode="edit"
        />
      </div>
    </div>
  );
}
