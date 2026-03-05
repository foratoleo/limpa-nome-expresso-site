import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Starting automated Gmail verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    console.log('📧 Navigating to Gmail...');
    await page.goto('https://mail.google.com');

    console.log('⏳ Waiting for login page...');
    await page.waitForLoadState('networkidle');

    // Check if already logged in or need to login
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('🔑 Login required. Entering email...');
      await emailInput.fill('forato+ralph00okiuj@gmail.com');
      await page.click('button:has-text("Next")');

      console.log('⏳ Waiting for password input...');
      await page.waitForTimeout(2000);

      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        console.log('🔑 Entering password...');
        await passwordInput.fill('909090');
        await page.click('button:has-text("Next")');

        console.log('⏳ Waiting for login to complete...');
        await page.waitForTimeout(5000);
      }
    }

    console.log('📬 Looking for confirmation email...');

    // Wait for inbox to load
    await page.waitForTimeout(3000);

    // Try to find the email by searching
    console.log('🔍 Searching for Limpa Nome Expresso email...');
    const searchBox = await page.$('input[aria-label="Search mail"]');

    if (searchBox) {
      await searchBox.click();
      await searchBox.fill('from:noreply@f2w2.store OR from:Limpa Nome Expresso');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }

    // Check if any emails found
    console.log('📋 Checking search results...');
    const emailSubjects = await page.$$eval('span[data-thread-id]', elements =>
      elements.map(el => el.textContent)
    );

    if (emailSubjects.length > 0) {
      console.log('\n✅ EMAIL FOUND!');
      console.log('📧 Email subjects found:', emailSubjects.slice(0, 3));
      console.log('\n🎉 REGISTRATION TEST COMPLETE - EMAIL VERIFIED IN BROWSER!\n');

      // Take a screenshot as proof
      await page.screenshot({ path: 'email-verification-proof.png' });
      console.log('📸 Screenshot saved: email-verification-proof.png');

      await page.waitForTimeout(5000);
    } else {
      console.log('\n❌ NO EMAIL FOUND');
      console.log('⚠️  Email may take a few minutes to arrive.');
      console.log('📋 Please check manually:\n');
      console.log('   - Inbox');
      console.log('   - Spam folder');
      console.log('   - Promotions tab\n');
    }

    console.log('⏳ Browser will stay open for 30 seconds for manual verification...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('⏳ Keeping browser open for manual verification...');
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
    console.log('\n✅ Automated verification complete!\n');
  }
})();
