import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Starting Gmail verification with extended timeout...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Set longer timeouts
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  try {
    console.log('📧 Navigating to Gmail (this may take up to 60s)...');
    await page.goto('https://mail.google.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Gmail loaded! Waiting for you to manually login...');
    console.log('📧 Credentials: forato+ralph00okiuj@gmail.com / 909090');
    console.log('⏳ Waiting 60 seconds for login...\n');

    // Wait for user to login
    await page.waitForTimeout(60000);

    // Try to find the email using multiple selectors
    console.log('🔍 Searching for confirmation email...\n');

    const selectors = [
      'span[email]:has-text("noreply@f2w2.store")',
      'span[email]:has-text("Limpa Nome")',
      'tr:has-text("Confirme seu e-mail")',
      '[data-thread-id]:has-text("Limpa Nome Expresso")'
    ];

    let emailFound = false;
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ EMAIL FOUND with selector: ${selector}`);
          emailFound = true;

          // Get email details
          const subject = await page.evaluate(el => el.textContent, elements[0]);
          console.log(`📧 Subject: ${subject}`);

          // Screenshot
          await page.screenshot({
            path: 'email-confirmed.png',
            fullPage: false
          });
          console.log('📸 Screenshot saved: email-confirmed.png');
          break;
        }
      } catch (e) {
        // Selector didn't work, try next one
        continue;
      }
    }

    if (emailFound) {
      console.log('\n🎉 REGISTRATION TEST COMPLETE!');
      console.log('✅ Email verified in browser!\n');
    } else {
      console.log('\n⚠️  Could not find email automatically.');
      console.log('📋 Browser will stay open for manual verification.\n');
      console.log('Please check:');
      console.log('   - Main inbox');
      console.log('   - Spam folder');
      console.log('   - Promotions/Social tabs\n');
    }

    console.log('⏳ Browser will remain open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('📋 Browser staying open for manual verification...\n');
    await page.waitForTimeout(60000);
  } finally {
    await browser.close();
    console.log('✅ Verification complete!\n');
  }
})();
