# Accessibility Guide

## T194-T197: Accessibility Implementation (Phase 9 - Accessibility)

This document outlines the accessibility features and compliance measures implemented in the e-commerce platform to meet WCAG 2.1 AA standards.

## Accessibility Testing

### Automated Testing with @axe-core/playwright

We use @axe-core/playwright for automated accessibility testing:

```bash
npm install --save-dev @axe-core/playwright axe-core
```

Test file: [e2e/accessibility.spec.ts](../e2e/accessibility.spec.ts)

**Test Coverage:**
- Homepage accessibility scan
- Products page accessibility scan
- Cart page accessibility scan
- Login page accessibility scan
- Register page accessibility scan
- Account page accessibility scan
- Keyboard navigation tests
- Focus management tests
- ARIA labels and roles validation

**Running Tests:**
```bash
npx playwright test e2e/accessibility.spec.ts
```

## Implemented Accessibility Features

### 1. Skip Links (T197)

**Location:** [app/(shop)/layout.tsx](../app/(shop)/layout.tsx)

Keyboard users can skip directly to main content by pressing Tab on page load:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white..."
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1} className="flex-1">
  {children}
</main>
```

**Features:**
- Hidden by default using `sr-only` (screen reader only)
- Visible on keyboard focus
- Positioned at top of page with high z-index
- Clear visual styling when focused
- Proper focus outline with ring

### 2. ARIA Labels and Landmarks (T195)

#### Navigation Landmarks

**Header Navigation** - [components/layout/header.tsx](../components/layout/header.tsx)
```tsx
<nav className="border-t py-3" aria-label="Main navigation">
  <ul className="flex items-center gap-6 text-sm font-medium">
    {/* Navigation items */}
  </ul>
</nav>
```

**Footer** - [components/layout/footer.tsx](../components/layout/footer.tsx)
```tsx
<footer className="border-t bg-gray-50">
  {/* Footer content */}
</footer>
```

#### Interactive Elements

**Search Input**
```tsx
<label htmlFor="search" className="sr-only">
  Search products
</label>
<input
  id="search"
  type="search"
  name="q"
  placeholder="Search products..."
  aria-label="Search products"
/>
```

**Shopping Cart Link**
```tsx
<Link
  href="/cart"
  aria-label={`Shopping cart${cartCount > 0 ? ` with ${cartCount} items` : ''}`}
>
  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
  {cartCount > 0 && (
    <span aria-label={`${cartCount} items in cart`}>
      {cartCount > 9 ? '9+' : cartCount}
    </span>
  )}
</Link>
```

**User Menu**
```tsx
<button
  className="flex items-center gap-2"
  aria-label="User menu"
  aria-haspopup="true"
>
  <User className="h-5 w-5" aria-hidden="true" />
</button>
```

**Social Media Links**
```tsx
<a
  href="https://facebook.com"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Facebook"
>
  <Facebook className="h-5 w-5" aria-hidden="true" />
</a>
```

**Icon-Only Buttons**
```tsx
<button
  type="button"
  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
  aria-label="Decrease quantity"
>
  <svg className="h-4 w-4">...</svg>
</button>
```

### 3. Keyboard Navigation (T196)

#### Focus Management

**Visible Focus Indicators:**
- All interactive elements have visible focus rings using Tailwind's `focus:ring-2` and `focus:ring-offset-2`
- Focus rings use brand color (blue-600) for consistency
- Disabled buttons show reduced opacity and cursor-not-allowed

**Product Filters** - [components/products/product-filters.tsx](../components/products/product-filters.tsx)
```tsx
<div role="group" aria-label="Categories">
  <button
    onClick={() => toggleSection('categories')}
    aria-expanded={expandedSections.categories}
  >
    <h3>Categories</h3>
  </button>
</div>
```

#### Keyboard Shortcuts

**Rating Stars Component** - [components/reviews/rating-stars.tsx](../components/reviews/rating-stars.tsx)
- Arrow Left/Right: Navigate between stars
- Enter/Space: Select rating
- Tab: Move to next focusable element

```tsx
const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onRatingChange(value);
  } else if (e.key === 'ArrowRight' && value < 5) {
    e.preventDefault();
    setFocusRating(value + 1);
  } else if (e.key === 'ArrowLeft' && value > 1) {
    e.preventDefault();
    setFocusRating(value - 1);
  }
};
```

**Pagination Component** - [components/shared/pagination.tsx](../components/shared/pagination.tsx)
- All page links are keyboard accessible
- Previous/Next buttons have proper ARIA labels
- Current page marked with `aria-current="page"`

```tsx
<Link
  href={createPageURL(pageNumber)}
  aria-label={`Go to page ${pageNumber}`}
  aria-current={isActive ? 'page' : undefined}
