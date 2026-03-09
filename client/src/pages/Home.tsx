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
import { SiteHeader } from "@/components/SiteHeader";
import { APP_NAV_LINKS } from "@/components/layout/site-nav";
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

      <SiteHeader
        logoHref="/guia"
        navItems={APP_NAV_LINKS.map((item) => ({
          ...item,
          active: item.href === "/guia",
        }))}
        desktopNavExtra={<SpecialAdvisoryNavCta />}
        desktopRightContent={
          <>
            <div className="hidden items-center gap-3 lg:flex">
              <div
                className="flex items-center overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", maxWidth: 256 }}
              >
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
                  className="w-full border-none bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: "#f1f5f9" }}
                />
              </div>
              <button
                onClick={handleSearchClick}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                aria-label="Abrir resultados da busca"
              >
                <SearchIcon size="small" label="" />
              </button>
            </div>
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
          <div
            className="rounded-2xl border p-3"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.78)",
              borderColor: "rgba(211, 158, 23, 0.15)",
            }}
          >
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#64748b" }}>
              Buscar no guia
            </label>
            <div className="flex items-center overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}>
              <div className="pl-3 flex items-center justify-center">
                <SearchIcon size="small" label="" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite um termo"
                className="w-full border-none bg-transparent px-3 py-2.5 text-sm outline-none"
                style={{ color: "#f1f5f9" }}
              />
            </div>
            {query.trim() && hasResults && (
              <button
                onClick={handleSearchClick}
                className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ backgroundColor: "#d39e17", color: "#12110d" }}
              >
                Ver resultados
              </button>
            )}
          </div>
        }
      />

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
                Bem-vindo ao <span style={{ color: "#d39e17" }}>CPF Blindado</span>
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

      {/* Legal - Termos de Uso */}
      <section id="termos" style={{ scrollMarginTop: "130px" }}>
        <Container as="div" maxWidth="xl" className="mt-8">
          <div
            className="rounded-2xl border p-6 md:p-8"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.25)",
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
              Termos de Uso
            </h2>
            <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
              Última atualização: 09 de março de 2026.
            </p>

            <div className="space-y-5 text-sm md:text-base" style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>1. Aceite dos Termos</h3>
                <p>
                  Ao acessar e utilizar a plataforma CPF Blindado, você declara que leu, compreendeu e concorda com estes Termos de Uso.
                  Quando houver fluxo de cadastro, contratação ou confirmação eletrônica, essa ação também será considerada aceite formal destes Termos.
                  Caso não concorde, interrompa a utilização do serviço.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>2. Finalidade da Plataforma</h3>
                <p>
                  A plataforma oferece conteúdo educacional, organização de etapas, modelos e materiais de apoio para demandas de defesa do consumidor.
                  O serviço não constitui consultoria jurídica individualizada, nem substitui a atuação de advogado quando necessária.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>3. Responsabilidades do Usuário</h3>
                <p>
                  Você é responsável pela veracidade das informações inseridas, pelo uso adequado dos documentos gerados e pelo cumprimento dos prazos e requisitos legais aplicáveis ao seu caso.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>4. Limitação de Responsabilidade</h3>
                <p>
                  O CPF Blindado não garante resultado específico em processos administrativos ou judiciais.
                  O conteúdo é fornecido como apoio técnico e informativo, podendo variar conforme entendimento de órgãos, tribunais e circunstâncias do caso concreto.
                  Esta limitação não exclui responsabilidades legais que não possam ser afastadas por lei, incluindo hipóteses de dolo ou culpa grave.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>5. Propriedade Intelectual</h3>
                <p>
                  Os materiais, textos, fluxos e modelos disponibilizados na plataforma são protegidos por direitos autorais.
                  É vedada a reprodução, redistribuição ou exploração comercial sem autorização prévia e expressa.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>6. Privacidade e Proteção de Dados</h3>
                <p>
                  O tratamento de dados pessoais segue a legislação aplicável e as diretrizes de privacidade da plataforma.
                  Tratamos dados de cadastro, autenticação, uso da plataforma e informações fornecidas por você para viabilizar acesso, suporte e funcionalidades contratadas, pelo período necessário às finalidades informadas e ao cumprimento de obrigações legais.
                  Solicitações sobre seus dados pessoais podem ser encaminhadas para suporte@cpfblindado.com.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>7. Alterações destes Termos</h3>
                <p>
                  Estes Termos podem ser atualizados periodicamente para adequação legal, técnica e operacional.
                  Em alterações materiais, buscaremos comunicar com antecedência mínima de 15 (quinze) dias pelos canais oficiais da plataforma.
                  A versão vigente será sempre a publicada nesta seção.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1" style={{ color: "#e8e4d8" }}>8. Contato</h3>
                <p>
                  Para dúvidas sobre estes Termos de Uso, utilize os canais oficiais da seção de suporte ou escreva para suporte@cpfblindado.com.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: "rgba(211, 158, 23, 0.15)" }}>
              <h3 id="privacidade" tabIndex={-1} className="text-lg font-semibold mb-2" style={{ color: "#f1f5f9", scrollMarginTop: "130px" }}>
                Privacidade
              </h3>
              <p className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
                Coletamos dados necessários para autenticação, operação da conta, suporte e execução das funcionalidades contratadas.
                Você pode solicitar informações, atualização ou exclusão de dados, quando aplicável, pelo canal suporte@cpfblindado.com.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(211, 158, 23, 0.15)" }}>
              <h3 id="oab" tabIndex={-1} className="text-lg font-semibold mb-2" style={{ color: "#f1f5f9", scrollMarginTop: "130px" }}>
                Conformidade OAB
              </h3>
              <p className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
                A plataforma atua como suporte informacional e organizacional, sem captação indevida de clientela ou promessa de resultado jurídico.
                Quando houver necessidade de representação técnica, recomenda-se a contratação de advogado regularmente inscrito na OAB.
              </p>
            </div>
          </div>
        </Container>
      </section>

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
                2026 CPF Blindado. Sistema de Suporte Informacional e Organizacional.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#termos" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Termos de Uso</a>
              <a href="#privacidade" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Privacidade</a>
              <a href="#oab" className="text-sm hover:text-[#d39e17] transition-colors" style={{ color: "#64748b" }}>Conformidade OAB</a>
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
