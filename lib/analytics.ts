import { track } from '@vercel/analytics';

// ============================================================================
// T204: CUSTOM EVENT TRACKING (Phase 9 - Monitoring & Analytics)
// ============================================================================

/**
 * Custom analytics events for business metrics tracking
 * Integrates with Vercel Analytics for data collection
 */

// ============================================================================
// E-COMMERCE EVENTS
// ============================================================================

/**
 * Track when a user views a product
 */
export function trackProductView(productId: string, productName: string, price: number, category?: string) {
  track('product_view', {
    product_id: productId,
    product_name: productName,
    price,
    category: category || 'unknown',
  });
}

/**
 * Track when a user adds a product to cart
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number,
  category?: string
) {
  track('add_to_cart', {
    product_id: productId,
    product_name: productName,
    price,
    quantity,
    total_value: price * quantity,
    category: category || 'unknown',
  });
}

/**
 * Track when a user removes a product from cart
 */
export function trackRemoveFromCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number
) {
  track('remove_from_cart', {
    product_id: productId,
    product_name: productName,
    price,
    quantity,
    total_value: price * quantity,
  });
}

/**
 * Track when a user updates cart item quantity
 */
export function trackUpdateCartQuantity(
  productId: string,
  oldQuantity: number,
  newQuantity: number,
  price: number
) {
  track('update_cart_quantity', {
    product_id: productId,
    old_quantity: oldQuantity,
    new_quantity: newQuantity,
    price,
    old_value: price * oldQuantity,
    new_value: price * newQuantity,
  });
}

/**
 * Track when a user applies a promo code
 */
export function trackPromoCodeApplied(code: string, discount: number, success: boolean) {
  track('promo_code_applied', {
    code,
    discount,
    success,
  });
}

/**
 * Track when a user starts the checkout process
 */
export function trackCheckoutStarted(cartValue: number, itemCount: number) {
  track('checkout_started', {
    cart_value: cartValue,
    item_count: itemCount,
  });
}

/**
 * Track when a user completes checkout information
 */
export function trackCheckoutInfoCompleted(step: 'shipping' | 'payment', cartValue: number) {
  track('checkout_info_completed', {
    step,
    cart_value: cartValue,
  });
}

/**
 * Track successful purchase
 */
export function trackPurchaseCompleted(
  orderId: string,
  orderValue: number,
  itemCount: number,
  paymentMethod: string,
  promoCode?: string,
  discount?: number
) {
  track('purchase_completed', {
    order_id: orderId,
    order_value: orderValue,
    item_count: itemCount,
    payment_method: paymentMethod,
    promo_code: promoCode || null,
    discount: discount || 0,
    net_value: orderValue - (discount || 0),
  });
}

/**
 * Track failed purchase attempt
 */
export function trackPurchaseFailed(
  cartValue: number,
  itemCount: number,
  errorReason: string,
  paymentMethod?: string
) {
  track('purchase_failed', {
    cart_value: cartValue,
    item_count: itemCount,
    error_reason: errorReason,
    payment_method: paymentMethod || 'unknown',
  });
}

// ============================================================================
// USER ENGAGEMENT EVENTS
// ============================================================================

/**
 * Track when a user performs a search
 */
export function trackSearch(query: string, resultsCount: number) {
  track('search', {
    query,
    results_count: resultsCount,
  });
}

/**
 * Track when a user filters products
 */
export function trackProductFilter(filterType: string, filterValue: string, resultsCount: number) {
  track('product_filter', {
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount,
  });
}

/**
 * Track when a user sorts products
 */
export function trackProductSort(sortBy: string) {
  track('product_sort', {
    sort_by: sortBy,
  });
}

/**
 * Track when a user submits a review
 */
export function trackReviewSubmitted(
  productId: string,
  rating: number,
  hasComment: boolean,
  isVerifiedPurchase: boolean
) {
  track('review_submitted', {
    product_id: productId,
    rating,
    has_comment: hasComment,
    is_verified_purchase: isVerifiedPurchase,
  });
}

/**
 * Track when a user marks a review as helpful
 */
export function trackReviewHelpful(reviewId: string, productId: string) {
  track('review_helpful', {
    review_id: reviewId,
    product_id: productId,
  });
}

// ============================================================================
// AUTHENTICATION EVENTS
// ============================================================================

/**
 * Track user registration
 */
export function trackUserRegistration(method: 'email' | 'google' | 'github') {
  track('user_registration', {
    method,
  });
}

/**
 * Track user login
 */
export function trackUserLogin(method: 'email' | 'google' | 'github') {
  track('user_login', {
    method,
  });
}

/**
 * Track password reset request
 */
export function trackPasswordResetRequested() {
  track('password_reset_requested');
}

/**
 * Track password reset completion
 */
export function trackPasswordResetCompleted(success: boolean) {
  track('password_reset_completed', {
    success,
  });
}

// ============================================================================
// ACCOUNT MANAGEMENT EVENTS
// ============================================================================

/**
 * Track profile update
 */
export function trackProfileUpdated(fieldsUpdated: string[]) {
  track('profile_updated', {
    fields_updated: fieldsUpdated.join(','),
    field_count: fieldsUpdated.length,
  });
}

/**
 * Track address addition
 */
export function trackAddressAdded(addressType: 'shipping' | 'billing' | 'both') {
  track('address_added', {
    address_type: addressType,
  });
}

/**
 * Track address update
 */
export function trackAddressUpdated(addressId: string) {
  track('address_updated', {
    address_id: addressId,
  });
}

/**
 * Track wishlist addition
 */
export function trackAddToWishlist(productId: string, productName: string, price: number) {
  track('add_to_wishlist', {
    product_id: productId,
    product_name: productName,
    price,
  });
}

// ============================================================================
// ADMIN EVENTS
// ============================================================================

/**
 * Track product creation (admin)
 */
export function trackProductCreated(productId: string, category: string) {
  track('product_created', {
    product_id: productId,
    category,
  });
}

/**
 * Track product update (admin)
 */
export function trackProductUpdated(productId: string, fieldsUpdated: string[]) {
  track('product_updated', {
    product_id: productId,
    fields_updated: fieldsUpdated.join(','),
  });
}

/**
 * Track order status update (admin)
 */
export function trackOrderStatusUpdated(orderId: string, oldStatus: string, newStatus: string) {
  track('order_status_updated', {
    order_id: orderId,
    old_status: oldStatus,
    new_status: newStatus,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track client-side errors
 */
export function trackError(errorType: string, errorMessage: string, errorContext?: Record<string, any>) {
  track('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...errorContext,
  });
}

/**
 * Track 404 errors
 */
export function track404(path: string) {
  track('page_not_found', {
    path,
  });
}

// ============================================================================
// PERFORMANCE EVENTS
// ============================================================================

/**
 * Track slow page loads
 */
export function trackSlowPageLoad(page: string, loadTime: number) {
  if (loadTime > 3000) {
    // Only track if > 3 seconds
    track('slow_page_load', {
      page,
      load_time: loadTime,
    });
  }
}

/**
 * Track API call performance
 */
export function trackApiPerformance(endpoint: string, duration: number, success: boolean) {
  track('api_performance', {
    endpoint,
    duration,
    success,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Track custom event with arbitrary data
 */
export function trackCustomEvent(eventName: string, eventData?: Record<string, any>) {
  track(eventName, eventData);
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
}
