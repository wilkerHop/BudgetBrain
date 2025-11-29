import { expect, test } from '@playwright/test';

test('BudgetBrain Flow', async ({ page }) => {
  await page.goto('/');

  // Check title
  await expect(page).toHaveTitle(/BudgetBrain/);

  // Fill form
  await page.getByLabel('What are you looking for?').fill('Mechanical Keyboard');
  
  // Click submit
  await page.getByRole('button', { name: 'Find Deals' }).click();

  // Verify loading state
  await expect(page.getByRole('button', { name: 'Analyzing Market...' })).toBeVisible();
  
  // Note: Since we are mocking the backend or running against a real backend that might take time/cost money,
  // for this E2E test in CI we might want to mock the network response or just check the initial state change.
  // For now, we verify the UI reacted.
});
