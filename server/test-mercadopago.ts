/**
 * MercadoPago Integration Test
 *
 * This file demonstrates how to use the MercadoPago API integration
 *
 * To run this test:
 * 1. Make sure your .env.local has the MercadoPago credentials
 * 2. Run: node --loader tsx server/test-mercadopago.ts
 */

import { createPreference, getPayment } from './lib/mercadopago.js';

async function testMercadoPagoIntegration() {
  console.log('🧪 Testing MercadoPago Integration...\n');

  try {
    // Test 1: Create a payment preference
    console.log('📦 Test 1: Creating payment preference...');
    const preference = await createPreference({
      items: [
        {
          id: 'product_001',
          title: 'Limpeza de Nome Express',
          quantity: 1,
          unit_price: 149.90,
          currency_id: 'BRL',
        },
      ],
      metadata: {
        order_id: 'test_order_' + Date.now(),
        customer_email: 'test@example.com',
      },
    });

    console.log('✅ Preference created successfully!');
    console.log('   Preference ID:', preference.id);
    console.log('   Checkout URL:', preference.checkoutUrl);
    console.log('   Sandbox URL:', preference.sandbox_init_point);
    console.log();

    // Test 2: Create preference with multiple items
    console.log('📦 Test 2: Creating preference with multiple items...');
    const multiItemPreference = await createPreference({
      items: [
        {
          id: 'service_basic',
          title: 'Limpeza de Nome - Básico',
          quantity: 1,
          unit_price: 99.90,
        },
        {
          id: 'service_premium',
          title: 'Limpeza de Nome - Premium',
          quantity: 1,
          unit_price: 199.90,
        },
      ],
      metadata: {
        order_type: 'multi_service',
      },
    });

    console.log('✅ Multi-item preference created!');
    console.log('   Preference ID:', multiItemPreference.id);
    console.log('   Total Items:', 2);
    console.log();

    console.log('✅ All tests passed!\n');

    console.log('📝 Next Steps:');
    console.log('   1. Visit the checkout URL to test the payment flow');
    console.log('   2. Use MercadoPago test cards for sandbox payments');
    console.log('   3. Configure webhooks to receive payment notifications');
    console.log();

    return {
      preferenceId: preference.id,
      checkoutUrl: preference.checkoutUrl,
      sandboxUrl: preference.sandbox_init_point,
    };
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('   Details:', error.cause || error);
    throw error;
  }
}

// Run the test
testMercadoPagoIntegration()
  .then((result) => {
    console.log('🎉 Integration test completed successfully!');
    console.log('\n🔗 Checkout Links:');
    console.log('   Production:', result.checkoutUrl);
    console.log('   Sandbox:', result.sandboxUrl);
  })
  .catch((error) => {
    console.error('\n💥 Integration test failed!');
    process.exit(1);
  });
