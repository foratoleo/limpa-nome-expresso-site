// MercadoPago serverless function for Vercel
// All dependencies must be bundled or available in the runtime

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

    // Call MercadoPago API directly
    const mercadopagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'BRL',
        })),
        metadata: metadata || {},
        back_urls: {
          success: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/sucesso`,
          failure: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/falha`,
          pending: `${process.env.VERCEL_URL || 'https://limpa-nome-expresso-site.vercel.app'}/checkout/pendente`,
        },
      }),
    });

    if (!mercadopagoResponse.ok) {
      const errorText = await mercadopagoResponse.text();
      console.error('MercadoPago API error:', errorText);
      return res.status(500).json({
        error: 'Failed to create preference with MercadoPago',
        details: errorText
      });
    }

    const preference = await mercadopagoResponse.json();

    return res.status(200).json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      checkoutUrl: preference.sandbox_init_point || preference.init_point,
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
