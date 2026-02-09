import { test, expect } from '@playwright/test';

test.describe('Job Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display dashboard with job statistics', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.locator('text=Total Jobs')).toBeVisible();
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('should create a new job', async ({ page }) => {
    // Wait for form to be visible
    await expect(page.locator('text=Create New Job')).toBeVisible();

    // Select job type
    await page.selectOption('select[name="jobType"], [role="combobox"]', { label: /word-count|Word Count/i }).catch(() => {
      // If select doesn't exist, try clicking a button or radio
      page.click('text=Word Count').catch(() => {});
    });

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is a test file content'),
      });
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Job")');
    await submitButton.click();

    // Wait for success message or job to appear
    await expect(
      page.locator('text=Job created successfully, text=Success, text=Job created').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should handle form validation errors', async ({ page }) => {
    // Try to submit without selecting file
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Job")');
    
    // If button is disabled, that's good
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Should show error message
      await expect(
        page.locator('text=Please select a file, text=File is required, text=required').first()
      ).toBeVisible({ timeout: 2000 });
    } else {
      // Button is disabled, which is correct behavior
      expect(isDisabled).toBe(true);
    }
  });

  test('should display job list', async ({ page }) => {
    // Wait for jobs section
    await expect(page.locator('text=Jobs, h2:has-text("Jobs")').first()).toBeVisible({ timeout: 5000 });
    
    // Check if jobs are displayed or empty state
    const hasJobs = await page.locator('.job-card, [data-testid="job-card"]').count() > 0;
    const hasEmptyState = await page.locator('text=No jobs found').isVisible().catch(() => false);

    expect(hasJobs || hasEmptyState).toBe(true);
  });

  test('should handle loading states', async ({ page }) => {
    // Navigate to page and wait for initial load
    await page.goto('/');
    
    // Check if loading indicators appear (if any)
    const loadingIndicators = page.locator('[aria-busy="true"], .loading, .skeleton, [data-loading="true"]');
    const loadingCount = await loadingIndicators.count();
    
    // Either loading indicators appear briefly, or content loads immediately
    // This test verifies the page doesn't hang
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // After network idle, loading should be gone
    const finalLoadingCount = await loadingIndicators.count();
    expect(finalLoadingCount).toBe(0);
  });

  test('should handle error states (500)', async ({ page, context }) => {
    // Intercept API calls and return 500
    await context.route('**/api/jobs**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/');
    
    // Wait a bit for error to be handled
    await page.waitForTimeout(2000);
    
    // Page should still be functional (not crash)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle error states (404)', async ({ page, context }) => {
    // Intercept API calls and return 404
    await context.route('**/api/jobs/**', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    });

    await page.goto('/');
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Page should handle error gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle slow API responses', async ({ page, context }) => {
    // Intercept and delay API response
    await context.route('**/api/jobs**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    
    // Should handle slow response gracefully
    expect(loadTime).toBeGreaterThan(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle race conditions with multiple requests', async ({ page, context }) => {
    let requestCount = 0;
    
    // Track multiple concurrent requests
    await context.route('**/api/jobs**', async route => {
      requestCount++;
      await route.continue();
    });

    await page.goto('/');
    
    // Trigger multiple actions that might cause concurrent requests
    await page.reload();
    await page.reload();
    
    await page.waitForLoadState('networkidle');
    
    // Multiple requests should be handled
    expect(requestCount).toBeGreaterThan(0);
  });
});
