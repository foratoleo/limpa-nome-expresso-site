import { useState } from 'react';
import { STRIPE_PRICES, formatCurrency, type PlanType } from '@/lib/stripe-config';
import { useSubscription } from '@/hooks/useSubscription';
import { Check } from 'lucide-react';

interface PricingCardProps {
  planType: PlanType;
  popular?: boolean;
}

export function PricingCard({ planType, popular = false }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const { createCheckoutSession, hasActiveSubscription } = useSubscription();

  const plan = STRIPE_PRICES[planType];

  const handleSubscribe = async () => {
    if (hasActiveSubscription) {
      alert('Você já possui uma assinatura ativa.');
      return;
    }

    setLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession(plan.priceId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert('Erro ao criar sessão de pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border p-6 backdrop-blur-[4px] transition-all ${
        popular
          ? 'border-[#d39e17] ring-2 ring-[#d39e17]/20'
          : 'border-[rgba(211,158,23,0.2)]'
      }`}
      style={{
        backgroundColor: popular ? 'rgba(22, 40, 71, 0.8)' : 'rgba(22, 40, 71, 0.6)',
      }}
    >
      {popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: '#d39e17', color: '#12110d' }}
        >
          Mais Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
          {plan.name}
        </h3>
        <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
          {plan.description}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold" style={{ color: '#d39e17' }}>
            {formatCurrency(plan.amount)}
          </span>
          <span className="text-sm" style={{ color: '#64748b' }}>
            /mês
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
            <span className="text-sm" style={{ color: '#cbd5e1' }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || hasActiveSubscription}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
          popular ? '' : ''
        }`}
        style={{
          backgroundColor: popular ? '#d39e17' : 'rgba(211, 158, 23, 0.2)',
          color: popular ? '#12110d' : '#d39e17',
          cursor: loading || hasActiveSubscription ? 'not-allowed' : 'pointer',
          opacity: loading || hasActiveSubscription ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading && !hasActiveSubscription) {
            e.currentTarget.style.backgroundColor = popular
              ? '#e5b020'
              : 'rgba(211, 158, 23, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = popular
            ? '#d39e17'
            : 'rgba(211, 158, 23, 0.2)';
        }}
      >
        {loading ? 'Processando...' : hasActiveSubscription ? 'Assinatura Ativa' : 'Assinar Agora'}
      </button>
    </div>
  );
}
