import { useAuth } from "@/contexts/AuthContext";
import { useChecklistSync } from "@/hooks/useChecklistSync";
import { useCurrentPhase } from "@/hooks/useCurrentPhase";
import { Container } from "@/components/ui/container";
import { Progress } from "@/components/ui/progress";
import { SpecialAdvisoryNavCta } from "@/components/SpecialAdvisoryNavCta";
import { CheckCircle2, Circle, Clock, ArrowRight, ExternalLink, FileText, Scale, Video, Search } from "lucide-react";
import { TOTAL_ITEMS } from "@/data/steps";

const PHASE_ICONS = {
  1: FileText,
  2: FileText,
  3: Scale,
  4: Video,
  5: Search,
};

const QUICK_LINKS = [
  {
    href: "https://www.tjsp.jus.br/peticionamentojec",
    title: "Peticionamento JEC",
    description: "Protocolar ação no e-SAJ",
    icon: Scale,
    color: "#22c55e",
  },
  {
    href: "https://www.tjsp.jus.br/balcaovirtual",
    title: "Balcão Virtual",
    description: "Atendimento por videoconferência",
    icon: Video,
    color: "#60a5fa",
  },
  {
    href: "https://esaj.tjsp.jus.br/cpopg/open.do",
    title: "Consulta Processual",
    description: "Acompanhe seu processo",
    icon: Search,
    color: "#d39e17",
  },
];

