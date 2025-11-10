import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().nullable(),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('US'),
  phone: z.string().min(10, 'Valid phone number is required'),
  isDefault: z.boolean().default(false),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const productFilterSchema = z.object({
  categoryId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============================================================================
// CART SCHEMAS
// ============================================================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const checkoutSchema = z.object({
  shippingAddress: addressSchema.omit({ label: true, isDefault: true }),
  billingAddress: addressSchema.omit({ label: true, isDefault: true }).optional(),
  useSameAddress: z.boolean().default(true),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().max(1000).optional(),
});

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(100).optional(),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be at most 2000 characters'),
});

export const updateReviewSchema = createReviewSchema
  .omit({ productId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

// ============================================================================
// PROMO CODE SCHEMAS
// ============================================================================

export const createPromoCodeSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20)
    .regex(/^[A-Z0-9-_]+$/, 'Code must be uppercase alphanumeric with hyphens or underscores'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(0.01, 'Discount value must be greater than 0'),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();

export const applyPromoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
});

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;
export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeSchema>;
export type ApplyPromoCodeInput = z.infer<typeof applyPromoCodeSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
