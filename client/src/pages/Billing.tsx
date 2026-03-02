import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { formatCurrency, STRIPE_PRICES } from '@/lib/stripe-config';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';

export default function Billing() {
  const { user } = useAuth();
  const { subscription, loading, hasActiveSubscription, createPortalSession } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const portalUrl = await createPortalSession();
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  // Find plan details from subscription
  const getPlanDetails = () => {
    if (!subscription) return null;

    for (const [key, plan] of Object.entries(STRIPE_PRICES)) {
      if (plan.priceId === subscription.stripe_price_id) {
        return { type: key, ...plan };
      }
    }
    return null;
  };

  const planDetails = getPlanDetails();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#12110d' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d39e17' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#12110d' }}>
      <Container as="div" maxWidth="md">
        <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#f1f5f9' }}>
          Gerenciar <span style={{ color: '#d39e17' }}>Assinatura</span>
        </h1>

        {/* Current Plan */}
        <div
          className="rounded-2xl border p-6 mb-6"
          style={{
            backgroundColor: 'rgba(22, 40, 71, 0.6)',
            borderColor: 'rgba(211, 158, 23, 0.2)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#f1f5f9' }}>
                Plano Atual
              </h2>
              {hasActiveSubscription && planDetails ? (
                <>
                  <p className="text-xl font-bold" style={{ color: '#d39e17' }}>
                    {planDetails.name}
                  </p>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    {formatCurrency(planDetails.amount)}/mês
                  </p>
                </>
              ) : (
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Nenhuma assinatura ativa
                </p>
              )}
            </div>
            <CreditCard className="w-8 h-8" style={{ color: '#d39e17' }} />
          </div>

          {hasActiveSubscription && subscription && (
            <div className="text-sm space-y-1" style={{ color: '#64748b' }}>
              <p> Status: <span style={{ color: '#22c55e' }}>Ativo</span> </p>
              <p>
                Próxima cobrança:{' '}
                {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {hasActiveSubscription ? (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: 'rgba(211, 158, 23, 0.2)',
              color: '#d39e17',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(211, 158, 23, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(211, 158, 23, 0.2)')}
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {portalLoading ? 'Carregando...' : 'Gerenciar Pagamentos'}
          </button>
        ) : (
          <div
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: 'rgba(211, 158, 23, 0.1)' }}
          >
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              Você ainda não possui uma assinatura ativa.
            </p>
            <a
              href="/#precos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: '#d39e17', color: '#12110d' }}
            >
              Ver Planos
            </a>
          </div>
        )}

        {/* Account Info */}
        <div
          className="rounded-2xl border p-6 mt-6"
          style={{
            backgroundColor: 'rgba(22, 40, 71, 0.6)',
            borderColor: 'rgba(211, 158, 23, 0.2)',
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#f1f5f9' }}>
            Informações da Conta
          </h3>
          <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>ID:</strong> {user?.id?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
