import { test, expect } from '@playwright/test';

test.describe('InterviewQuestion Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page where InterviewQuestion is rendered
    await page.goto('/interviews/mock-interview-id');
  });

  test('completes full interview question flow', async ({ page }) => {
    // Grant microphone permissions
    await page.context().grantPermissions(['microphone']);

    // Verify initial state
    await expect(page.getByText('Please enable your microphone')).toBeVisible();
    await expect(page.getByText('Tell me about yourself')).toBeVisible();

    // Start recording
    await page.getByRole('button', { name: /start/i }).click();
    
    // Wait for recording duration
    await page.waitForTimeout(2000);

    // Stop recording
    await page.getByRole('button', { name: /stop/i }).click();

    // Submit recording
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify success state
    await expect(page.getByText(/success/i)).toBeVisible();
  });

  test('shows error on submission failure', async ({ page }) => {
    // Mock failed API response
    await page.route('**/api/transcribe', (route) => 
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      })
    );

    await page.context().grantPermissions(['microphone']);
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /stop/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/Failed to process your answer/i)).toBeVisible();
  });
}); 