import { PricingCard } from './PricingCard';

export function PricingSection() {
  return (
    <section id="precos" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
            Escolha seu <span style={{ color: '#d39e17' }}>Plano</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
            Invista na limpeza do seu nome e recupere sua paz financeira. Quanto antes começar, mais rápido terá resultados.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <PricingCard planType="basico" />
          <PricingCard planType="premium" popular />
          <PricingCard planType="vip" />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: '#64748b' }}>
            Pagamento processado com segurança pelo Stripe. Cancele quando quiser, sem multas.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-xs" style={{ color: '#64748b' }}>
              Garantia de 7 dias ou seu dinheiro de volta
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>
              Suporte via WhatsApp
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
