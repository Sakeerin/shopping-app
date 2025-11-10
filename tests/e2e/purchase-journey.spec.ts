import { test, expect } from '@playwright/test';

// ============================================================================
// E2E TEST: COMPLETE PURCHASE JOURNEY
// ============================================================================

test.describe('Complete Purchase Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should complete full purchase flow from product browse to order confirmation', async ({ page }) => {
    // Step 1: Browse products on homepage
    await expect(page.getByRole('heading', { name: 'Welcome to Shopping App' })).toBeVisible();
    await expect(page.getByText('Featured Products')).toBeVisible();

    // Click "Shop Now" button
    await page.getByRole('link', { name: 'Shop Now' }).click();
    await expect(page).toHaveURL(/\/products/);

    // Step 2: View product listing page
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });

    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();

    // Step 3: View product detail page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Add to Cart')).toBeVisible();

    // Step 4: Add product to cart
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Wait for success message
    await expect(page.getByText('Added to cart!')).toBeVisible({ timeout: 3000 });

    // Step 5: Navigate to cart
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Step 6: Proceed to checkout
    await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL(/\/checkout/);

    // Step 7: Fill checkout form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Street Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('State / Province').fill('TS');
    await page.getByLabel('Postal Code').fill('12345');
    await page.getByLabel('Phone Number').fill('555-1234');

    // Step 8: Place order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Step 9: Verify order confirmation
    await expect(page).toHaveURL(/\/orders\/ORD-/);
    await expect(page.getByText('Order Placed Successfully!')).toBeVisible();
    await expect(page.getByText(/Order #ORD-/)).toBeVisible();
  });

  test('should allow changing quantity in cart', async ({ page }) => {
    // Add product to cart (assuming cart already has items from previous test or seeded data)
    await page.goto('/cart');

    // Check if cart has items, if not, add one
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    if (cartItems === 0) {
      await page.goto('/products');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await page.goto('/cart');
    }

    // Get initial quantity
    const quantityInput = page.locator('input[type="number"]').first();
    const initialQuantity = await quantityInput.inputValue();

    // Increase quantity
    await page.getByLabel('Increase quantity').first().click();

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify quantity increased
    const newQuantity = await quantityInput.inputValue();
    expect(parseInt(newQuantity)).toBe(parseInt(initialQuantity) + 1);
  });

  test('should apply promo code at checkout', async ({ page }) => {
    // Navigate to checkout (assuming cart has items)
    await page.goto('/checkout');

    // Enter promo code
    await page.getByPlaceholder('Enter promo code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();

    // Wait for promo code application
    await expect(page.getByText(/Promo code will be applied/)).toBeVisible({ timeout: 3000 });
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');

    // Click on a category filter
    const firstCategory = page.locator('aside a').nth(1); // Skip "All Products"
    await firstCategory.click();

    // Wait for products to reload
    await page.waitForTimeout(1000);

    // Verify URL has category parameter
    await expect(page).toHaveURL(/categoryId=/);
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/products');

    // Enter search query
    await page.getByPlaceholder('Search products...').fill('test');
    await page.getByRole('button', { name: 'Search' }).click();

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify URL has search parameter
    await expect(page).toHaveURL(/search=test/);
  });

  test('should handle empty cart gracefully', async ({ page }) => {
    // Clear cart by removing all items
    await page.goto('/cart');

    // Remove all items if any exist
    while (await page.getByText('Remove').isVisible()) {
      await page.getByText('Remove').first().click();
      await page.getByRole('button', { name: 'OK' }).click(); // Confirm removal
      await page.waitForTimeout(500);
    }

    // Verify empty cart message
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Shopping' })).toBeVisible();
  });

  test('should validate required fields in checkout form', async ({ page }) => {
    // Navigate to checkout with items in cart
    await page.goto('/checkout');

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Verify HTML5 validation messages appear (form doesn't submit)
    await expect(page).toHaveURL(/\/checkout/); // Still on checkout page
  });

  test('should navigate between pages using breadcrumbs', async ({ page }) => {
    // Go to product detail
    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().click();

    // Verify breadcrumbs exist
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();

    // Click breadcrumb to go back to products
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products/);
  });
});
