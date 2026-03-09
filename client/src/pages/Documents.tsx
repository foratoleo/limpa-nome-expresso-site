import { useState } from "react";
import { SearchIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { LegalGuidesSection } from "@/components/legal-guides/LegalGuidesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documents() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("documentos");
  const searchField = (
    <div className="flex items-center overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
      <div className="pl-4 flex items-center justify-center">
        <SearchIcon size="small" label="" />
      </div>
      <input
        type="text"
        placeholder="Buscar documentos..."
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
          { href: "/documentos", label: "Documentos", active: true },
          { href: "/modelos", label: "Modelos" },
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
            Documentos
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Gerencie seus documentos e acesse guias jurídicos
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
            <TabsTrigger
              value="documentos"
              className="data-[state=active]:text-[#d39e17] data-[state=active]:bg-[#d39e17]/10"
              style={{ color: "#cbd5e1" }}
            >
              Meus Documentos
            </TabsTrigger>
            <TabsTrigger
              value="guias"
              className="data-[state=active]:text-[#d39e17] data-[state=active]:bg-[#d39e17]/10"
              style={{ color: "#cbd5e1" }}
            >
              Guias Jurídicos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documentos" className="space-y-6 mt-0">
            <DocumentsList />
          </TabsContent>

          <TabsContent value="guias" className="space-y-6 mt-0">
            <LegalGuidesSection />
          </TabsContent>
        </Tabs>
      </Container>

      <SiteFooter />
    </div>
  );
}
