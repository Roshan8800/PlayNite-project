const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Tests', () => {
  test('Login page should pass accessibility checks', async ({ page }) => {
    await page.goto('http://localhost:9002/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Signup page should pass accessibility checks', async ({ page }) => {
    await page.goto('http://localhost:9002/signup');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Home page should pass accessibility checks', async ({ page }) => {
    await page.goto('http://localhost:9002/home');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Search page should pass accessibility checks', async ({ page }) => {
    await page.goto('http://localhost:9002/search?q=test');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Semantic landmarks are present on home page', async ({ page }) => {
    await page.goto('http://localhost:9002/home');

    // Check for header landmark
    await expect(page.locator('header[role="banner"]')).toBeVisible();

    // Check for main landmark
    await expect(page.locator('main[role="main"]')).toBeVisible();

    // Check for aside landmark
    await expect(page.locator('aside[role="complementary"]')).toBeVisible();

    // Check for footer landmark
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();

    // Check for navigation landmarks
    await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
  });

  test('Semantic landmarks are present on search page', async ({ page }) => {
    await page.goto('http://localhost:9002/search?q=test');

    // Check for header landmark
    await expect(page.locator('header[role="banner"]')).toBeVisible();

    // Check for main landmark
    await expect(page.locator('main[role="main"]')).toBeVisible();

    // Check for aside landmark
    await expect(page.locator('aside[role="complementary"]')).toBeVisible();

    // Check for footer landmark
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();

    // Check for navigation landmarks
    await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
  });

  test('Keyboard navigation works on login page', async ({ page }) => {
    await page.goto('http://localhost:9002/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('Keyboard navigation works on signup page', async ({ page }) => {
    await page.goto('http://localhost:9002/signup');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('#name')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#confirmPassword'