// Kiwify serverless function for Netlify
// Generates checkout URL for Kiwify payment integration
// Unlike MercadoPago, Kiwify checkout URLs can be constructed directly

/**
 * Kiwify product configuration
 */
const KIWIFY_PRODUCT = {
  id: 'limpa_nome_expresso_12_months',
  title: 'CPF Blindado - Acesso Premium 12 Meses',
  unit_price: 149.90,
  currency: 'BRL',
  duration: '12 meses de acesso',
};

/**
 * Kiwify checkout URL template
 * Format: https://kiwify.app/{product_slug}/checkout
 * Note: Replace {product_slug} with actual Kiwify product slug from dashboard
 */
const KIWIFY_CHECKOUT_BASE = 'https://pay.kiwify.com.br';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, metadata } = req.body;

    // Get product slug from environment or use default
    // This is the unique identifier for the product in Kiwify dashboard
    const productSlug = process.env.KIWIFY_PRODUCT_SLUG || 'lpYUQ3n';

    // Construct the Kiwify checkout URL
    // Kiwify uses URL parameters for pre-filling customer data
    const checkoutUrl = new URL(`/${productSlug}`, KIWIFY_CHECKOUT_BASE);

    // Pre-fill email if provided (improves conversion)
    if (email) {
      checkoutUrl.searchParams.set('email', email);
    }

    // Add external reference for tracking (maps back to our user)
    if (userId) {
      checkoutUrl.searchParams.set('external_reference', userId);
    }

    // Add UTM parameters for tracking if provided in metadata
    if (metadata?.utm_source) {
      checkoutUrl.searchParams.set('utm_source', metadata.utm_source);
    }
    if (metadata?.utm_medium) {
      checkoutUrl.searchParams.set('utm_medium', metadata.utm_medium);
    }
    if (metadata?.utm_campaign) {
      checkoutUrl.searchParams.set('utm_campaign', metadata.utm_campaign);
    }

    // Return the checkout URL for frontend redirect
    return res.status(200).json({
      success: true,
      checkoutUrl: checkoutUrl.toString(),
      product: KIWIFY_PRODUCT,
      // Include redirect URLs for reference
      redirectUrls: {
        success: `${process.env.URL || 'https://cpfblindado.com'}/checkout/sucesso?source=kiwify`,
        failure: `${process.env.URL || 'https://cpfblindado.com'}/checkout/falha?source=kiwify`,
      },
    });
  } catch (error) {
    console.error('Error creating Kiwify checkout URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to create Kiwify checkout URL',
      details: errorMessage,
    });
  }
}
