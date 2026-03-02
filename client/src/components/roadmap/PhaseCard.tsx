import { CheckCircleIcon, ChevronRightIcon } from "@/utils/icons";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";

interface PhaseCardProps {
  phase: PhaseStatus;
  phaseIndex: number;
  isCurrent: boolean;
  isLast: boolean;
  onClick: () => void;
}

const PHASE_DESCRIPTIONS: Record<number, { description: string; tasks: string }> = {
  1: {
    description: "Reuna toda a documentacao necessaria para comprovar a ausencia de notificacao e o dano sofrido.",
    tasks: "RG, CPF, comprovantes, relatorios, prints"
  },
  2: {
    description: "Preencha a peticao inicial com seus dados pessoais e os dados da divida contestada.",
    tasks: "Baixar modelo, preencher campos, anexar docs"
  },
  3: {
    description: "Protocolar a acao no sistema e-SAJ do Tribunal de Justica de Sao Paulo.",
    tasks: "Cadastro, partes, anexos, liminar"
  },
  4: {
    description: "Use o Balcao Virtual para acelerar a analise do seu processo pelo juiz.",
    tasks: "Acessar balcao, roteiro, atendimento"
  },
  5: {
    description: "Monitore o processo e verifique a exclusao do nome nos orgaos de protecao ao credito.",
    tasks: "Consultar processo, verificar nome"
  }
};

export function PhaseCard({ phase, phaseIndex, isCurrent, isLast, onClick }: PhaseCardProps) {
  const phaseInfo = PHASE_DESCRIPTIONS[phase.phaseNumber] || { description: "", tasks: "" };

  return (
    <div className="flex items-stretch">
      {/* Card */}
      <button
        onClick={onClick}
        className={`
          flex-1 flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left
          ${phase.isComplete
            ? "border-[#22c55e]/40 bg-[#22c55e]/5 hover:bg-[#22c55e]/10"
            : isCurrent
              ? "border-[#d39e17] bg-[#d39e17]/10 hover:bg-[#d39e17]/15"
              : "border-[#64748b]/20 bg-[#64748b]/5 hover:bg-[#64748b]/10 opacity-60"
          }
        `}
        style={isCurrent && !phase.isComplete ? { boxShadow: "0 0 25px rgba(211, 158, 23, 0.4)" } : undefined}
      >
        {/* Number Circle */}
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
            border-2 transition-all
            ${phase.isComplete
              ? "border-[#22c55e] bg-[#22c55e]/20"
              : isCurrent
                ? "border-[#d39e17] bg-[#d39e17]/20 animate-pulse"
                : "border-[#64748b]/40 bg-transparent"
            }
          `}
        >
          {phase.isComplete ? (
            <CheckCircleIcon size="medium" label="" />
          ) : (
            <span
              className={`font-bold text-xl ${isCurrent ? "text-[#d39e17]" : "text-[#64748b]"}`}
            >
              {phase.phaseNumber}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-bold text-lg ${isCurrent ? "text-[#f1f5f9]" : phase.isComplete ? "text-[#22c55e]" : "text-[#94a3b8]"}`}
            >
              {phase.phaseName}
            </h3>
            {isCurrent && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#d39e17", color: "#12110d" }}
              >
                Atual
              </span>
            )}
            {/* Phase Progress Badge */}
            <span
              className={`ml-auto text-xs font-bold ${phase.isComplete ? "text-[#22c55e]" : isCurrent ? "text-[#d39e17]" : "text-[#64748b]"}`}
            >
              {Math.round(phase.progress)}%
            </span>
          </div>
          <p className="text-sm mb-2 line-clamp-2" style={{ color: "#94a3b8" }}>
            {phaseInfo.description}
          </p>
          {/* Progress Bar */}
          <div className="mb-2">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: phase.isComplete ? "rgba(34, 197, 94, 0.2)" : isCurrent ? "rgba(211, 158, 23, 0.2)" : "rgba(100, 116, 139, 0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${phase.progress}%`,
                  backgroundColor: phase.isComplete ? "#22c55e" : isCurrent ? "#d39e17" : "#64748b"
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "#64748b" }}>
              {phaseInfo.tasks}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${isCurrent ? "text-[#d39e17]" : "text-[#64748b]"}`}
              >
                {phase.completedItems}/{phase.totalItems}
              </span>
              <ChevronRightIcon size="small" label="" />
            </div>
          </div>
        </div>
      </button>

      {/* Connector */}
      {!isLast && (
        <div className="flex items-center px-2">
          <div
            className={`w-1 flex-1 rounded-full ${phase.isComplete ? "bg-[#22c55e]/50" : "bg-[#64748b]/20"}`}
            style={{ minHeight: "60px" }}
          />
        </div>
      )}
    </div>
  );
}
