import { Router, Request, Response } from 'express';
import { createPreference, getPayment, verifyWebhookSignature } from '../lib/mercadopago.js';
import { createClient } from '@supabase/supabase-js';
import { ACCESS_DURATION_MS } from '../lib/mercadopago-config.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const router = Router();

/**
 * POST /api/mercadopago/create-preference
 * Create a payment preference for checkout
 *
 * Body:
 * {
 *   "items": [
 *     {
 *       "id": "product_123",
 *       "title": "Produto Exemplo",
 *       "quantity": 1,
 *       "unit_price": 100.00,
 *       "currency_id": "BRL" // optional, defaults to BRL
 *     }
 *   ],
 *   "metadata": {
 *     "order_id": "order_123",
 *     "user_id": "user_456"
 *   }
 * }
 */
router.post('/create-preference', async (req: Request, res: Response) => {
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

    // Create preference
    const preference = await createPreference({
      items,
      metadata: metadata || {},
    });

    return res.status(200).json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      // In test/sandbox mode, use sandbox_init_point
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
});

/**
 * GET /api/mercadopago/payment/:paymentId
 * Get payment details by payment ID
 *
 * Params:
 * - paymentId: MercadoPago payment ID
 */
router.get('/payment/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    const payment = await getPayment(paymentId);

    return res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_approved: payment.date_approved,
        date_created: payment.date_created,
        metadata: payment.metadata,
        external_reference: payment.external_reference,
      }
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to get payment details',
      details: errorMessage
    });
  }
});

/**
 * POST /api/mercadopago/webhook
 * Handle MercadoPago webhook notifications
 *
 * This endpoint receives notifications from MercadoPago about payment status changes
 * You should configure this URL in your MercadoPago dashboard
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-signature'] as string;
    const requestId = req.headers['x-request-id'] as string;

    if (!verifyWebhookSignature(signature, requestId, req.body)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { data, type } = req.body;

    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      const payment = await getPayment(paymentId);

      if (payment.status === 'approved') {
        const userId = payment.metadata?.user_id || payment.external_reference;

        // Idempotency check: verify payment doesn't already exist
        const { data: existingPayment, error: paymentCheckError } = await supabase
          .from('payments')
          .select('id')
          .eq('mercadopago_payment_id', paymentId)
          .maybeSingle();

        if (paymentCheckError) {
          console.error('Error checking existing payment:', paymentCheckError);
          throw paymentCheckError;
        }

        if (existingPayment) {
          console.log(`Payment ${paymentId} already processed, skipping`);
          return res.status(200).json({ received: true, duplicate: true });
        }

        // Calculate access expiration (12 months from now)
        const expiresAt = new Date(Date.now() + ACCESS_DURATION_MS).toISOString();

        // Insert payment record
        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: userId,
          payment_provider: 'mercadopago',
          mercadopago_payment_id: payment.id,
          mercadopago_preference_id: (payment as any).preference_id,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          status: 'succeeded',
          paid_at: new Date().toISOString(),
          access_expires_at: expiresAt,
        });

        if (paymentError) {
          console.error('Error inserting payment:', paymentError);
          throw paymentError;
        }

        // Insert user_access record with idempotency check
        const { data: existingAccess, error: accessCheckError } = await supabase
          .from('user_access')
          .select('id')
          .eq('user_id', userId)
          .eq('access_type', 'one_time')
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        if (accessCheckError) {
          console.error('Error checking existing access:', accessCheckError);
          throw accessCheckError;
        }

        if (existingAccess) {
          console.log(`User ${userId} already has active access, skipping user_access insert`);
        } else {
          const { error: accessError } = await supabase.from('user_access').insert({
            user_id: userId,
            access_type: 'one_time',
            expires_at: expiresAt,
            is_active: true,
          });

          if (accessError) {
            console.error('Error inserting user_access:', accessError);
            throw accessError;
          }
        }

        console.log(`✅ Payment approved: ${paymentId}, access granted to user: ${userId} until ${expiresAt}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Still return 200 to avoid MercadoPago retries
    res.status(200).json({ received: true, error: errorMessage });
  }
});

/**
 * GET /api/mercadopago/config
 * Get MercadoPago configuration for frontend
 */
router.get('/config', async (_req: Request, res: Response) => {
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      error: 'MercadoPago public key not configured'
    });
  }

  return res.status(200).json({
    publicKey,
    // In sandbox mode, the checkout URL will be different
    sandbox: publicKey.startsWith('APP_USR'),
  });
});

export { router as mercadopagoRouter };
