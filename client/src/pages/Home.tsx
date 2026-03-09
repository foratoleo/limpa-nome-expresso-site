import { useState } from "react";
import { SearchIcon } from "@/utils/icons";

import { GlobalProgressBar, StickyProgressBar } from "@/components/ProgressBar";
import { Container } from "@/components/ui/container";
import { useChecklistSync } from "@/hooks/useChecklistSync";
import { useCurrentPhase } from "@/hooks/useCurrentPhase";
import { useSearchGuide } from "@/hooks/useSearchGuide";
import { SearchResults } from "@/components/SearchResults";
import { UserProfile } from "@/components/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { GuideButton, GuidePanel, ProcessMap } from "@/components/roadmap";
import { PhaseTrail } from "@/components/PhaseTrail";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { TOTAL_ITEMS } from "@/data/steps";
import type { Step, CheckItem } from "@/data/steps";

// Re-export for backward compatibility with other components
export type { Step, CheckItem };

export default function Home() {
  const { checked, toggle, progress, totalChecked, totalItems, resetAll, loading, syncError } = useChecklistSync(TOTAL_ITEMS);
  const { query, setQuery, results, hasResults, clearSearch } = useSearchGuide();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const { currentPhase, phases, nextItem, overallProgress } = useCurrentPhase(checked);

  const handleSearchResultSelect = (result: any) => {
    if (result.type === 'step' && result.phase) {
      setSelectedPhase(result.phase);
      setIsGuideOpen(true);
    } else if (result.type === 'guide') {
      // Navigate to guide page (would need to implement guide routes)
      console.log('Navigate to guide:', result.id);
    }
  };

  const handleSearchClick = () => {
    if (query.trim() && hasResults) {
      setIsSearchResultsOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d", fontFamily: "'Public Sans', sans-serif" }}>
      <GlobalProgressBar progress={progress} />

      {/* Header - Figma Design */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border"
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
              <a href="/downloads" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Downloads</a>
              <a href="/suporte" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Suporte</a>
              <a href="/noticias" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Noticias</a>
              <SpecialAdvisoryNavCta />
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim() && hasResults) {
                    setIsSearchResultsOpen(true);
                  }
                }}
                placeholder="Buscar no guia..."
                className="bg-transparent border-none outline-none py-2.5 px-3 text-sm w-full"
                style={{ color: "#f1f5f9" }}
              />
            </div>
            <button
              onClick={handleSearchClick}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <SearchIcon size="small" label="" />
            </button>
            <div className="md:hidden">
              <SpecialAdvisoryNavCta shortLabel />
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

      {/* Search Results */}
      <SearchResults
        results={results}
        isOpen={isSearchResultsOpen}
        onClose={() => setIsSearchResultsOpen(false)}
        onSelect={handleSearchResultSelect}
      />

      {/* Welcome Section - Compact */}
      <section className="relative">
        <Container as="div" maxWidth="xl" className="py-6 md:py-8">
          <div
            className="rounded-2xl border p-6 backdrop-blur-[4px]"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.6)",
              borderColor: "rgba(211, 158, 23, 0.2)"
            }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
                Bem-vindo ao <span style={{ color: "#d39e17" }}>Limpa Nome Expresso</span>
              </h1>
              <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
                Siga a trilha abaixo para concluir seu processo de limpeza de nome
              </p>
            </div>

            {/* Phase Trail Timeline */}
            <PhaseTrail currentPhase={currentPhase} />
          </div>
        </Container>
      </section>

      {/* Progress summary */}
      <Container as="div" maxWidth="xl" className="sticky top-[73px] z-40 -mt-4">
        <div
          className="backdrop-blur-sm border rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)"
          }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold" style={{ color: "#e8e4d8" }}>Seu Progresso</span>
              <span className="text-sm font-bold" style={{ color: "#d39e17" }}>{totalChecked}/{totalItems} itens - {progress}%</span>
            </div>
            <StickyProgressBar progress={progress} />
            {syncError && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{syncError}</p>
            )}
          </div>
          <button
            onClick={resetAll}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Reiniciar
          </button>
        </div>
      </Container>

      {/* Process Map - Central Element */}
      <Container as="div" maxWidth="xl" className="mt-6">
        <ProcessMap
          phases={phases}
          currentPhaseIndex={currentPhase - 1}
          overallProgress={overallProgress}
          checkedItems={checked}
          onToggleItem={toggle}
        />
      </Container>

      {/* Footer - Figma Design */}
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

      {/* Floating Guide Button */}
      <GuideButton
        onClick={() => setIsGuideOpen(!isGuideOpen)}
        isOpen={isGuideOpen}
        currentPhase={currentPhase}
      />

      {/* Guide Panel */}
      <GuidePanel
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentPhase={selectedPhase || currentPhase}
        phases={phases}
        nextItem={nextItem}
        checked={checked}
        onToggleItem={toggle}
        onPhaseSelect={(phase) => {
          setSelectedPhase(phase);
        }}
      />
    </div>
  );
}