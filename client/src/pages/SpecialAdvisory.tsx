import { useState } from "react";
import { Container } from "@/components/ui/container";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { createSingleItemPreference } from "@/lib/api/mercadopago";
import { MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT } from "@/lib/mercadopago-config";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";

const PROCESS_STEPS = [
  {
    title: "1. Você só envia os dados",
    description:
      "Você preenche um formulário simples e anexa os documentos básicos. Nada de montar petição por conta própria.",
  },
  {
    title: "2. Nossa equipe estrutura o caso",
    description:
      "Fazemos triagem técnica, revisão de provas, estratégia jurídica e organização completa dos prazos.",
  },
  {
    title: "3. Condução operacional total",
    description:
      "Assumimos o fluxo de execução do processo, com acompanhamento ativo e comunicação clara de cada etapa.",
  },
  {
    title: "4. Acompanhamento até a conclusão",
    description:
      "Você recebe atualizações objetivas sem precisar correr atrás de cada detalhe técnico.",
  },
] as const;

const INCLUDED_ITEMS = [
  "Análise jurídica personalizada do seu caso",
  "Checklist inteligente e validação dos documentos",
  "Preparação estratégica completa do processo",
  "Acompanhamento dedicado da equipe especializada",
  "Suporte prioritário durante toda a assessoria",
] as const;

export default function SpecialAdvisory() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.unit_price);

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const { checkoutUrl } = await createSingleItemPreference(
        {
          id: MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.id,
          title: MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.title,
          quantity: MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.quantity,
          unit_price: MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.unit_price,
        },
        user?.id,
      );

      if (!checkoutUrl) {
        throw new Error("Checkout URL not returned");
      }

      window.location.href = checkoutUrl;
    } catch (checkoutError) {
      console.error("Error creating special advisory checkout:", checkoutError);
      setError("Não foi possível iniciar o checkout agora. Tente novamente em instantes.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}
    >
      <SiteHeader
        logoHref="/guia"
        navItems={[
          { href: "/processo", label: "Meu Processo" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/downloads", label: "Downloads" },
          { href: "/suporte", label: "Suporte" },
          { href: "/noticias", label: "Noticias" },
        ]}
        desktopNavTrailing={<SpecialAdvisoryNavCta active />}
        desktopRightContent={<UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />}
        mobileTopActions={
          <>
            <SpecialAdvisoryNavCta active shortLabel />
            <UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />
          </>
        }
        mobileDrawerContent={<SpecialAdvisoryNavCta active />}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main className="flex-1">
        <section className="pt-10 pb-8">
          <Container as="div" maxWidth="xl">
            <div
              className="rounded-3xl border p-8 md:p-10"
              style={{
                background: "radial-gradient(circle at top right, rgba(211, 158, 23, 0.2), rgba(22, 40, 71, 0.95) 50%)",
                borderColor: "rgba(211, 158, 23, 0.3)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: "#fde047" }}
              >
                Serviço Premium
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: "#f8fafc" }}>
                Assessoria Especializada: você só envia os dados e nossa equipe faz todo o processo
              </h1>
              <p className="text-base md:text-lg max-w-3xl" style={{ color: "#cbd5e1" }}>
                Esta modalidade é para quem quer resultado com mínimo esforço operacional. Você fornece as informações e
                a equipe do CPF Blindado assume a execução completa da estratégia.
              </p>
              <a
                href="#checkout-assessoria"
                className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl font-bold transition-transform hover:scale-[1.02]"
                style={{
                  color: "#12110d",
                  backgroundColor: "#d39e17",
                }}
              >
                Contratar agora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </Container>
        </section>

        <section className="pb-8">
          <Container as="div" maxWidth="xl">
            <div className="grid md:grid-cols-2 gap-6">
              {PROCESS_STEPS.map((step) => (
                <article
                  key={step.title}
                  className="rounded-2xl border p-6"
                  style={{
                    backgroundColor: "rgba(22, 40, 71, 0.92)",
                    borderColor: "rgba(211, 158, 23, 0.2)",
                  }}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#f8fafc" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-10">
          <Container as="div" maxWidth="xl">
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{
                backgroundColor: "rgba(18, 17, 13, 0.6)",
                borderColor: "rgba(211, 158, 23, 0.15)",
              }}
            >
              <h2 className="text-2xl font-bold mb-5" style={{ color: "#f8fafc" }}>
                O que está incluído na assessoria
              </h2>
              <ul className="space-y-3">
                {INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.18)", color: "#22c55e" }}
                    >
                      ✓
                    </span>
                    <span className="text-sm md:text-base" style={{ color: "#cbd5e1" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section id="checkout-assessoria" className="pb-14">
          <Container as="div" maxWidth="md">
            <div
              className="rounded-3xl border p-7 md:p-8"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.98)",
                borderColor: "rgba(211, 158, 23, 0.3)",
                boxShadow: "0 30px 70px rgba(0, 0, 0, 0.35)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: "#d39e17" }}>
                Checkout da Assessoria
              </p>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>
                Contrate a Assessoria Especializada Completa
              </h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                Serviço para quem quer delegar a execução do processo para uma equipe dedicada.
              </p>

              <div
                className="rounded-2xl border p-5 mb-6"
                style={{
                  backgroundColor: "rgba(18, 17, 13, 0.6)",
                  borderColor: "rgba(211, 158, 23, 0.2)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#f8fafc" }}>
                      Assessoria Especializada Completa
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                      {MERCADOPAGO_SPECIAL_ADVISORY_PRODUCT.duration}
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold" style={{ color: "#fde047" }}>
                    {formattedPrice}
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className="mb-5 p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 rounded-xl text-base font-bold transition-all"
                style={{
                  backgroundColor: loading ? "rgba(211, 158, 23, 0.45)" : "#d39e17",
                  color: "#12110d",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Iniciando checkout..." : "QUERO QUE A EQUIPE CUIDE DE TUDO"}
              </button>

              <p className="text-xs mt-4 text-center" style={{ color: "#64748b" }}>
                Pagamento processado com segurança via Mercado Pago.
              </p>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
