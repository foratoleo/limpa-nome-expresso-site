/**
 * Kiwify API TypeScript Types
 *
 * Type definitions for Kiwify Public API v1 integration.
 * Base URL: https://public-api.kiwify.com
 *
 * @module server/lib/kiwify-types
 */

// ============================================================================
// OAuth Types
// ============================================================================

/**
 * OAuth token request payload
 */
export interface KiwifyOAuthTokenRequest {
  client_id: string;
  client_secret: string;
}

/**
 * OAuth token response from Kiwify API
 */
export interface KiwifyOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // 96 hours in seconds (345600)
  created_at: string; // ISO 8601 timestamp
}

/**
 * Cached OAuth token with expiration metadata
 */
export interface KiwifyCachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
  createdAt: number; // Unix timestamp in milliseconds
}

// ============================================================================
// Customer Types
// ============================================================================

/**
 * Customer information from Kiwify sale
 */
export interface KiwifyCustomer {
  /** Customer unique identifier in Kiwify */
  id: string;
  /** Customer full name */
  name: string;
  /** Customer email address */
  email: string;
  /** Customer CPF (Brazilian tax ID) - may be masked */
  cpf?: string;
  /** Customer phone number with country code */
  mobile?: string;
  /** Customer address information */
  address?: KiwifyAddress;
}

/**
 * Customer address details
 */
export interface KiwifyAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

// ============================================================================
// Product Types
// ============================================================================

/**
 * Product information from Kiwify sale
 */
export interface KiwifyProduct {
  /** Product unique identifier in Kiwify */
  id: string;
  /** Product name/title */
  name: string;
  /** Product slug (URL-friendly identifier) */
  slug?: string;
  /** Product type (e.g., 'digital', 'subscription') */
  type?: 'digital' | 'physical' | 'subscription';
  /** Product price in cents (multiply by 100 to get BRL value) */
  price?: number;
  /** Product currency (typically BRL) */
  currency?: string;
}

/**
 * Product variant information (if applicable)
 */
