/**
 * Analytics Utility for Checkout Events
 *
 * Provides event tracking for checkout flow with support for:
 * - Google Analytics 4 (gtag)
 * - Console logging for development
 *
 * Event categories track the complete purchase funnel:
 * - checkout_initiated: User clicked pay button
 * - checkout_completed: Payment successful
 * - checkout_failed: Payment failed or cancelled
 * - checkout_abandoned: User left checkout without completing
 */

// Payment provider types
export type PaymentProvider = 'mercadopago' | 'kiwify';

// Checkout event types
export type CheckoutEventType =
  | 'checkout_initiated'
  | 'checkout_completed'
  | 'checkout_failed'
  | 'checkout_abandoned';

// Event properties interface
export interface CheckoutEventProperties {
  provider: PaymentProvider;
  product_id: string;
  product_name: string;
  price: number;
  currency: string;
  user_id?: string;
  email?: string;
  error_message?: string;
  sale_id?: string;
  external_reference?: string;
}

// Google Analytics event interface
interface GtagEvent {
  event: string;
  event_category: string;
  event_label: string;
  value: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
  [key: string]: unknown;
}

// Window with gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams: GtagEvent
    ) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Check if Google Analytics is available
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Track checkout event
 *
 * Sends event to Google Analytics and logs to console in development.
 * This allows tracking conversion rates between payment providers.
 */
export function trackCheckoutEvent(
  eventType: CheckoutEventType,
  properties: CheckoutEventProperties
): void {
  const {
    provider,
    product_id,
    product_name,
    price,
    currency,
    user_id,
    email,
    error_message,
    sale_id,
    external_reference,
  } = properties;

  // Build event data
  const eventData: GtagEvent = {
    event: eventType,
    event_category: 'checkout',
    event_label: `${provider}_${eventType}`,
    value: price,
    items: [
      {
        item_id: product_id,
        item_name: product_name,
        price: price,
        quantity: 1,
      },
    ],
    provider,
    product_id,
    product_name,
    currency,
    ...(user_id && { user_id }),
    ...(email && { email }),
    ...(error_message && { error_message }),
    ...(sale_id && { sale_id }),
    ...(external_reference && { external_reference }),
  };

  // Log to console in development
  if (isDevelopment()) {
    console.log('[Analytics]', eventType, {
      provider,
      product_id,
      product_name,
      price,
      currency,
      user_id,
      email,
      error_message,
      sale_id,
      external_reference,
    });
  }

  // Send to Google Analytics if available
  if (isGtagAvailable() && window.gtag) {
    try {
      window.gtag('event', eventType, eventData);
    } catch (error) {
      console.error('[Analytics] Failed to send event to Google Analytics:', error);
    }
  }

  // Push to dataLayer for GTM if available
  if (typeof window !== 'undefined' && window.dataLayer) {
    try {
      window.dataLayer.push(eventData);
    } catch (error) {
      console.error('[Analytics] Failed to push to dataLayer:', error);
    }
  }
}

/**
 * Track checkout initiation
 *
 * Call this when user clicks the payment button and is about to be redirected
 * to the payment provider's checkout page.
 */
export function trackCheckoutInitiated(properties: Omit<CheckoutEventProperties, 'error_message' | 'sale_id'>): void {
  trackCheckoutEvent('checkout_initiated', properties);
}

/**
 * Track successful checkout completion
 *
 * Call this when payment is confirmed and user lands on success page.
 */
export function trackCheckoutCompleted(properties: Omit<CheckoutEventProperties, 'error_message'>): void {
  trackCheckoutEvent('checkout_completed', properties);
}

/**
 * Track failed checkout
 *
 * Call this when payment fails or is cancelled.
 */
export function trackCheckoutFailed(properties: CheckoutEventProperties): void {
  trackCheckoutEvent('checkout_failed', properties);
}

/**
 * Track checkout abandonment
 *
 * Call this when user leaves the checkout without completing.
 * This is typically tracked via page unload or navigation events.
 */
export function trackCheckoutAbandoned(properties: Omit<CheckoutEventProperties, 'error_message' | 'sale_id'>): void {
  trackCheckoutEvent('checkout_abandoned', properties);
}

/**
 * Get payment source from URL parameters
 *
 * Extracts the 'source' query parameter to identify which payment provider
 * redirected the user back to the success/failure page.
 */
export function getPaymentSourceFromUrl(): PaymentProvider | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');

  if (source === 'kiwify') return 'kiwify';
  if (source === 'mercadopago') return 'mercadopago';

  return null;
}

/**
 * Get external reference from URL parameters
 *
 * Extracts the external_reference or sale reference from URL for tracking.
 */
export function getExternalReferenceFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('external_reference') || params.get('preference_id') || params.get('sale_id');
}

// Analytics configuration
export const ANALYTICS_CONFIG = {
  // Product ID for tracking
  productId: 'limpa_nome_expresso_12_months',
  productName: 'CPF Blindado - Acesso Premium',
  currency: 'BRL',
  price: 149.90,
} as const;
