// E2E: Trivia Room flow. Requires backend (npm start) and frontend (cd frontend && npm run dev) running.
// Run: npx playwright test
import { test, expect } from '@playwright/test';

test.describe('Trivia Room', () => {
  test('home page has Host a room and Trivia links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /host a room|Host a room/i })).toBeVisible();
    await expect(page.locator('a[href*="/host"]').first()).toBeVisible();
  });

  test('navigate to host then Trivia create flow', async ({ page }) => {
    await page.goto('/host');
    await expect(page.getByText(/Host a game|host a game/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Trivia/i }).click();
    await expect(page.getByRole('button', { name: /Choose pack & host/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Build custom/i })).toBeVisible();
    await page.getByRole('button', { name: /Choose pack & host/i }).click();
    await expect(page).toHaveURL(/\/host\/create/);
    await expect(page.getByText(/Play a Trivia Pack|Select a verified pack/i).first()).toBeVisible();
  });

  test('pack picker shows multiple packs', async ({ page }) => {
    await page.goto('/host/create?trivia');
    await expect(page.getByText(/Weekly Bar|Quick Happy Hour|Theme Night|Family-Friendly/i).first()).toBeVisible();
  });
});
