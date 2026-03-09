import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentStatus } from "@/contexts/PaymentContext";
import { SiteHeader } from "@/components/SiteHeader";
import { LANDING_NAV_LINKS } from "@/components/layout/site-nav";
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
  const [authModalTab, setAuthModalTab] = useState<"login" | "register" | null>(null);
  const { user, signOut } = useAuth();
  const { hasActiveAccess, loading: paymentLoading } = usePaymentStatus();
  const [, setLocation] = useLocation();

  const handleRegisterSuccess = (email: string) => {
    setAuthModalTab(null);
    const emailParam = encodeURIComponent(email);
    setLocation(`/checkout?signup=1&email=${emailParam}`);
  };

  // Redirect to /guia when user logs in
  useEffect(() => {
    if (user && !authModalTab && !paymentLoading) {
      if (hasActiveAccess) {
        setLocation("/bem-vindo");
      } else {
        // Don't auto-redirect to checkout - let user choose
        // setLocation("/checkout");
      }
    }
  }, [user, authModalTab, paymentLoading, hasActiveAccess, setLocation]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#12110d",
        fontFamily: "'Public Sans', sans-serif",
      }}
    >
      <SiteHeader
        logoHref="/"
        navItems={LANDING_NAV_LINKS.map((item) => ({ ...item }))}
        hideLogoTextOnMobile={false}
        desktopRightContent={
          user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/guia"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5 sm:py-2.5"
                style={{
                  backgroundColor: "#d39e17",
                  color: "#12110d",
                }}
              >
                Acessar Guia
              </a>
              <button
                onClick={signOut}
                className="hidden text-sm font-medium transition-colors hover:text-[#d39e17] sm:inline-flex"
                style={{ color: "#cbd5e1" }}
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setAuthModalTab("login")}
                className="text-sm font-medium transition-colors hover:text-[#d39e17]"
                style={{ color: "#cbd5e1" }}
              >
                Entrar
              </button>
              <button
                onClick={() => setAuthModalTab("register")}
                className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all sm:inline-flex"
                style={{
                  backgroundColor: "#d39e17",
                  color: "#12110d",
                }}
              >
                Crie sua conta
              </button>
            </div>
          )
        }
        mobileTopActions={
          user ? (
            <a
              href="/guia"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all"
              style={{ backgroundColor: "#d39e17", color: "#12110d" }}
            >
              Guia
            </a>
          ) : (
            <button
              onClick={() => setAuthModalTab("login")}
              className="text-sm font-medium transition-colors hover:text-[#d39e17]"
              style={{ color: "#cbd5e1" }}
            >
              Entrar
            </button>
          )
        }
        mobileDrawerContent={(closeMenu) =>
          user ? (
            <div className="grid gap-2">
              <a
                href="/guia"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ backgroundColor: "#d39e17", color: "#12110d" }}
              >
                Acessar Guia
              </a>
              <button
                onClick={async () => {
                  closeMenu();
                  await signOut();
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium"
                style={{
                  borderColor: "rgba(239, 68, 68, 0.35)",
                  color: "#ef4444",
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <button
                onClick={() => {
                  closeMenu();
                  setAuthModalTab("login");
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium"
                style={{
                  borderColor: "rgba(211, 158, 23, 0.2)",
                  color: "#f1f5f9",
                }}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  closeMenu();
                  setAuthModalTab("register");
                }}
                className="rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ backgroundColor: "#d39e17", color: "#12110d" }}
              >
                Criar conta
              </button>
            </div>
          )
        }
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalTab !== null}
        onClose={() => setAuthModalTab(null)}
        defaultTab={authModalTab ?? undefined}
        onRegisterSuccess={handleRegisterSuccess}
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
        <CTASection onOpenAuth={() => setAuthModalTab("login")} />
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
                2026 CPF Blindado. Sistema de Apoio Jurídico Automático.
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