>
  {pageNumber}
</Link>
```

### 4. Images and Alternative Text

**Product Images** - [components/products/product-card.tsx](../components/products/product-card.tsx)
```tsx
<Image
  src={primaryImage}
  alt={name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

**Decorative Icons:**
All decorative icons use `aria-hidden="true"`:
```tsx
<ShoppingCart className="h-5 w-5" aria-hidden="true" />
```

### 5. Forms and Inputs

**Associated Labels:**
All form inputs have associated labels using `htmlFor`:

```tsx
<label htmlFor="quantity" className="text-sm font-medium">
  Quantity:
</label>
<input
  id="quantity"
  name="quantity"
  type="number"
  min="1"
  max="99"
/>
```

**Form Validation:**
Error messages use `role="alert"` for screen reader announcements:

```tsx
<div
  className="rounded-lg p-3 text-sm"
  role="alert"
>
  {message.text}
</div>
```

### 6. Color Contrast

All text meets WCAG 2.1 AA contrast requirements:

- **Primary text:** Gray-900 on white background (contrast ratio > 12:1)
- **Secondary text:** Gray-600 on white background (contrast ratio > 7:1)
- **Buttons:** White text on blue-600 background (contrast ratio > 4.5:1)
- **Focus indicators:** Blue-600 ring with 2px offset

### 7. Semantic HTML

**Proper Heading Hierarchy:**
- `<h1>` for page titles
- `<h2>` for major sections
- `<h3>` for subsections
- No skipped heading levels

**Semantic Elements:**
- `<header>` for site header
- `<nav>` for navigation
- `<main>` for main content
- `<footer>` for site footer
- `<article>` for blog posts/reviews
- `<section>` for thematic groupings

## Browser and Screen Reader Testing

### Recommended Testing Combinations

**Windows:**
- Chrome + NVDA
- Firefox + NVDA
- Edge + JAWS

**macOS:**
- Safari + VoiceOver
- Chrome + VoiceOver

**Mobile:**
- iOS Safari + VoiceOver
- Android Chrome + TalkBack

### Manual Testing Checklist

- [ ] Navigate entire site using only keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Test with screen reader on all major pages
- [ ] Verify all images have appropriate alt text
- [ ] Check color contrast for all text and interactive elements
- [ ] Ensure forms can be completed without mouse
- [ ] Verify error messages are announced to screen readers
- [ ] Test zoom to 200% without horizontal scrolling
- [ ] Verify focus is visible on all interactive elements
- [ ] Check that disabled buttons cannot receive focus
- [ ] Test skip link functionality

## Automated Testing Tools

### Browser Extensions

**Chrome/Edge:**
- [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built-in)
- [WAVE](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)

**Firefox:**
- [axe DevTools](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)
- [WAVE](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)

### CI/CD Integration

Add accessibility checks to your CI pipeline:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install
      - name: Run accessibility tests
        run: npx playwright test e2e/accessibility.spec.ts
```

## Common Issues and Solutions

### Missing Alt Text
**Problem:** Images without alt attributes
**Solution:** Add descriptive alt text to all images

```tsx
// ❌ Bad
<img src="product.jpg" />

// ✅ Good
<Image src="product.jpg" alt="Blue wireless headphones" />
```

### Poor Color Contrast
**Problem:** Text that's hard to read
**Solution:** Ensure minimum 4.5:1 contrast for normal text, 3:1 for large text

```tsx
// ❌ Bad - Gray-400 on white (low contrast)
<p className="text-gray-400">Important text</p>

// ✅ Good - Gray-900 on white (high contrast)
<p className="text-gray-900">Important text</p>
```

### No Keyboard Access
**Problem:** Interactive elements that can't be accessed via keyboard
**Solution:** Use semantic HTML or add proper ARIA roles and tabindex

```tsx
// ❌ Bad - div click handler without keyboard support
<div onClick={handleClick}>Click me</div>

// ✅ Good - button element with built-in keyboard support
<button onClick={handleClick}>Click me</button>
```

### Missing Form Labels
**Problem:** Inputs without associated labels
**Solution:** Use htmlFor attribute to associate labels

```tsx
// ❌ Bad
<input type="text" name="email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="text" name="email" />
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

## Compliance Statement

This e-commerce platform strives to conform to Level AA of the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines 2.1. These guidelines explain how to make web content accessible to people with disabilities.

We continuously test our application for accessibility issues and address any problems found. If you encounter any accessibility barriers, please contact us at accessibility@example.com.

**Last Updated:** 2025-11-21
**Accessibility Testing Status:** ✅ Passed automated axe-core tests
**Manual Testing Status:** Pending user acceptance testing
**WCAG Compliance Level:** AA (Target)
