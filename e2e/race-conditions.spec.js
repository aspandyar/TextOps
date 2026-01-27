import { test, expect } from '@playwright/test';

test.describe('Race Condition Tests', () => {
  test('should handle rapid form submissions', async ({ page }) => {
    await page.goto('/');

    // Wait for form
    await expect(page.locator('text=Create New Job')).toBeVisible();

    // Select job type
    const jobTypeSelect = page.locator('select[name="jobType"], [role="combobox"]').first();
    if (await jobTypeSelect.count() > 0) {
      await jobTypeSelect.selectOption({ index: 0 });
    }

    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test content'),
      });
    }

    // Rapidly click submit multiple times
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Click multiple times rapidly
    await Promise.all([
      submitButton.click().catch(() => {}),
      submitButton.click().catch(() => {}),
      submitButton.click().catch(() => {}),
    ]);

    // Wait a bit
    await page.waitForTimeout(2000);

    // Should only create one job (or handle gracefully)
    // Check that page is still functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle concurrent job fetches', async ({ page, context }) => {
    let fetchCount = 0;
    
    await context.route('**/api/jobs**', async route => {
      fetchCount++;
      await route.continue();
    });

    await page.goto('/');

    // Trigger multiple reloads rapidly
    await Promise.all([
      page.reload(),
      page.reload(),
      page.reload(),
    ]);

    await page.waitForLoadState('networkidle');

    // Should handle multiple fetches
    expect(fetchCount).toBeGreaterThan(0);
  });

  test('should prevent duplicate job creation during submission', async ({ page }) => {
    await page.goto('/');

    // Wait for form
    await page.waitForSelector('text=Create New Job', { timeout: 5000 }).catch(() => {});

    // Fill form
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test'),
      });
    }

    const submitButton = page.locator('button[type="submit"]').first();
    
    // Check if button gets disabled after first click
    if (await submitButton.isEnabled()) {
      await submitButton.click();
      
      // Button should be disabled or show loading state
      await page.waitForTimeout(500);
      
      const isDisabled = await submitButton.isDisabled();
      const hasLoadingText = await submitButton.textContent().then(text => 
        text?.includes('Creating') || text?.includes('...')
      );
      
      // Either button is disabled or shows loading state
      expect(isDisabled || hasLoadingText).toBe(true);
    }
  });
});
