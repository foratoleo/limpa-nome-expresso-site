import { useState } from "react";
import { SearchIcon, DownloadIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DownloadsSection } from "@/components/DownloadsSection";

export default function Downloads() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const searchField = (
    <div className="flex items-center overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
      <div className="pl-4 flex items-center justify-center">
        <SearchIcon size="small" label="" />
      </div>
      <input
        type="text"
        placeholder="Buscar downloads..."
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
          { href: "/processo", label: "Meu Processo" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/downloads", label: "Downloads", active: true },
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
          <div className="flex items-center gap-3 mb-2">
            <DownloadIcon size="medium" label="" />
            <h1 className="text-3xl font-bold" style={{ color: "#f1f5f9" }}>
              Downloads
            </h1>
          </div>
          <p className="text-sm max-w-2xl" style={{ color: "#94a3b8" }}>
            Baixe todos os documentos necessários para seu processo de limpeza de nome.
            Cada arquivo está otimizado para facilitar seu preenchimento.
          </p>
        </div>

        {/* Info Banner */}
        <div
          className="mb-8 p-5 rounded-2xl border flex items-start gap-4"
          style={{
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            borderColor: "rgba(96, 165, 250, 0.3)"
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold mb-1" style={{ color: "#60a5fa" }}>Como usar os downloads</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              Os documentos estão no formato Markdown (.md) e podem ser abertos em qualquer editor de texto.
              Recomendamos usar o Notepad (Windows), TextEdit (Mac) ou qualquer editor de código.
              Preencha os campos destacados com suas informações pessoais antes de utilizar.
            </p>
          </div>
        </div>

        {/* Downloads Section */}
        <DownloadsSection />

        {/* Additional Downloads */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#f1f5f9" }}>
            Documentos Complementares
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/docs/checklist_documentos.md"
              download
              className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:border-[#d39e17]"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                borderColor: "rgba(211, 158, 23, 0.2)"
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(211, 158, 23, 0.15)" }}
              >
                <DownloadIcon size="medium" label="" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#f1f5f9" }}>Procuração Ad Judicia</p>
                <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>Modelo de procuração para representação legal</p>
              </div>
            </a>
            <a
              href="/docs/peticao_inicial_jec_sp.md"
              download
              className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:border-[#60a5fa]"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                borderColor: "rgba(96, 165, 250, 0.2)"
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(96, 165, 250, 0.15)" }}
              >
                <DownloadIcon size="medium" label="" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#f1f5f9" }}>Declaração de Pobreza</p>
                <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>Declaração para gratuidade de justiça</p>
              </div>
            </a>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}
