import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('📧 Navigating to Gmail...');
  await page.goto('https://mail.google.com');

  console.log('⏳ Waiting for user to manually check email and confirm...');
  console.log('📧 Email: forato+ralph00okiuj@gmail.com');
  console.log('🔑 Password: 909090');
  console.log('');
  console.log('Please:');
  console.log('1. Login to Gmail');
  console.log('2. Check for email from Limpa Nome Expresso');
  console.log('3. Confirm if email arrived');
  console.log('4. Press Ctrl+C to exit when done');

  // Keep browser open for manual verification
  await new Promise(() => {});

  await browser.close();
})();
