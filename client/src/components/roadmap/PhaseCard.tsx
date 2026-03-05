import { useState } from "react";
import { CheckCircleIcon, ChevronRightIcon, FileIcon } from "@/utils/icons";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";
import { useChecklistDocuments } from "@/hooks/useChecklistDocuments";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentListModal } from "./DocumentListModal";

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
  const [selectedDocPhase, setSelectedDocPhase] = useState<number | null>(null);
  const checklistDocs = useChecklistDocuments();
  const { documents: allUserDocuments, downloadDocument } = useDocuments();

  const phaseInfo = PHASE_DESCRIPTIONS[phase.phaseNumber] || { description: "", tasks: "" };

  // Get documents for this phase
  const documentsByStep = checklistDocs.documentsByStep[phase.phaseNumber] || [];
  const docCount = documentsByStep.length;

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

          {/* Document Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDocPhase(phase.phaseNumber);
              }}
              aria-label={docCount > 0 ? `${docCount} documentos vinculados. Clique para gerenciar.` : 'Adicionar documentos a esta fase'}
              aria-haspopup="dialog"
              aria-expanded={selectedDocPhase === phase.phaseNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                border: docCount > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(211, 158, 23, 0.3)',
                backgroundColor: docCount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(211, 158, 23, 0.08)',
                color: docCount > 0 ? '#22c55e' : '#d39e17',
              }}
              title={docCount > 0 ? `${docCount} documento(s)` : 'Adicionar documentos'}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = docCount > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(211, 158, 23, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = docCount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(211, 158, 23, 0.08)';
              }}
            >
              <FileIcon size="small" label="" />
              {docCount > 0 && <span>{docCount}</span>}
            </button>
          </div>
        </div>
      </button>

      {/* Document List Modal */}
      {selectedDocPhase === phase.phaseNumber && (
        <DocumentListModal
          isOpen={true}
          onClose={() => setSelectedDocPhase(null)}
          itemId={`phase-${phase.phaseNumber}`}
          itemLabel={phase.phaseName}
          stepNumber={phase.phaseNumber}
          documents={documentsByStep.map((doc) => ({
            id: doc.id,
            document: doc.document,
            checklistDocId: doc.id,
          }))}
          allUserDocuments={allUserDocuments}
          onAttachDocument={async (documentId) => {
            return await checklistDocs.attachDocument(`phase-${phase.phaseNumber}`, phase.phaseNumber, documentId);
          }}
          onDetachDocument={async (checklistDocId) => {
            return await checklistDocs.detachDocument(checklistDocId);
          }}
          onDownload={(doc) => downloadDocument(doc.file_url, doc.name)}
          onRefresh={checklistDocs.refresh}
        />
      )}

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
