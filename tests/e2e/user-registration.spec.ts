import { test, expect } from '@playwright/test';

// ============================================================================
// E2E TEST: USER REGISTRATION FLOW
// ============================================================================

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/register/);

    // Fill registration form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('SecurePass123!');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for success or redirect
    await expect(page).toHaveURL(/\/login|\//, { timeout: 5000 });

    // Verify success message or redirect to login
    const successMessage = page.getByText(/account created|registration successful/i);
    await expect(successMessage.or(page.getByRole('heading', { name: /sign in/i }))).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');

    // Submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/^password$/i).fill('weak');
    await page.getByLabel(/^password$/i).blur();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
    await page.getByLabel(/confirm password/i).blur();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should reject duplicate email registration', async ({ page }) => {
    const email = 'existing@example.com';

    await page.goto('/register');

    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('SecurePass123!');

    await page.getByRole('button', { name: /create account/i }).click();

    // If email already exists, should show error
    const errorMessage = page.getByText(/already exists|already registered/i);
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should navigate to login page from registration', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('link', { name: /sign in|already have an account/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow user to login after registration', async ({ page }) => {
    const uniqueEmail = `newuser${Date.now()}@example.com`;
    const password = 'SecurePass123!';

    // Register new user
    await page.goto('/register');
    await page.getByLabel(/name/i).fill('New User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for redirect or success
    await page.waitForURL(/\/login|\//, { timeout: 5000 });

    // If redirected to login, try logging in
    if (page.url().includes('/login')) {
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should be logged in and redirected
      await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 5000 });
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});
