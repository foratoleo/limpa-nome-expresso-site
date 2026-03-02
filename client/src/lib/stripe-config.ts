// Stripe configuration - Price IDs from Stripe Dashboard
// These are the live price IDs created via Stripe MCP

export const STRIPE_PRICES = {
  basico: {
    priceId: 'price_1T6ZXcBh5qttJQ24jI2X6QrK',
    amount: 9700, // R$97.00 in cents
    name: 'Plano Básico',
    description: 'Acesso ao guia completo de limpeza de nome + Checklist interativa + Modelos de documentos básicos',
    features: [
      'Guia completo passo a passo',
      'Checklist interativa',
      'Modelos de documentos básicos',
      'Acesso por 30 dias',
    ],
  },
  premium: {
    priceId: 'price_1T6ZXcBh5qttJQ24FJDkfQNC',
    amount: 19700, // R$197.00 in cents
    name: 'Plano Premium',
    description: 'Tudo do Plano Básico + Modelos avançados + Suporte por email + Consulta por chat',
    features: [
      'Tudo do Plano Básico',
      'Modelos de documentos avançados',
      'Suporte por email',
      'Consulta por chat',
      'Acesso por 60 dias',
    ],
  },
  vip: {
    priceId: 'price_1T6ZXdBh5qttJQ24hYSm6HII',
    amount: 49700, // R$497.00 in cents
    name: 'Plano VIP',
    description: 'Tudo do Premium + Consultoria individual 1-1 + Suporte prioritário + Acompanhamento personalizado',
    features: [
      'Tudo do Plano Premium',
      'Consultoria individual 1-1',
      'Suporte prioritário',
      'Acompanhamento personalizado',
      'Acesso vitalício',
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PRICES;

export const formatCurrency = (amount: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

// API endpoints
export const API_ENDPOINTS = {
  createCheckoutSession: '/api/stripe/create-checkout-session',
  createPortalSession: '/api/stripe/create-portal-session',
  getSubscription: '/api/stripe/subscription',
} as const;
