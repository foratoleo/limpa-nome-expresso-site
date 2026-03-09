/**
 * Kiwify Frontend Configuration
 *
 * Frontend-safe configuration values for Kiwify payment integration.
 * This file contains only client-side safe constants - no secrets exposed.
 *
 * @module client/src/lib/kiwify-config
 */

/**
 * Kiwify product definition matching MercadoPago pattern
 */
export const KIWIFY_PRODUCT = {
  id: 'limpa_nome_expresso_12_months',
  title: 'CPF Blindado - Acesso Premium',
  quantity: 1,
  unit_price: 149.90,
  currency: 'BRL',
  duration: '12 meses de acesso',
} as const;

/**
 * Kiwify special advisory product (premium service)
 */
export const KIWIFY_SPECIAL_ADVISORY_PRODUCT = {
  id: 'limpa_nome_expresso_assessoria_especializada',
  title: 'CPF Blindado - Assessoria Especializada Completa',
  quantity: 1,
  unit_price: 997.0,
  currency: 'BRL',
  duration: 'Servico completo com equipe dedicada',
} as const;

/**
 * Kiwify checkout URLs
 */
export const KIWIFY_CHECKOUT_CONFIG = {
  /**
   * Base URL for Kiwify checkout pages
   */
  checkoutBaseUrl: 'https://pay.kiwify.com.br',

  /**
   * Default product slug (can be overridden via environment)
   */
  productSlug: 'cpf-blindado-premium',

  /**
   * Redirect URLs after payment
   */
  redirectUrls: {
    success: '/checkout/sucesso?source=kiwify',
    failure: '/checkout/falha?source=kiwify',
  },

  /**
   * Payment source identifier for tracking
   */
  source: 'kiwify',
} as const;

/**
 * UTM parameter defaults for Kiwify checkout tracking
 */
export const KIWIFY_UTM_DEFAULTS = {
  /**
   * Default UTM source
   */
  source: 'cpfblindado',

  /**
   * Default UTM medium
   */
  medium: 'checkout',

  /**
   * Default UTM campaign
   */
  campaign: 'premium_access',
} as const;

/**
 * Checkout benefits displayed on payment pages
 * Shared between MercadoPago and Kiwify checkout flows
 */
export const CHECKOUT_BENEFITS_KIWIFY = [
  {
    icon: 'FileText',
    title: 'Guias Juridicos Completos',
    description: 'Acesso a todos os guias para limpeza de nome em Sao Paulo',
  },
  {
    icon: 'Scale',
    title: 'Modelos de Documentos',
    description: 'Modelos prontos para peticoes, requerimentos e mais',
  },
  {
    icon: 'Clock',
    title: 'Atualizacoes Constantes',
    description: 'Conteudo atualizado com as ultimas mudancas na legislacao',
  },
  {
    icon: 'Shield',
    title: 'Suporte Especializado',
    description: 'Tire duvidas sobre o processo de limpeza de nome',
  },
  {
    icon: 'Smartphone',
    title: 'Acesso em Qualquer Dispositivo',
    description: 'Acesse de celular, tablet ou computador',
  },
] as const;

/**
 * Kiwify payment status types for frontend display
 */
export type KiwifyPaymentStatus =
  | 'approved'
  | 'pending'
  | 'waiting_payment'
  | 'refused'
  | 'refunded'
  | 'chargedback';

/**
 * Kiwify payment status display configuration
 */
export const KIWIFY_STATUS_DISPLAY: Record<
  KiwifyPaymentStatus,
  {
    label: string;
    labelColor: string;
    description: string;
  }
> = {
  approved: {
    label: 'Aprovado',
    labelColor: '#22c55e',
    description: 'Pagamento confirmado. Seu acesso premium foi liberado.',
  },
  pending: {
    label: 'Pendente',
    labelColor: '#eab308',
    description: 'Aguardando confirmacao do pagamento.',
  },
  waiting_payment: {
    label: 'Aguardando Pagamento',
    labelColor: '#eab308',
    description: 'Aguardando a realizacao do pagamento.',
  },
  refused: {
    label: 'Recusado',
    labelColor: '#ef4444',
    description: 'O pagamento foi recusado. Tente novamente.',
  },
  refunded: {
    label: 'Reembolsado',
    labelColor: '#64748b',
    description: 'O pagamento foi reembolsado.',
  },
  chargedback: {
    label: 'Chargeback',
    labelColor: '#ef4444',
    description: 'O pagamento foi contestado.',
  },
};

/**
 * Netlify function endpoint for Kiwify checkout
 */
export const KIWIFY_API_ENDPOINTS = {
  /**
   * Create checkout preference/URL
   */
  createPreference: '/.netlify/functions/create-preference-kiwify',
} as const;

/**
 * Build Kiwify checkout URL with parameters
 *
 * @param options - Checkout options
 * @returns Complete Kiwify checkout URL
 */
export function buildKiwifyCheckoutUrl(options: {
  productSlug?: string;
  email?: string;
  externalReference?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}): string {
  const {
    productSlug = KIWIFY_CHECKOUT_CONFIG.productSlug,
    email,
    externalReference,
    utm,
  } = options;

  const url = new URL(`/${productSlug}`, KIWIFY_CHECKOUT_CONFIG.checkoutBaseUrl);

  // Pre-fill email for better conversion
  if (email) {
    url.searchParams.set('email', email);
  }

  // Add external reference for tracking
  if (externalReference) {
    url.searchParams.set('external_reference', externalReference);
  }

  // Add UTM parameters
  const utmSource = utm?.source || KIWIFY_UTM_DEFAULTS.source;
  const utmMedium = utm?.medium || KIWIFY_UTM_DEFAULTS.medium;
  const utmCampaign = utm?.campaign || KIWIFY_UTM_DEFAULTS.campaign;

  url.searchParams.set('utm_source', utmSource);
  url.searchParams.set('utm_medium', utmMedium);
  url.searchParams.set('utm_campaign', utmCampaign);

  return url.toString();
}

/**
 * Build redirect URLs for Kiwify checkout
 *
 * @param baseUrl - Site base URL (from environment or window.location.origin)
 * @returns Redirect URLs for success and failure
 */
export function buildKiwifyRedirectUrls(baseUrl: string): {
  success: string;
  failure: string;
} {
  return {
    success: `${baseUrl}${KIWIFY_CHECKOUT_CONFIG.redirectUrls.success}`,
    failure: `${baseUrl}${KIWIFY_CHECKOUT_CONFIG.redirectUrls.failure}`,
  };
}

/**
 * Get payment status display configuration
 *
 * @param status - Kiwify payment status
 * @returns Display configuration for the status
 */
export function getKiwifyStatusDisplay(status: KiwifyPaymentStatus) {
  return KIWIFY_STATUS_DISPLAY[status] || KIWIFY_STATUS_DISPLAY.pending;
}
