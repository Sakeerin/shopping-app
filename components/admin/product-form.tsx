'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { createProduct, updateProduct } from '@/actions/products';
import { ImageUpload } from './image-upload';

// ============================================================================
// T154: PRODUCT FORM COMPONENT (Phase 7 - User Story 6)
// ============================================================================

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: Partial<ProductFormData> & { id?: string };
  mode?: 'create' | 'edit';
}

export function ProductForm({
  categories,
  initialData,
  mode = 'create',
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      categoryId: initialData?.categoryId || '',
      stock: initialData?.stock || 0,
      images: initialData?.images || [],
      isFeatured: initialData?.isFeatured || false,
      isActive: initialData?.isActive !== false,
    },
  });

  const images = watch('images');

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        mode === 'create'
          ? await createProduct(data)
          : await updateProduct(initialData?.id!, data);

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground"
        >
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-foreground"
        >
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          {...register('slug')}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-invalid={errors.slug ? 'true' : 'false'}
          aria-describedby={errors.slug ? 'slug-error' : undefined}
        />
        {errors.slug && (
          <p id="slug-error" className="mt-1 text-sm text-red-600">
            {errors.slug.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-foreground"
          >
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-invalid={errors.price ? 'true' : 'false'}
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
          {errors.price && (
            <p id="price-error" className="mt-1 text-sm text-red-600">
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-foreground"
          >
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-invalid={errors.stock ? 'true' : 'false'}
            aria-describedby={errors.stock ? 'stock-error' : undefined}
          />
          {errors.stock && (
            <p id="stock-error" className="mt-1 text-sm text-red-600">
              {errors.stock.message}
            </p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-foreground"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-invalid={errors.categoryId ? 'true' : 'false'}
          aria-describedby={errors.categoryId ? 'categoryId-error' : undefined}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p id="categoryId-error" className="mt-1 text-sm text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground">
          Product Images <span className="text-red-500">*</span>
        </label>
        <ImageUpload
          value={images}
          onChange={(urls) => setValue('images', urls)}
          maxImages={5}
        />
        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
        )}
      </div>

      {/* Featured and Active Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="isFeatured"
            type="checkbox"
            {...register('isFeatured')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-foreground">
            Featured Product
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-foreground">
            Active (visible to customers)
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}
