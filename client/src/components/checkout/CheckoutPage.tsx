import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/container';
import { MERCADOPAGO_PRODUCT } from '@/lib/mercadopago-config';
import { KIWIFY_PRODUCT, KIWIFY_API_ENDPOINTS } from '@/lib/kiwify-config';
import { createSingleItemPreference } from '@/lib/api/mercadopago';
import { BenefitsList } from './BenefitsList';
import { PricingCard } from './PricingCard';
import { useAuth } from '@/contexts/AuthContext';
import { trackCheckoutInitiated, trackCheckoutFailed } from '@/lib/analytics';

type PaymentProvider = 'mercadopago' | 'kiwify';

const COLORS = {
  background: '#12110d',
  navy: '#162847',
  gold: '#d39e17',
  goldLight: '#e5b020',
  green: '#22c55e',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
} as const;

export function CheckoutPage() {
  const [loading, setLoading] = useState<PaymentProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signup = params.get('signup');

    if (signup === '1') {
      const emailFromUrl = params.get('email');
      setSignupEmail(emailFromUrl || user?.email || null);
      setShowSignupPopup(true);

      params.delete('signup');
      params.delete('email');
      const query = params.toString();
      const cleanUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [user?.email]);

  const handleMercadoPagoPayment = async () => {
    setError(null);
    setLoading('mercadopago');

    // Track checkout initiated event
    trackCheckoutInitiated({
      provider: 'mercadopago',
      product_id: MERCADOPAGO_PRODUCT.id,
      product_name: MERCADOPAGO_PRODUCT.title,
      price: MERCADOPAGO_PRODUCT.unit_price,
      currency: MERCADOPAGO_PRODUCT.currency,
      user_id: user?.id,
      email: user?.email,
    });

    try {
      const { checkoutUrl } = await createSingleItemPreference({
        id: MERCADOPAGO_PRODUCT.id,
        title: MERCADOPAGO_PRODUCT.title,
        quantity: MERCADOPAGO_PRODUCT.quantity,
        unit_price: MERCADOPAGO_PRODUCT.unit_price,
      }, user?.id);

      // Redirect to MercadoPago checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Checkout URL not returned');
      }
    } catch (err) {
      console.error('MercadoPago payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(
        'Erro ao processar pagamento via MercadoPago. Por favor, tente novamente ou use a opcao Kiwify.'
      );

      // Track checkout failed event
      trackCheckoutFailed({
        provider: 'mercadopago',
        product_id: MERCADOPAGO_PRODUCT.id,
        product_name: MERCADOPAGO_PRODUCT.title,
        price: MERCADOPAGO_PRODUCT.unit_price,
        currency: MERCADOPAGO_PRODUCT.currency,
        user_id: user?.id,
        email: user?.email,
        error_message: errorMessage,
      });

      setLoading(null);
    }
  };

  const handleKiwifyPayment = async () => {
    setError(null);
    setLoading('kiwify');

    // Track checkout initiated event
    trackCheckoutInitiated({
      provider: 'kiwify',
      product_id: KIWIFY_PRODUCT.id,
      product_name: KIWIFY_PRODUCT.title,
      price: KIWIFY_PRODUCT.unit_price,
      currency: KIWIFY_PRODUCT.currency,
      user_id: user?.id,
      email: user?.email,
    });

    try {
      const response = await fetch(KIWIFY_API_ENDPOINTS.createPreference, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          metadata: {
            source: 'checkout_page',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Kiwify checkout');
      }

      const data = await response.json();

      // Redirect to Kiwify checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not returned');
      }
    } catch (err) {
      console.error('Kiwify payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(
        'Erro ao processar pagamento via Kiwify. Por favor, tente novamente ou use a opcao MercadoPago.'
      );

      // Track checkout failed event
      trackCheckoutFailed({
        provider: 'kiwify',
        product_id: KIWIFY_PRODUCT.id,
        product_name: KIWIFY_PRODUCT.title,
        price: KIWIFY_PRODUCT.unit_price,
        currency: KIWIFY_PRODUCT.currency,
        user_id: user?.id,
        email: user?.email,
        error_message: errorMessage,
      });

      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      {showSignupPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.58)' }}
            onClick={() => setShowSignupPopup(false)}
          />
          <div
            className="relative w-full max-w-xl rounded-2xl border p-6 sm:p-7"
            style={{
              backgroundColor: 'rgba(22, 40, 71, 0.98)',
              borderColor: 'rgba(211, 158, 23, 0.35)',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: COLORS.gold }}>
                  Conta criada
                </p>
                <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.textPrimary }}>
                  Confirme seu e-mail para ativar o acesso
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Enviamos um link de confirmação para{' '}
                  <strong style={{ color: COLORS.textPrimary }}>{signupEmail || 'seu e-mail'}</strong>.
                  Verifique sua caixa de entrada e também a pasta de spam/lixo eletrônico.
                </p>
              </div>
              <button
                onClick={() => setShowSignupPopup(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(148, 163, 184, 0.14)',
                  color: COLORS.textPrimary,
                }}
              >
                Fechar
              </button>
            </div>
            <div
              className="mt-5 rounded-xl border p-4 text-sm"
              style={{
                backgroundColor: 'rgba(211, 158, 23, 0.1)',
                borderColor: 'rgba(211, 158, 23, 0.25)',
                color: '#f8fafc',
              }}
            >
              O checkout já está aberto abaixo para você concluir quando quiser.
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-4 py-12 md:px-10 md:py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(211, 158, 23, 0.15)', border: '1px solid rgba(211, 158, 23, 0.3)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.gold }} />
              <span className="text-xs font-semibold" style={{ color: COLORS.gold }}>
                CHECKOUT SEGURO
              </span>
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: COLORS.textPrimary }}
            >
              Conclua seu{' '}
              <span style={{ color: COLORS.gold }}>Acesso Premium</span>
            </h1>

            <p
              className="text-lg md:text-base"
              style={{ color: COLORS.textSecondary }}
            >
              Você está a um passo de acessar todos os guias jurídicos, modelos de
              documentos e suporte especializado para limpeza de nome em São Paulo.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Left Column - Benefits */}
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: COLORS.textPrimary }}
              >
                O que está incluso:
              </h2>
              <BenefitsList />
            </div>

            {/* Right Column - Pricing Card */}
            <div>
              <PricingCard
                price={MERCADOPAGO_PRODUCT.unit_price}
                duration={MERCADOPAGO_PRODUCT.duration}
                highlighted
              />

              {/* Error Message */}
              {error && (
                <div
                  className="mt-4 p-4 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Payment Options Divider */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(211, 158, 23, 0.2)' }} />
                <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
                  Escolha sua forma de pagamento
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(211, 158, 23, 0.2)' }} />
              </div>

              {/* MercadoPago Button */}
              <button
                onClick={handleMercadoPagoPayment}
                disabled={loading !== null}
                className="w-full mt-4 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: loading === 'mercadopago' ? 'rgba(211, 158, 23, 0.5)' : COLORS.gold,
                  color: '#12110d',
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                  opacity: loading !== null && loading !== 'mercadopago' ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.backgroundColor = COLORS.goldLight;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.gold;
                }}
              >
                {loading === 'mercadopago' ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-2"
                      style={{
                        borderColor: '#12110d',
                        borderTopColor: 'transparent',
                      }}
                    />
                    Processando...
                  </>
                ) : (
                  <>
                    PAGAR COM MERCADOPAGO
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Kiwify Button */}
              <button
                onClick={handleKiwifyPayment}
                disabled={loading !== null}
                className="w-full mt-3 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 border-2"
                style={{
                  backgroundColor: loading === 'kiwify' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  borderColor: loading === 'kiwify' ? COLORS.green : 'rgba(34, 197, 94, 0.5)',
                  color: loading === 'kiwify' ? COLORS.green : '#22c55e',
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                  opacity: loading !== null && loading !== 'kiwify' ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (loading !== 'kiwify') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {loading === 'kiwify' ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-2"
                      style={{
                        borderColor: COLORS.green,
                        borderTopColor: 'transparent',
                      }}
                    />
                    Processando...
                  </>
                ) : (
                  <>
                    PAGAR COM KIWIFY
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Trust Signals */}
              <div className="mt-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: COLORS.green }}
                  >
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                    Pagamento 100% seguro via MercadoPago ou Kiwify
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: COLORS.green }}
                  >
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                    Acesso liberado imediatamente apos confirmacao
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Support Section */}
      <section className="py-12">
        <Container>
          <div
            className="text-center p-6 rounded-2xl max-w-2xl mx-auto"
            style={{
              backgroundColor: 'rgba(22, 40, 71, 0.4)',
              border: '1px solid rgba(211, 158, 23, 0.1)',
            }}
          >
            <p
              className="text-sm mb-2"
              style={{ color: COLORS.textSecondary }}
            >
              Precisa de ajuda?
            </p>
            <p
              className="text-sm"
              style={{ color: COLORS.textPrimary }}
            >
              Entre em contato com nosso suporte via WhatsApp ou email
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
