import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ============================================================================
// T194: ACCESSIBILITY AUDIT (Phase 9 - Accessibility)
// ============================================================================

test.describe('Accessibility Audit', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('products page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('cart page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('register page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('account page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.goto('/account');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test('should navigate through main navigation using keyboard', async ({
    page,
  }) => {
    await page.goto('/');

    // Focus on first interactive element
    await page.keyboard.press('Tab');

    // Should be able to navigate to Products link
    const productsLink = page.getByRole('link', { name: /products/i });
    await expect(productsLink).toBeFocused();

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/products/);
  });

  test('should be able to use skip link to main content', async ({ page }) => {
    await page.goto('/');

    // Tab to skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();

    // Press Enter
    await page.keyboard.press('Enter');

    // Main content should be focused
    const main = page.locator('main');
    await expect(main).toBeFocused();
  });

  test('should navigate through form inputs using keyboard', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    // Tab through form
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Email input

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab'); // Password input
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab'); // Submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeFocused();
  });

  test('modal dialogs should trap focus', async ({ page }) => {
    await page.goto('/');

    // Open cart (if there's a cart modal)
    const cartButton = page.getByRole('button', { name: /cart/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Focus should be trapped in modal
      // Press Tab multiple times and ensure focus stays within modal
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement;
          const modal = active?.closest('[role="dialog"]');
          return modal !== null;
        });

        // Focus should still be within modal
        expect(focusedElement).toBe(true);
      }
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/');

    // Open cart modal if exists
    const cartButton = page.getByRole('button', { name: /cart/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Focus Management', () => {
  test('focus should be visible on all interactive elements', async ({
    page,
  }) => {
    await page.goto('/');

    // Tab through elements and verify focus ring is visible
    const interactiveElements = await page.locator('a, button, input').all();

    for (const element of interactiveElements.slice(0, 5)) {
      await element.focus();

      // Check if element has focus styles
      const hasFocusStyles = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.outlineWidth !== '0px' ||
          styles.boxShadow !== 'none'
        );
      });

      expect(hasFocusStyles).toBe(true);
    }
  });

  test('focus should return to trigger element after modal close', async ({
    page,
  }) => {
    await page.goto('/');

    const cartButton = page.getByRole('button', { name: /cart/i });
    if (await cartButton.isVisible()) {
      // Click cart button
      await cartButton.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Close modal
      await page.keyboard.press('Escape');

      // Focus should return to cart button
      await expect(cartButton).toBeFocused();
    }
  });
});

test.describe('ARIA Labels and Roles', () => {
  test('images should have alt text', async ({ page }) => {
    await page.goto('/products');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const accessibleName =
        (await button.getAttribute('aria-label')) ||
        (await button.textContent()) ||
        (await button.getAttribute('title'));

      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    }
  });

  test('form inputs should have associated labels', async ({ page }) => {
    await page.goto('/auth/login');

    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input should have either a label, aria-label, or aria-labelledby
      const hasLabel = id
        ? await page.locator(`label[for="${id}"]`).count() > 0
        : false;

      expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('navigation should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThan(0);

    // Check for contentinfo landmark (footer)
    const footer = page.locator('footer, [role="contentinfo"]');
    await expect(footer).toHaveCount(1);
  });

  test('icon-only buttons should have aria-label', async ({ page }) => {
    await page.goto('/');

    // Find buttons that might be icon-only (no text content)
    const iconButtons = await page
      .locator('button')
      .filter({ hasText: '' })
      .all();

    for (const button of iconButtons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      expect(ariaLabel || title).toBeTruthy();
    }
  });
});
