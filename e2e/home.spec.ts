import { test, expect } from '@playwright/test';

test('homepage has correct title and content', async ({ page }) => {
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