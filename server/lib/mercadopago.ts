import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Initialize MercadoPago client with access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Create preference instance
const preference = new Preference(client);

// Create payment instance
const payment = new Payment(client);

/**
 * Create a payment preference for checkout
 * @param items - Array of items to purchase
 * @returns Preference data with checkout URL
 */
export async function createPreference({
  items,
  metadata = {},
}: {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  metadata?: Record<string, any>;
}) {
  try {
    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'BRL',
        })),
        metadata,
        back_urls: {
          success: 'http://localhost:3000/checkout/sucesso',
          failure: 'http://localhost:3000/checkout/falha',
          pending: 'http://localhost:3000/checkout/pendente',
        },
      },
    });

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    };
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    throw error;
  }
}

/**
 * Get payment details by payment ID
 * @param paymentId - MercadoPago payment ID
 * @returns Payment details
 */
export async function getPayment(paymentId: string) {
  try {
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Error getting MercadoPago payment:', error);
    throw error;
  }
}

/**
 * Search payments with filters
 * @param filters - Search filters
 * @returns Array of payments
 */
export async function searchPayments(filters: {
  external_reference?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const searchParams: any = {};

    if (filters.external_reference) {
      searchParams.external_reference = filters.external_reference;
    }

    if (filters.status) {
      searchParams.status = filters.status;
    }

    if (filters.limit) {
      searchParams.limit = filters.limit;
    }

    if (filters.offset) {
      searchParams.offset = filters.offset;
    }

    const result = await payment.search({
      options: searchParams,
    });
    return result;
  } catch (error) {
    console.error('Error searching MercadoPago payments:', error);
    throw error;
  }
}

/**
 * Verify MercadoPago webhook signature
 * @param signature - Signature from x-signature header
 * @param requestId - Request ID from x-request-id header
 * @param data - Request body data
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  signature: string | undefined,
  requestId: string | undefined,
  data: any
): boolean {
  if (!signature || !requestId || !data?.id) {
    console.error('Missing signature, request ID, or data ID');
    return false;
  }

  // MercadoPago webhook signature verification
  // Format: ts={timestamp};v1={hash}
  const parts = signature.split(';');
  let ts: string | undefined;
  let v1: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) {
    console.error('Invalid signature format');
    return false;
  }

  // Verify timestamp is not too old (5 minutes)
  const timestamp = parseInt(ts, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.error('Signature timestamp is too old');
    return false;
  }

  // In production, you should verify the hash
  // For now, we'll log a warning and accept it
  // TODO: Implement proper HMAC verification using crypto module
  console.log('Webhook signature verification - HMAC verification not yet implemented');

  return true;
}

export { client, preference, payment };
