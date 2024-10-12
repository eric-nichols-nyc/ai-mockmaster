import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('has correct title and content', async ({ page }) => {
    await page.goto('/');
    
    // Check the page title
    await expect(page).toHaveTitle(/AI Mockmaster/);
    
    // Check for some expected content on the homepage
    const heroText = await page.textContent('h1');
    expect(heroText).toContain('AI-Powered Interview Practice');
    
    // Check if the "Get Started" button is present
    const getStartedButton = await page.getByRole('button', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();
  });

  test('navigation menu is present and functional', async ({ page }) => {
    await page.goto('/');

    // Check if the navigation menu is present
    const navMenu = await page.locator('nav');
    await expect(navMenu).toBeVisible();

    // Check if the logo is present
    const logo = await page.locator('nav img[alt="AI Mockmaster Logo"]');
    await expect(logo).toBeVisible();

    // Check if the main navigation links are present
    const homeLink = await page.getByRole('link', { name: 'Home' });
    const featuresLink = await page.getByRole('link', { name: 'Features' });
    const pricingLink = await page.getByRole('link', { name: 'Pricing' });
    await expect(homeLink).toBeVisible();
    await expect(featuresLink).toBeVisible();
    await expect(pricingLink).toBeVisible();

    // Check if the sign-in button is present
    const signInButton = await page.getByRole('link', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
  });

  test('features section is present and contains expected content', async ({ page }) => {
    await page.goto('/');

    // Check if the features section is present
    const featuresSection = await page.locator('section:has-text("Features")');
    await expect(featuresSection).toBeVisible();

    // Check for specific feature cards
    const featureCards = await featuresSection.locator('.feature-card').all();
    expect(featureCards.length).toBeGreaterThan(0);

    // Check content of the first feature card (adjust as needed)
    const firstFeatureCard = featureCards[0];
    await expect(firstFeatureCard).toContainText('AI-Powered Interviews');
  });

  test('footer is present and contains expected links', async ({ page }) => {
    await page.goto('/');

    // Check if the footer is present
    const footer = await page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for copyright information
    await expect(footer).toContainText('© 2023 AI Mockmaster');

    // Check for social media links (adjust as needed)
    const socialLinks = await footer.locator('a[href^="https://"]').all();
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  test('responsive design - mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if the mobile menu button is visible
    const mobileMenuButton = await page.locator('button:has-text("Menu")');
    await expect(mobileMenuButton).toBeVisible();

    // Check if the main navigation is hidden in mobile view
    const mainNav = await page.locator('nav ul');
    await expect(mainNav).toBeHidden();

    // Open mobile menu and check if navigation becomes visible
    await mobileMenuButton.click();
    await expect(mainNav).toBeVisible();
  });
});
