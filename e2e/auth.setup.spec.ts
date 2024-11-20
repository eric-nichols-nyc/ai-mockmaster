import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test } from "@playwright/test";

test.describe("authenticated tests", () => {
  test("already signed in", async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto("/dashboard");
    await page.waitForSelector("h1:has-text('Interview Dashboard')");
  });
});