export default function Process() {
  const { user, loading: authLoading } = useAuth();
  const { checked, progress, totalChecked } = useChecklistSync(TOTAL_ITEMS);
  const { currentPhase, phases, overallProgress, nextItem } = useCurrentPhase(checked);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#d39e17", borderTopColor: "transparent" }} />
          <p style={{ color: "#94a3b8" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";

  // Calculate completion status
  const completedPhases = phases.filter(p => p.isComplete).length;
  const totalPhases = phases.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.9)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          <a href="/guia" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17" />
                <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d" />
              </svg>
            </div>
            <h2 className="text-xl font-bold hidden sm:block" style={{ color: "#f1f5f9" }}>
              Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
            </h2>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/guia" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Guia</a>
            <a href="/processo" className="text-sm font-medium transition-colors" style={{ color: "#d39e17" }}>Meu Processo</a>
            <a href="/documentos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Documentos</a>
            <a href="/modelos" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Modelos</a>
            <a href="/downloads" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Downloads</a>
            <a href="/suporte" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Suporte</a>
            <a href="/noticias" className="text-sm font-medium hover:text-[#d39e17] transition-colors" style={{ color: "#cbd5e1" }}>Noticias</a>
            <SpecialAdvisoryNavCta />
          </nav>
          <div className="md:hidden">
            <SpecialAdvisoryNavCta shortLabel />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container as="main" maxWidth="lg" className="py-8 flex-1 space-y-6">
        {/* Welcome Section */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.3)",
          }}
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
            Olá, {displayName}!
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Acompanhe o progresso do seu processo de limpeza de nome.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Overall Progress Card */}
          <div
            className="md:col-span-2 rounded-2xl border p-6"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
                Progresso Geral
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold" style={{ color: "#d39e17" }}>
                  {overallProgress}%
                </span>
              </div>
            </div>
            <Progress value={overallProgress} className="h-4 mb-4" />
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "#94a3b8" }}>
                {totalChecked} de {TOTAL_ITEMS} itens completos
              </span>
              <span style={{ color: "#22c55e" }}>
                {completedPhases}/{totalPhases} fases completas
              </span>
            </div>
          </div>

          {/* Current Phase Card */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "rgba(211, 158, 23, 0.1)",
              borderColor: "rgba(211, 158, 23, 0.5)",
              boxShadow: "0 0 30px rgba(211, 158, 23, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ backgroundColor: "#d39e17", color: "#12110d" }}
              >
                Fase Atual
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#d39e17" }}>
              Fase {currentPhase}
            </h3>
            <p className="text-sm mb-4" style={{ color: "#e8e4d8" }}>
              {phases[currentPhase - 1]?.phaseName}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "#94a3b8" }}>Progresso</span>
              <span className="font-bold" style={{ color: "#d39e17" }}>
                {phases[currentPhase - 1]?.progress}%
              </span>
            </div>
            <Progress value={phases[currentPhase - 1]?.progress || 0} className="h-2 mt-2" />
          </div>
        </div>

        {/* Phase Progress Grid */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
            Todas as Fases
          </h3>
          <div className="space-y-3">
            {phases.map((phase, index) => {
              const Icon = PHASE_ICONS[phase.phaseNumber as keyof typeof PHASE_ICONS] || FileText;
              const isCurrent = index + 1 === currentPhase;

              return (
                <a
                  key={phase.phaseNumber}
                  href="/guia"
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01]"
                  style={{
                    backgroundColor: phase.isComplete
                      ? "rgba(34, 197, 94, 0.1)"
                      : isCurrent
                        ? "rgba(211, 158, 23, 0.1)"
                        : "rgba(255, 255, 255, 0.03)",
                    borderColor: phase.isComplete
                      ? "rgba(34, 197, 94, 0.3)"
                      : isCurrent
                        ? "rgba(211, 158, 23, 0.5)"
                        : "rgba(100, 116, 139, 0.2)",
                  }}
                >
                  {/* Status Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: phase.isComplete
                        ? "rgba(34, 197, 94, 0.2)"
                        : isCurrent
                          ? "rgba(211, 158, 23, 0.2)"
                          : "rgba(100, 116, 139, 0.1)",
                    }}
                  >
                    {phase.isComplete ? (
                      <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                    ) : isCurrent ? (
                      <Clock size={20} style={{ color: "#d39e17" }} />
                    ) : (
                      <Circle size={20} style={{ color: "#64748b" }} />
                    )}
                  </div>

                  {/* Phase Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className="font-semibold"
                        style={{
                          color: phase.isComplete
                            ? "#22c55e"
                            : isCurrent
                              ? "#d39e17"
                              : "#f1f5f9",
                        }}
                      >
                        Fase {phase.phaseNumber}: {phase.phaseName}
                      </h4>
                      {isCurrent && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#d39e17", color: "#12110d" }}
                        >
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      {phase.completedItems}/{phase.totalItems} itens completos
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24">
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: phase.isComplete
                          ? "rgba(34, 197, 94, 0.2)"
                          : isCurrent
                            ? "rgba(211, 158, 23, 0.2)"
                            : "rgba(100, 116, 139, 0.2)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${phase.progress}%`,
                          backgroundColor: phase.isComplete
                            ? "#22c55e"
                            : isCurrent
                              ? "#d39e17"
                              : "#64748b",
                        }}
                      />
                    </div>
                    <p
                      className="text-xs text-center mt-1 font-medium"
                      style={{
                        color: phase.isComplete
                          ? "#22c55e"
                          : isCurrent
                            ? "#d39e17"
                            : "#64748b",
                      }}
                    >
                      {phase.progress}%
                    </p>
                  </div>

                  <ArrowRight size={20} style={{ color: "#64748b" }} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Next Step & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Next Step */}
          {nextItem && (
            <div
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.05)",
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#22c55e" }}>
                Próximo Passo
              </h3>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                >
                  <ArrowRight size={16} style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#f1f5f9" }}>
                    {nextItem.label}
                  </p>
                  {nextItem.detail && (
                    <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                      {nextItem.detail}
                    </p>
                  )}
                  <a
                    href="/guia"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-medium transition-colors"
                    style={{ color: "#22c55e" }}
                  >
                    Ir para o guia <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
              Links Rápidos
            </h3>
            <div className="space-y-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderColor: `${link.color}30`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${link.color}20` }}
                    >
                      <Icon size={16} style={{ color: link.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm" style={{ color: link.color }}>
                        {link.title}
                      </h4>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {link.description}
                      </p>
                    </div>
                    <ExternalLink size={16} style={{ color: link.color }} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Progress Chart */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
            Visualização do Progresso
          </h3>
          <div className="flex items-end justify-between gap-4 h-40">
            {phases.map((phase, index) => {
              const isCurrent = index + 1 === currentPhase;
              const height = Math.max(10, phase.progress);

              return (
                <div key={phase.phaseNumber} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-32">
                    <span
                      className="text-xs font-bold mb-1"
                      style={{
                        color: phase.isComplete
                          ? "#22c55e"
                          : isCurrent
                            ? "#d39e17"
                            : "#64748b",
                      }}
                    >
                      {phase.progress}%
                    </span>
                    <div
                      className="w-full max-w-[60px] rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        backgroundColor: phase.isComplete
                          ? "#22c55e"
                          : isCurrent
                            ? "#d39e17"
                            : "#64748b",
                        boxShadow: isCurrent
                          ? "0 0 20px rgba(211, 158, 23, 0.5)"
                          : phase.isComplete
                            ? "0 0 20px rgba(34, 197, 94, 0.3)"
                            : "none",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium mt-2 text-center"
                    style={{ color: "#94a3b8" }}
                  >
                    Fase {phase.phaseNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
