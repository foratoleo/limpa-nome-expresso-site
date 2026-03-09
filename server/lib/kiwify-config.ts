/**
 * Kiwify Configuration
 *
 * Product constants and configuration for Kiwify payment integration
 * Matches the existing MercadoPago product structure
 *
 * @module server/lib/kiwify-config
 */

/**
 * Kiwify product definition matching MercadoPago pattern
 */
export const KIWIFY_PRODUCT = {
  id: 'limpa_nome_expresso_12_months',
  title: 'CPF Blindado - Acesso Premium 12 Meses',
  quantity: 1,
  unit_price: 149.90,
  currency_id: 'BRL',
  duration_months: 12,
} as const;

/**
 * Access duration in milliseconds (approximately 12 months)
 */
export const ACCESS_DURATION_MS = 12 * 30 * 24 * 60 * 60 * 1000; // ~12 months

/**
 * Kiwify API configuration
 */
export const KIWIFY_API_CONFIG = {
  baseUrl: 'https://public-api.kiwify.com',
  oauthTokenPath: '/v1/oauth/token',
  oauthEndpoint: '/v1/oauth/token',
  salesPath: '/v1/sales',
  salesEndpoint: '/v1/sales',
  tokenExpirationMs: 96 * 60 * 60 * 1000, // 96 hours
  tokenRefreshBufferMs: 60 * 60 * 1000, // Refresh 1 hour before expiry
  rateLimitPerMinute: 100,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
} as const;

/**
 * Kiwify webhook trigger types
 */
export type KiwifyWebhookTrigger =
  | 'compra_aprovada'
  | 'compra_recusada'
  | 'compra_reembolsada'
  | 'chargeback'
  | 'subscription_canceled'
  | 'subscription_renewed';

/**
 * Kiwify webhook event types
 */
export const KIWIFY_WEBHOOK_EVENTS = {
  COMPRA_APROVADA: 'compra_aprovada',
  COMPRA_RECUSADA: 'compra_recusada',
  COMPRA_REEMBOLSADA: 'compra_reembolsada',
  CHARGEBACK: 'chargeback',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
} as const;

/**
 * Kiwify webhook event type (alias for trigger type)
 */
export type KiwifyWebhookEventType = (typeof KIWIFY_WEBHOOK_EVENTS)[keyof typeof KIWIFY_WEBHOOK_EVENTS];

/**
 * Kiwify payment status mapping
 */
export const KIWIFY_PAYMENT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REFUSED: 'refused',
  REFUNDED: 'refunded',
  CHARGEDBACK: 'chargedback',
  WAITING_PAYMENT: 'waiting_payment',
} as const;

/**
 * Check if Kiwify is properly configured
 * @returns true if all required environment variables are set
 */
export function isKiwifyConfigured(): boolean {
  const clientId = process.env.KIWIFY_CLIENT_ID;
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET;
  const accountId = process.env.KIWIFY_ACCOUNT_ID;

  return !!(clientId && clientSecret && accountId);
}

/**
 * Get Kiwify configuration from environment variables
 */
export function getKiwifyConfig() {
  const clientId = process.env.KIWIFY_CLIENT_ID;
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET;
  const accountId = process.env.KIWIFY_ACCOUNT_ID;
  const webhookToken = process.env.KIWIFY_WEBHOOK_TOKEN;

  if (!clientId || !clientSecret || !accountId) {
    throw new Error(
      'Kiwify configuration incomplete. Set KIWIFY_CLIENT_ID, KIWIFY_CLIENT_SECRET, and KIWIFY_ACCOUNT_ID environment variables.'
    );
  }

  return {
    clientId,
    clientSecret,
    accountId,
    webhookToken: webhookToken || '',
  };
}
