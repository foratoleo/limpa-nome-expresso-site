import { useState } from "react";
import { SearchIcon, DownloadIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { DownloadsSection } from "@/components/DownloadsSection";

export default function Downloads() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.5)",
          borderColor: "rgba(211, 158, 23, 0.2)"
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <a href="/guia" className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17"/>
                  <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
              </h2>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/processo" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Meu Processo</a>
              <a href="/documentos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Documentos</a>
              <a href="/modelos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Modelos</a>
              <a href="/downloads" className="text-sm font-medium transition-colors" style={{ color: "#d39e17" }}>Downloads</a>
              <a href="/suporte" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Suporte</a>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", maxWidth: 256 }}>
              <div className="pl-4 flex items-center justify-center">
                <SearchIcon size="small" label="" />
              </div>
              <input
                type="text"
                placeholder="Buscar downloads..."
                className="bg-transparent border-none outline-none py-2.5 px-3 text-sm w-full"
                style={{ color: "#f1f5f9" }}
              />
            </div>
            <UserProfile onOpenAuth={() => setIsAuthModalOpen(true)} />
          </div>
        </Container>
      </header>

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

      {/* Footer */}
      <footer
        className="border-t mt-8"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.8)",
          borderColor: "rgba(211, 158, 23, 0.1)"
        }}
      >
        <Container as="div" maxWidth="xl" className="py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 0L17.5 5V14L9 19L0.5 14V5L9 0Z" fill="#d39e17"/>
                <path d="M9 4L13 6.5V11.5L9 14L5 11.5V6.5L9 4Z" fill="#12110d"/>
              </svg>
              <span className="text-sm" style={{ color: "#64748b" }}>
                2026 Limpa Nome Expresso. Sistema de Apoio Jurídico Automático.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#termos" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Termos de Uso</a>
              <a href="#privacidade" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Privacidade</a>
              <a href="#oab" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>OAB Compliance</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
