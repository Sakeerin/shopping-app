// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_NAME = 'Shopping App';
export const APP_DESCRIPTION = 'Modern e-commerce platform';

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PRODUCTS_PER_PAGE = 20;
export const ORDERS_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 10;

// ============================================================================
// PRICING & CURRENCY
// ============================================================================

export const CURRENCY = 'USD';
export const TAX_RATE = 0.08; // 8% sales tax
export const FREE_SHIPPING_THRESHOLD = 50; // Free shipping over $50
export const FLAT_SHIPPING_RATE = 5.99; // $5.99 flat rate shipping

// ============================================================================
// PRODUCT CONSTRAINTS
// ============================================================================

export const MIN_PRODUCT_PRICE = 0.01;
export const MAX_PRODUCT_PRICE = 999999.99;
export const MAX_PRODUCT_IMAGES = 10;
export const MIN_PRODUCT_IMAGES = 1;
export const MAX_PRODUCT_NAME_LENGTH = 200;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 5000;

// ============================================================================
// ORDER CONSTRAINTS
// ============================================================================

export const MIN_ORDER_VALUE = 1.0;
export const MAX_ORDER_ITEMS = 50;
export const ORDER_NUMBER_PREFIX = 'ORD';

// ============================================================================
// REVIEW CONSTRAINTS
// ============================================================================

export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 2000;
export const MIN_REVIEW_RATING = 1;
export const MAX_REVIEW_RATING = 5;

// ============================================================================
// USER CONSTRAINTS
// ============================================================================

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 100;
export const MAX_ADDRESSES_PER_USER = 10;

// ============================================================================
// PROMO CODE CONSTRAINTS
// ============================================================================

export const MIN_PROMO_CODE_LENGTH = 3;
export const MAX_PROMO_CODE_LENGTH = 20;
export const MAX_DISCOUNT_PERCENTAGE = 100;

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const IMAGE_UPLOAD_FOLDER = 'products';

// ============================================================================
// SESSION & CACHE
// ============================================================================

export const SESSION_COOKIE_NAME = 'shopping-session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
export const CACHE_REVALIDATE_TIME = 60; // 60 seconds

// ============================================================================
// ROUTES
// ============================================================================

export const PUBLIC_ROUTES = ['/', '/products', '/about', '/contact'];

export const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/reset-password'];

export const PROTECTED_ROUTES = ['/profile', '/orders', '/wishlist', '/dashboard'];

export const ADMIN_ROUTES = ['/admin', '/admin/products', '/admin/orders', '/admin/users'];

// ============================================================================
// API RATE LIMITS
// ============================================================================

export const API_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
};

// ============================================================================
// STRIPE
// ============================================================================

export const STRIPE_CURRENCY = 'usd';
export const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
];

// ============================================================================
// EMAIL
// ============================================================================

export const EMAIL_FROM_NAME = 'Shopping App';
export const EMAIL_SUPPORT = 'support@shoppingapp.com';

// ============================================================================
// ORDER STATUS FLOW
// ============================================================================

export const ORDER_STATUS_FLOW = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
} as const;

// ============================================================================
// PAYMENT STATUS FLOW
// ============================================================================

export const PAYMENT_STATUS_FLOW = {
  PENDING: ['PROCESSING', 'FAILED'],
  PROCESSING: ['SUCCEEDED', 'FAILED'],
  SUCCEEDED: ['REFUNDED'],
  FAILED: [],
  REFUNDED: [],
} as const;

// ============================================================================
// PRODUCT SORT OPTIONS
// ============================================================================

export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
] as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED_TO_CART: 'Product added to cart successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ADDRESS_ADDED: 'Address added successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  PASSWORD_RESET: 'Password reset link sent to your email.',
} as const;
