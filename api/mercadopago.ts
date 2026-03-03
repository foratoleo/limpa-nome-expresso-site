import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize MercadoPago client with access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Create preference instance
const preference = new Preference(client);

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, metadata } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Items are required',
        details: 'Items must be a non-empty array'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.title || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          error: 'Invalid item',
          details: 'Each item must have id, title, quantity, and unit_price'
        });
      }

      if (item.quantity <= 0 || item.unit_price <= 0) {
        return res.status(400).json({
          error: 'Invalid item values',
          details: 'Quantity and unit_price must be greater than 0'
        });
      }
    }

    // Create preference directly
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'BRL',
        })),
        metadata: metadata || {},
        back_urls: {
          success: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/sucesso`,
          failure: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/falha`,
          pending: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/pendente`,
        },
      },
    });

    return res.status(200).json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      checkoutUrl: result.sandbox_init_point || result.init_point,
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to create payment preference',
      details: errorMessage
    });
  }
}
