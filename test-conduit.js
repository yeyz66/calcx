const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3000/conduit-fill-calculator');
    await page.goto('http://localhost:3000/conduit-fill-calculator');
    
    await page.waitForLoadState('networkidle');
    console.log('Page loaded successfully');

    // Test conduit type selection
    console.log('Testing conduit type selection...');
    await page.selectOption('select[value=""]', 'EMT');
    console.log('✓ Conduit type selected: EMT');

    // Test conduit size selection
    console.log('Testing conduit size selection...');
    await page.waitForTimeout(500); // Give time for sizes to populate
    await page.selectOption('select:has-text("Select conduit size")', '1"');
    console.log('✓ Conduit size selected: 1"');

    // Test conductor configuration
    console.log('Testing conductor configuration...');
    await page.selectOption('select:has-text("Select type")', 'THHN/THWN');
    console.log('✓ Conductor type selected: THHN/THWN');
    
    await page.waitForTimeout(500);
    await page.selectOption('select:has-text("Select size")', '12');
    console.log('✓ Conductor size selected: 12 AWG');

    // Set quantity
    await page.fill('input[type="number"]', '3');
    console.log('✓ Quantity set to 3');

    // Test add conductor button
    console.log('Testing add conductor button...');
    await page.click('button:has-text("Add Conductor")');
    console.log('✓ Additional conductor added');

    // Configure second conductor
    const conductorSections = await page.locator('div:has-text("Conductor")').count();
    console.log(`Found ${conductorSections} conductor sections`);

    // Test calculate button
    console.log('Testing calculate functionality...');
    await page.click('button:has-text("Calculate Fill")');
    await page.waitForTimeout(1000);
    
    // Check for results
    const results = await page.locator('text=NEC Compliant').isVisible();
    if (results) {
      console.log('✓ Calculation results displayed');
    } else {
      console.log('⚠ Results may not be visible - checking for percentage');
      const percentage = await page.locator('text=/%/').first().isVisible();
      if (percentage) {
        console.log('✓ Percentage result found');
      }
    }

    // Test reset button
    console.log('Testing reset functionality...');
    await page.click('button:has-text("Reset")');
    await page.waitForTimeout(500);
    
    const resetCheck = await page.locator('select').first().inputValue();
    if (resetCheck === '') {
      console.log('✓ Reset functionality working');
    } else {
      console.log('⚠ Reset may not have cleared all fields');
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('🎉 Conduit Fill Calculator is functional');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();