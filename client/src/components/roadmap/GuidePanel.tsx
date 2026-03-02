import { useEffect, useRef } from "react";
import { CheckCircleIcon, ChevronRightIcon, DownloadIcon, LinkExternalIcon } from "@/utils/icons";
import { STEPS } from "@/data/steps";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";

interface GuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: number;
  phases: PhaseStatus[];
  nextItem: { stepId: number; itemId: string; label: string; detail?: string } | null;
  checked: Record<string, boolean>;
  onToggleItem: (id: string, stepNumber: number) => void;
  onPhaseSelect: (phaseNumber: number) => void;
}

export function GuidePanel({
  isOpen,
  onClose,
  currentPhase,
  phases,
  nextItem,
  checked,
  onToggleItem,
  onPhaseSelect,
}: GuidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const currentStep = STEPS[currentPhase - 1];

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`
        fixed bottom-20 right-6 z-40
        w-[360px] max-h-[70vh]
        rounded-2xl border
        backdrop-blur-xl
        overflow-hidden
        transition-all duration-300
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.98)",
        borderColor: "rgba(211, 158, 23, 0.3)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>
              Guia Passo a Passo
            </h3>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Fase {currentPhase}: {currentStep?.title}
            </p>
          </div>
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: "rgba(211, 158, 23, 0.2)" }}
          >
            <span className="font-bold text-[#d39e17]">{currentPhase}</span>
          </div>
        </div>
      </div>

      {/* Phase Selector */}
      <div
        className="px-5 py-3 border-b flex gap-2 overflow-x-auto"
        style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}
      >
        {phases.map((phase) => (
          <button
            key={phase.phaseNumber}
            onClick={() => onPhaseSelect(phase.phaseNumber)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all
              ${phase.phaseNumber === currentPhase
                ? "bg-[#d39e17] text-[#12110d]"
                : phase.isComplete
                  ? "bg-[#22c55e]/20 text-[#22c55e]"
                  : "bg-[#64748b]/20 text-[#64748b]"
              }
            `}
          >
            {phase.phaseNumber}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(70vh-180px)]">
        {/* Tip */}
        {currentStep?.tip && (
          <div
            className="mx-5 mt-4 p-3 rounded-xl"
            style={{ backgroundColor: "rgba(211, 158, 23, 0.1)" }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "#d39e17" }}>
              💡 {currentStep.tip}
            </p>
          </div>
        )}

        {/* Downloads */}
        {currentStep?.downloads && currentStep.downloads.length > 0 && (
          <div className="px-5 mt-4 space-y-2">
            {currentStep.downloads.map((d) => (
              <a
                key={d.file}
                href={d.file}
                download
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ backgroundColor: "rgba(96, 165, 250, 0.1)" }}
              >
                <DownloadIcon size="small" label="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#60a5fa" }}>
                    {d.label}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#64748b" }}>
                    {d.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        {currentStep?.links && currentStep.links.length > 0 && (
          <div className="px-5 mt-4 space-y-2">
            {currentStep.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
              >
                <LinkExternalIcon size="small" label="" />
                <p className="text-sm font-medium flex-1" style={{ color: "#22c55e" }}>
                  {l.label}
                </p>
                <ChevronRightIcon size="small" label="" />
              </a>
            ))}
          </div>
        )}

        {/* Next Item Highlight */}
        {nextItem && (
          <div className="px-5 mt-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#d39e17" }}>
              Proximo Passo
            </p>
            <button
              onClick={() => onToggleItem(nextItem.itemId, nextItem.stepId)}
              className="w-full p-4 rounded-xl border-2 border-dashed transition-all hover:border-solid"
              style={{
                backgroundColor: "rgba(211, 158, 23, 0.1)",
                borderColor: "rgba(211, 158, 23, 0.5)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: "#d39e17" }}
                >
                  <ChevronRightIcon size="small" label="" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm" style={{ color: "#f1f5f9" }}>
                    {nextItem.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {nextItem.detail}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Checklist Items */}
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>
            Checklist da Fase
          </p>
          {currentStep?.items.map((item) => {
            const isChecked = checked[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onToggleItem(item.id, currentStep.number)}
                className="w-full flex items-start gap-3 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isChecked ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.03)",
                }}
              >
                <div
                  className={`
                    flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all mt-0.5
                    ${isChecked
                      ? "border-[#22c55e] bg-[#22c55e]"
                      : "border-[#64748b]"
                    }
                  `}
                >
                  {isChecked && <CheckCircleIcon size="small" label="" />}
                </div>
                <div className="text-left flex-1">
                  <p
                    className={`text-sm ${isChecked ? "line-through opacity-60" : ""}`}
                    style={{ color: "#e8e4d8" }}
                  >
                    {item.label}
                  </p>
                  {!isChecked && (
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                      {item.detail}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 border-t"
        style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#64748b" }}>
            {phases[currentPhase - 1]?.completedItems}/{phases[currentPhase - 1]?.totalItems} itens
          </span>
          <span className="text-xs font-medium" style={{ color: "#d39e17" }}>
            {phases[currentPhase - 1]?.progress}% completo
          </span>
        </div>
        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(211, 158, 23, 0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${phases[currentPhase - 1]?.progress || 0}%`,
              backgroundColor: "#d39e17",
            }}
          />
        </div>
      </div>
    </div>
  );
}
