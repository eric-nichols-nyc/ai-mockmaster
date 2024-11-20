import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { setupClerkTestingToken } from '@clerk/testing/playwright'

import { test as setup } from "@playwright/test";
import path from "path";
import fs from 'fs/promises';

setup("global setup", async ({}) => {
  await clerkSetup();

  if (
    !process.env.E2E_CLERK_USER_USERNAME ||
    !process.env.E2E_CLERK_USER_PASSWORD
  ) {
    throw new Error(
      "Please provide E2E_CLERK_USER_USERNAME and E2E_CLERK_USER_PASSWORD environment variables."
    );
  }
});

const authFile = path.join(__dirname, "../playwright/.clerk/user.json");

setup("authenticate", async ({ page }) => {
  await setupClerkTestingToken({ page })
  await page.goto("/sign-in");

  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
  await page.goto("/dashboard");
  await page.waitForSelector("h1:has-text('Interview Dashboard')");

  // Ensure the directory exists before saving the storage state
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
