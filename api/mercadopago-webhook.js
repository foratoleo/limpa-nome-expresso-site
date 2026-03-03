// MercadoPago webhook handler for Vercel
// Receives payment notifications and updates user access

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
    // Get payment data from request body
    const { data, type } = req.body;

    // Handle payment notification
    if (type === 'payment' && data?.id) {
      const paymentId = data.id;

      console.log('Received payment notification:', paymentId);

      // Fetch payment details from MercadoPago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!mpResponse.ok) {
        console.error('Failed to fetch payment details:', await mpResponse.text());
        return res.status(500).json({ error: 'Failed to fetch payment details' });
      }

      const payment = await mpResponse.json();

      // Check if payment is approved
      if (payment.status === 'approved' && payment.external_reference) {
        const userId = payment.external_reference;

        console.log('Payment approved for user:', userId);

        // Import Supabase (dynamic import for edge compatibility)
        const { createClient } = await import('@supabase/supabase-js');

        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );

        // Check if user already has active access
        const { data: existingAccess } = await supabase
          .from('user_access')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        if (existingAccess) {
          console.log('User already has active access, skipping');
          return res.status(200).json({ received: true, message: 'User already has access' });
        }

        // Grant user access (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error: dbError } = await supabase
          .from('user_access')
          .insert({
            user_id: userId,
            access_type: 'premium',
            is_active: true,
            expires_at: expiresAt.toISOString(),
            payment_id: paymentId,
            payment_amount: payment.transaction_amount,
            payment_currency: payment.currency_id,
          });

        if (dbError) {
          console.error('Error granting access:', dbError);
          return res.status(500).json({ error: 'Failed to grant access' });
        }

        console.log('Access granted successfully to user:', userId);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Webhook processing failed',
      details: errorMessage
    });
  }
}
