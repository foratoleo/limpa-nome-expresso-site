import { useState } from "react";
import { SearchIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TemplatesSidebar, TemplatesGrid } from "@/components/TemplatesSection";

export default function Templates() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClearFilters = () => {
    setActiveStep(null);
    setSearchQuery("");
  };

  const searchField = (
    <div
      className="flex items-center overflow-hidden rounded-full transition-all"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderBottom: searchQuery.length > 0 ? "2px solid #d39e17" : "2px solid transparent",
      }}
    >
      <div className="pl-4 flex items-center justify-center">
        <SearchIcon size="small" label="" />
      </div>
      <input
        type="text"
        placeholder="Buscar modelos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent border-none px-3 py-2.5 text-sm outline-none"
        style={{ color: "#f1f5f9" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}>
      <SiteHeader
        logoHref="/guia"
        navItems={[
          { href: "/guia", label: "Meus Processos" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos", active: true },
          { href: "/suporte", label: "Suporte" },
          { href: "/noticias", label: "Noticias" },
        ]}
        desktopNavTrailing={<SpecialAdvisoryNavCta />}
        desktopRightContent={
          <>
            <div className="hidden w-[256px] lg:block">{searchField}</div>
            <UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />
          </>
        }
        mobileTopActions={
          <>
            <SpecialAdvisoryNavCta shortLabel />
            <UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />
          </>
        }
        mobileDrawerContent={
          <div className="space-y-4">
            {searchField}
            <SpecialAdvisoryNavCta />
          </div>
        }
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Main Content */}
      <Container as="main" maxWidth="xl" className="py-8 flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
            Modelos e Templates
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Documentos pré-preenchidos para facilitar seu processo
          </p>
        </div>

        {/* Two-column layout: Sidebar + Main */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Sidebar — sticky on desktop, full width on mobile */}
          <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-24 shrink-0">
            <TemplatesSidebar
              activeStep={activeStep}
              onStepChange={setActiveStep}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <TemplatesGrid
              activeStep={activeStep}
              searchQuery={searchQuery}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}
