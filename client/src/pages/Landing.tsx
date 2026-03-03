import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentStatus } from "@/contexts/PaymentContext";
import {
  HeroSection,
  PainPointsSection,
  BenefitsSection,
  HowItWorksSection,
  SocialProofSection,
  LegalBasisSection,
  FAQSection,
  CTASection,
} from "@/components/landing";
// REMOVIDO: PricingSection antiga do Stripe - Agora usando checkout MercadoPago
// import { PricingSection } from "@/components/pricing";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { hasActiveAccess, loading: paymentLoading } = usePaymentStatus();
  const [, setLocation] = useLocation();

  // Redirect to /guia when user logs in
  useEffect(() => {
    if (user && !isAuthModalOpen && !paymentLoading) {
      if (hasActiveAccess) {
        setLocation("/guia");
      } else {
        // Don't auto-redirect to checkout - let user choose
        // setLocation("/checkout");
      }
    }
  }, [user, isAuthModalOpen, paymentLoading, hasActiveAccess, setLocation]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#12110d",
        fontFamily: "'Public Sans', sans-serif",
      }}
    >
      {/* Header - Sticky */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.5)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            <a href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17"/>
                  <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d"/>
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold whitespace-nowrap" style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
              </h2>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#beneficios" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>
                Benefícios
              </a>
              <a href="#como-funciona" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>
                Como Funciona
              </a>
              <a href="#base-legal" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>
                Base Legal
              </a>
              <a href="#faq" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>
                FAQ
              </a>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <a
                  href="/guia"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: "#d39e17",
                    color: "#12110d",
                  }}
                >
                  Acessar Guia
                </a>
                <button
                  onClick={signOut}
                  className="text-sm font-medium hover:text-[#d39e17] transition-colors"
                  style={{ color: "#cbd5e1" }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-medium hover:text-[#d39e17] transition-colors"
                  style={{ color: "#cbd5e1" }}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: "#d39e17",
                    color: "#12110d",
                  }}
                >
                  Crie sua conta
                </button>
              </>
            )}
          </div>
        </Container>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <PainPointsSection />
        <BenefitsSection />
        <HowItWorksSection />
        <SocialProofSection />
        <LegalBasisSection />
        {/* REMOVIDO: PricingSection antiga do Stripe - Agora usando checkout MercadoPago */}
        <FAQSection />
        <CTASection onOpenAuth={() => setIsAuthModalOpen(true)} />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 mt-auto"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.8)",
          borderColor: "rgba(211, 158, 23, 0.1)",
        }}
      >
        <Container as="div" maxWidth="xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M9 0L17.5 5V14L9 19L0.5 14V5L9 0Z" fill="#d39e17"/>
                <path d="M9 4L13 6.5V11.5L9 14L5 11.5V6.5L9 4Z" fill="#12110d"/>
              </svg>
              <span className="text-sm" style={{ color: "#64748b" }}>
                2026 Limpa Nome Expresso. Sistema de Apoio Jurídico Automático.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <a href="#termos" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>
                Termos de Uso
              </a>
              <a href="#privacidade" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>
                Privacidade
              </a>
              <a href="#oab" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>
                OAB Compliance
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
