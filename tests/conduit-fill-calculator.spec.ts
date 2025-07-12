import { test, expect } from '@playwright/test';

test.describe('Conduit Fill Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/conduit-fill-calculator');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Conduit Fill Calculator');
    await expect(page.locator('p').first()).toContainText('Calculate conduit fill percentage per NEC® guidelines');
  });

  test('should have all required form elements', async ({ page }) => {
    // Check standard selection dropdown
    const standardSelect = page.locator('select').first();
    await expect(standardSelect).toBeVisible();
    await expect(standardSelect).toHaveValue('NEC');

    // Check conduit type dropdown
    const conduitTypeSelect = page.locator('select').nth(1);
    await expect(conduitTypeSelect).toBeVisible();
    await expect(conduitTypeSelect).toHaveValue('');

    // Check conduit size dropdown (should be disabled initially)
    const conduitSizeSelect = page.locator('select').nth(2);
    await expect(conduitSizeSelect).toBeVisible();
    await expect(conduitSizeSelect).toBeDisabled();

    // Check conductor inputs
    await expect(page.locator('text=Conductor 1')).toBeVisible();
    await expect(page.locator('text=Wire Type')).toBeVisible();
    await expect(page.locator('text=AWG Size')).toBeVisible();
    await expect(page.locator('text=Quantity')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();

    // Check buttons
    await expect(page.locator('button', { hasText: 'Add Conductor' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Calculate Fill' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Reset' })).toBeVisible();
  });

  test('should enable conduit size when conduit type is selected', async ({ page }) => {
    const conduitTypeSelect = page.locator('select').nth(1);
    const conduitSizeSelect = page.locator('select').nth(2);

    // Initially disabled
    await expect(conduitSizeSelect).toBeDisabled();

    // Select conduit type
    await conduitTypeSelect.selectOption('EMT');
    await expect(conduitSizeSelect).toBeEnabled();

    // Should have size options
    const sizeOptions = await conduitSizeSelect.locator('option').allTextContents();
    expect(sizeOptions.length).toBeGreaterThan(1); // Should have more than just placeholder
  });

  test('should add and remove conductors', async ({ page }) => {
    // Initially should have 1 conductor
    await expect(page.locator('text=Conductor 1')).toBeVisible();
    await expect(page.locator('text=Conductor 2')).not.toBeVisible();

    // Add conductor
    await page.locator('button', { hasText: 'Add Conductor' }).click();
    await expect(page.locator('text=Conductor 2')).toBeVisible();

    // Remove conductor
    await page.locator('button', { hasText: 'Remove' }).first().click();
    await expect(page.locator('text=Conductor 2')).not.toBeVisible();
  });

  test('should calculate conduit fill correctly - basic EMT calculation', async ({ page }) => {
    // Select EMT conduit
    await page.locator('select').nth(1).selectOption('EMT');
    
    // Select 1/2" conduit size
    await page.locator('select').nth(2).selectOption('1/2"');

    // Select THHN wire type for first conductor
    await page.locator('select').nth(3).selectOption('THHN/THWN (Copper)');
    
    // Select 12 AWG size
    await page.locator('select').nth(4).selectOption('12');
    
    // Set quantity to 3
    await page.locator('input[type="number"]').fill('3');

    // Calculate
    await page.locator('button', { hasText: 'Calculate Fill' }).click();

    // Check results appear
    await expect(page.locator('p', { hasText: 'Conduit Fill' }).and(page.locator('.text-lg.font-medium'))).toBeVisible();
    
    // Should show percentage
    const fillPercentage = page.locator('span:has-text("%")').first();
    await expect(fillPercentage).toBeVisible();
    
    // Should show compliance status
    await expect(page.locator('text=NEC Compliant').or(page.locator('text=Exceeds NEC Limits'))).toBeVisible();
  });

  test('should calculate conduit fill correctly - multiple conductors', async ({ page }) => {
    // Select EMT conduit
    await page.locator('select').nth(1).selectOption('EMT');
    
    // Select 3/4" conduit size
    await page.locator('select').nth(2).selectOption('3/4"');

    // First conductor: THHN 12 AWG x2
    await page.locator('select').nth(3).selectOption('THHN/THWN (Copper)');
    await page.locator('select').nth(4).selectOption('12');
    await page.locator('input[type="number"]').fill('2');

    // Add second conductor
    await page.locator('button', { hasText: 'Add Conductor' }).click();

    // Second conductor: THHN 14 AWG x2
    await page.locator('select').nth(5).selectOption('THHN/THWN (Copper)');
    await page.locator('select').nth(6).selectOption('14');
    await page.locator('input[type="number"]').nth(1).fill('2');

    // Calculate
    await page.locator('button', { hasText: 'Calculate Fill' }).click();

    // Check results
    await expect(page.locator('p', { hasText: 'Conduit Fill' }).and(page.locator('.text-lg.font-medium'))).toBeVisible();
    const fillPercentage = page.locator('span:has-text("%")').first();
    await expect(fillPercentage).toBeVisible();
  });

  test('should show overfill warning when exceeding NEC limits', async ({ page }) => {
    // Select small conduit with large conductors to force overfill
    await page.locator('select').nth(1).selectOption('EMT');
    await page.locator('select').nth(2).selectOption('1/2"');

    // Large conductor: THHN 6 AWG x4 (should exceed 40% fill)
    await page.locator('select').nth(3).selectOption('THHN/THWN (Copper)');
    await page.locator('select').nth(4).selectOption('6');
    await page.locator('input[type="number"]').fill('4');

    // Calculate
    await page.locator('button', { hasText: 'Calculate Fill' }).click();

    // Should show exceeds limits
    await expect(page.locator('text=Exceeds NEC Limits')).toBeVisible();
    
    // Should have red indicator
    await expect(page.locator('.bg-red-500')).toBeVisible();
  });

  test('should reset calculator properly', async ({ page }) => {
    // Set up some values
    await page.locator('select').first().selectOption('Utility');
    await page.locator('select').nth(1).selectOption('EMT');
    await page.locator('select').nth(2).selectOption('1/2"');

    // Add extra conductor
    await page.locator('button', { hasText: 'Add Conductor' }).click();

    // Reset
    await page.locator('button', { hasText: 'Reset' }).click();

    // Check everything is reset
    await expect(page.locator('select').first()).toHaveValue('NEC');
    await expect(page.locator('select').nth(1)).toHaveValue('');
    await expect(page.locator('select').nth(2)).toHaveValue('');
    await expect(page.locator('select').nth(2)).toBeDisabled();
    await expect(page.locator('text=Conductor 2')).not.toBeVisible();
    await expect(page.locator('text=Configure your conduit and conductors')).toBeVisible();
  });

  test('should validate required fields before calculation', async ({ page }) => {
    // Try to calculate without selecting anything
    await page.locator('button', { hasText: 'Calculate Fill' }).click();
    
    // Results should not appear
    await expect(page.locator('text=Configure your conduit and conductors')).toBeVisible();
    await expect(page.locator('span:has-text("%")').first()).not.toBeVisible();
  });

  test('should handle quantity input validation', async ({ page }) => {
    const quantityInput = page.locator('input[type="number"]');
    
    // Test that input accepts various values
    await quantityInput.fill('5');
    await expect(quantityInput).toHaveValue('5');
    
    // Test maximum value
    await quantityInput.fill('50');
    await expect(quantityInput).toHaveValue('50');
    
    // Test that input has min and max attributes
    await expect(quantityInput).toHaveAttribute('min', '1');
    await expect(quantityInput).toHaveAttribute('max', '50');
  });

  test('should switch between NEC and Utility standards', async ({ page }) => {
    // Start with NEC standard (default)
    await expect(page.locator('select').first()).toHaveValue('NEC');
    
    // Switch to Utility
    await page.locator('select').first().selectOption('Utility');
    await expect(page.locator('select').first()).toHaveValue('Utility');
    
    // Switch back to NEC
    await page.locator('select').first().selectOption('NEC');
    await expect(page.locator('select').first()).toHaveValue('NEC');
  });

  test('should test different conduit types', async ({ page }) => {
    const conduitTypeSelect = page.locator('select').nth(1);
    
    // Test EMT
    await conduitTypeSelect.selectOption('EMT');
    await expect(conduitTypeSelect).toHaveValue('EMT');
    
    // Test PVC Sch 40 & HDPE
    await conduitTypeSelect.selectOption('PVC Sch 40 & HDPE');
    await expect(conduitTypeSelect).toHaveValue('PVC Sch 40 & HDPE');
    
    // Test Flex FMC
    await conduitTypeSelect.selectOption('Flex FMC');
    await expect(conduitTypeSelect).toHaveValue('Flex FMC');
    
    // Test RMC (GRC)
    await conduitTypeSelect.selectOption('RMC (GRC)');
    await expect(conduitTypeSelect).toHaveValue('RMC (GRC)');
  });

  test('should test different conductor materials', async ({ page }) => {
    // Select conduit first
    await page.locator('select').nth(1).selectOption('EMT');
    await page.locator('select').nth(2).selectOption('1/2"');
    
    const conductorTypeSelect = page.locator('select').nth(3);
    
    // Test copper THHN
    await conductorTypeSelect.selectOption('THHN/THWN (Copper)');
    await expect(conductorTypeSelect).toHaveValue('THHN/THWN (Copper)');
    
    // Test aluminum THHN
    await conductorTypeSelect.selectOption('THHN/THWN (Aluminum)');
    await expect(conductorTypeSelect).toHaveValue('THHN/THWN (Aluminum)');
    
    // Test copper XHHW
    await conductorTypeSelect.selectOption('XHHW (Copper)');
    await expect(conductorTypeSelect).toHaveValue('XHHW (Copper)');
  });

  test('should show different max allowed percentages for NEC vs Utility', async ({ page }) => {
    // Set up basic configuration
    await page.locator('select').nth(1).selectOption('EMT');
    await page.locator('select').nth(2).selectOption('1/2"');
    await page.locator('select').nth(3).selectOption('THHN/THWN (Copper)');
    await page.locator('select').nth(4).selectOption('12');
    await page.locator('input[type="number"]').fill('3');

    // Test with NEC standard
    await page.locator('select').first().selectOption('NEC');
    await page.locator('button', { hasText: 'Calculate Fill' }).click();
    await expect(page.locator('text=Maximum allowed (NEC)')).toBeVisible();

    // Switch to Utility standard and recalculate
    await page.locator('select').first().selectOption('Utility');
    await page.locator('button', { hasText: 'Calculate Fill' }).click();
    await expect(page.locator('text=Maximum allowed (Utility)')).toBeVisible();
  });
});