export interface KiwifyProductVariant {
  id: string;
  name: string;
  price?: number;
  sku?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

/**
 * Payment status values from Kiwify
 */
export type KiwifyPaymentStatus =
  | 'paid'
  | 'waiting_payment'
  | 'refused'
  | 'refunded'
  | 'chargedback'
  | 'canceled';

/**
 * Payment method used for the purchase
 */
export type KiwifyPaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'boleto'
  | 'bank_transfer';

/**
 * Payment details from Kiwify sale
 */
export interface KiwifyPayment {
  /** Payment method used */
  method: KiwifyPaymentMethod;
  /** Current payment status */
  status: KiwifyPaymentStatus;
  /** Payment amount in cents */
  amount: number;
  /** Currency code (BRL) */
  currency: string;
  /** Installments count (for credit card) */
  installments?: number;
  /** Card brand (for credit card payments) */
  card_brand?: string;
  /** Card last 4 digits */
  card_last_four?: string;
  /** PIX QR code (for PIX payments) */
  pix_qr_code?: string;
  /** PIX expiration date */
  pix_expires_at?: string;
  /** Boleto URL (for boleto payments) */
  boleto_url?: string;
  /** Boleto barcode */
  boleto_barcode?: string;
  /** Boleto expiration date */
  boleto_expires_at?: string;
  /** Payment confirmation date */
  paid_at?: string;
  /** Refund date if applicable */
  refunded_at?: string;
}

// ============================================================================
// Sale Types
// ============================================================================

/**
 * Sale object from Kiwify API
 */
export interface KiwifySale {
  /** Sale unique identifier */
  id: string;
  /** Order number (human-readable) */
  order_number?: string;
  /** Customer information */
  customer: KiwifyCustomer;
  /** Product information */
  product: KiwifyProduct;
  /** Product variant if applicable */
  variant?: KiwifyProductVariant;
  /** Payment details */
  payment: KiwifyPayment;
  /** Coupon code used (if any) */
  coupon_code?: string;
  /** Discount amount applied (in cents) */
  discount_amount?: number;
  /** Affiliate code (if sale came from affiliate) */
  affiliate_code?: string;
  /** Total amount paid (in cents) */
  total_amount: number;
  /** Currency code */
  currency: string;
  /** Sale creation timestamp */
  created_at: string;
  /** Sale last update timestamp */
  updated_at: string;
  /** UTM campaign tracking */
  utm?: KiwifyUTM;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * UTM tracking parameters
 */
export interface KiwifyUTM {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * Webhook trigger types from Kiwify
 */
export type KiwifyWebhookTrigger =
  | 'compra_aprovada'
  | 'compra_recusada'
  | 'compra_reembolsada'
  | 'chargeback'
  | 'subscription_canceled'
  | 'subscription_renewed';

/**
 * Webhook event payload from Kiwify
 */
export interface KiwifyWebhookEvent {
  /** Event unique identifier */
  id: string;
  /** Event trigger type */
  trigger: KiwifyWebhookTrigger;
  /** Sale ID associated with the event */
  sale_id: string;
  /** Event timestamp */
  created_at: string;
  /** Sale data (may be partial) */
  data: Partial<KiwifySale>;
  /** Webhook verification token */
  token?: string;
}

/**
 * Webhook verification result
 */
export interface KiwifyWebhookVerification {
  valid: boolean;
  error?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Pagination metadata for list responses
 */
export interface KiwifyPagination {
  /** Current page number */
  page: number;
  /** Items per page */
  per_page: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  total_pages: number;
  /** Whether there is a next page */
  has_next: boolean;
  /** Whether there is a previous page */
  has_previous: boolean;
}

/**
 * List sales response from Kiwify API
 */
export interface KiwifyListSalesResponse {
  /** Array of sales */
  sales: KiwifySale[];
  /** Pagination metadata */
  pagination: KiwifyPagination;
}

/**
 * Single sale response from Kiwify API
 */
export interface KiwifySaleResponse {
  sale: KiwifySale;
}

/**
 * Generic API error response from Kiwify
 */
export interface KiwifyApiError {
  /** Error type/code */
  error: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  status_code: number;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Validation errors (for 400 responses) */
  validation_errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// Client Configuration Types
// ============================================================================

/**
 * Kiwify client configuration
 */
export interface KiwifyClientConfig {
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Kiwify account ID */
  accountId: string;
  /** API base URL (default: https://public-api.kiwify.com) */
  baseUrl?: string;
  /** Webhook verification token */
  webhookToken?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum retry attempts for rate limiting (default: 3) */
  maxRetries?: number;
}

/**
 * Kiwify product configuration (matching MercadoPago pattern)
 */
export interface KiwifyProductConfig {
  /** Product ID in Kiwify */
  id: string;
  /** Product title for display */
  title: string;
  /** Product quantity (typically 1) */
  quantity: number;
  /** Unit price in BRL */
  unit_price: number;
  /** Currency code */
  currency_id: string;
  /** Access duration in months */
  duration_months: number;
}

// ============================================================================
// Request/Response Utility Types
// ============================================================================

/**
 * Query parameters for listing sales
 */
export interface KiwifyListSalesQuery {
  /** Filter by payment status */
  status?: KiwifyPaymentStatus;
  /** Filter by customer email */
  email?: string;
  /** Filter by product ID */
  product_id?: string;
  /** Start date (ISO 8601) - max 90 days from end_date */
  start_date?: string;
  /** End date (ISO 8601) */
  end_date?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  per_page?: number;
  /** Sort order */
  sort?: 'created_at' | 'updated_at';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Generic API request options
 */
export interface KiwifyRequestOptions {
  /** Request timeout override */
  timeout?: number;
  /** Skip retry on rate limit */
  skipRetry?: boolean;
  /** Custom headers */
  headers?: Record<string, string>;
}

// ============================================================================
// Internal Types (for caching and state management)
// ============================================================================

/**
 * Token cache entry structure
 */
export interface KiwifyTokenCache {
  token: KiwifyCachedToken;
  promise?: Promise<KiwifyCachedToken>;
}

/**
 * Processed webhook result for logging/database
 */
export interface KiwifyWebhookResult {
  /** Whether the webhook was processed successfully */
  success: boolean;
  /** Sale ID from webhook */
  saleId: string;
  /** Customer email */
  customerEmail: string;
  /** Action taken */
  action: 'access_granted' | 'access_revoked' | 'access_extended' | 'logged_only';
  /** Error message if failed */
  error?: string;
  /** Processing timestamp */
  processedAt: string;
}
