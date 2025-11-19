import { test, expect } from '@playwright/test';

// ============================================================================
// T141: ADMIN OPERATIONS E2E TESTS (Phase 7 - User Story 6)
// ============================================================================

test.describe('Admin Operations', () => {
  // Admin credentials for testing
  const adminEmail = 'admin@test.com';
  const adminPassword = 'Admin123!';

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display admin dashboard with metrics', async ({ page }) => {
    await page.goto('/admin');

    // Check for dashboard metrics cards
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Total Customers')).toBeVisible();
    await expect(page.locator('text=Active Products')).toBeVisible();
  });

  test('should create a new product', async ({ page }) => {
    await page.goto('/admin/products');
    await page.click('text=Add Product');

    // Fill product form
    await page.fill('input[name="name"]', 'Test E2E Product');
    await page.fill('input[name="slug"]', 'test-e2e-product');
    await page.fill('textarea[name="description"]', 'This is a test product created via E2E test');
    await page.fill('input[name="price"]', '99.99');
    await page.fill('input[name="stock"]', '100');

    // Select category
    await page.selectOption('select[name="categoryId"]', { index: 1 });

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Product created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/products/);
  });

  test('should update product inventory', async ({ page }) => {
    await page.goto('/admin/products');

    // Click edit on first product
    await page.click('[data-testid="edit-product"]:first-of-type');

    // Update stock
    const stockInput = page.locator('input[name="stock"]');
    await stockInput.clear();
    await stockInput.fill('150');

    // Save changes
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Product updated successfully')).toBeVisible();
  });

  test('should update order status', async ({ page }) => {
    await page.goto('/admin/orders');

    // Click on first order
    await page.click('[data-testid="order-row"]:first-of-type');

    // Change status to SHIPPED
    await page.selectOption('select[name="status"]', 'SHIPPED');
    await page.click('button:has-text("Update Status")');

    // Verify success
    await expect(page.locator('text=Order status updated')).toBeVisible();
    await expect(page.locator('text=SHIPPED')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/admin/orders');

    // Select PENDING filter
    await page.selectOption('select[name="statusFilter"]', 'PENDING');

    // Wait for results
    await page.waitForSelector('[data-testid="order-row"]');

    // All visible orders should be PENDING
    const orderStatuses = await page.locator('[data-testid="order-status"]').allTextContents();
    orderStatuses.forEach((status) => {
      expect(status).toContain('PENDING');
    });
  });

  test('should view customer list', async ({ page }) => {
    await page.goto('/admin/customers');

    // Check page loaded
    await expect(page.locator('h1:has-text("Customers")')).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Orders")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Spent")')).toBeVisible();
  });

  test('should view analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check page loaded
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();

    // Check for charts
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
  });

  test('should create promo code', async ({ page }) => {
    await page.goto('/admin/promotions');
    await page.click('text=Create Promo Code');

    // Fill promo code form
    await page.fill('input[name="code"]', 'TEST20');
    await page.selectOption('select[name="discountType"]', 'PERCENTAGE');
    await page.fill('input[name="discountValue"]', '20');
    await page.fill('input[name="minPurchase"]', '50');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Promo code created')).toBeVisible();
  });

  test('should delete product (soft delete)', async ({ page }) => {
    await page.goto('/admin/products');

    // Get initial product count
    const initialCount = await page.locator('[data-testid="product-row"]').count();

    // Click delete on first product
    await page.click('[data-testid="delete-product"]:first-of-type');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify success
    await expect(page.locator('text=Product deleted')).toBeVisible();

    // Product should be removed from list
    const newCount = await page.locator('[data-testid="product-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should navigate using admin sidebar', async ({ page }) => {
    await page.goto('/admin');

    // Click on Products in sidebar
    await page.click('nav a:has-text("Products")');
    await expect(page).toHaveURL(/\/admin\/products/);

    // Click on Orders in sidebar
    await page.click('nav a:has-text("Orders")');
    await expect(page).toHaveURL(/\/admin\/orders/);

    // Click on Customers in sidebar
    await page.click('nav a:has-text("Customers")');
    await expect(page).toHaveURL(/\/admin\/customers/);

    // Click on Analytics in sidebar
    await page.click('nav a:has-text("Analytics")');
    await expect(page).toHaveURL(/\/admin\/analytics/);
  });

  test('should prevent non-admin access', async ({ page }) => {
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Try to access admin without login
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/admin/products');

    // Enter search query
    await page.fill('input[placeholder*="Search"]', 'laptop');

    // Wait for results
    await page.waitForTimeout(500);

    // Check that results are filtered
    const productNames = await page.locator('[data-testid="product-name"]').allTextContents();
    productNames.forEach((name) => {
      expect(name.toLowerCase()).toContain('laptop');
    });
  });

  test('should paginate through orders', async ({ page }) => {
    await page.goto('/admin/orders');

    // Check pagination exists
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

    // Click next page
    await page.click('button:has-text("Next")');

    // URL should contain page parameter
    await expect(page).toHaveURL(/page=2/);
  });
});
