import { useState } from "react";
import { PhaseCard } from "./PhaseCard";
import { PhaseModal } from "./PhaseModal";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";

interface ProcessMapProps {
  phases: PhaseStatus[];
  currentPhaseIndex: number;
  overallProgress: number;
  checkedItems: Record<string, boolean>;
  onToggleItem: (itemId: string, stepNumber: number) => void;
}

export function ProcessMap({
  phases,
  currentPhaseIndex,
  overallProgress,
  checkedItems,
  onToggleItem
}: ProcessMapProps) {
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState<number | null>(null);

  // Get the selected phase with current data (updates in real-time)
  const selectedPhase = selectedPhaseNumber !== null
    ? phases.find(p => p.phaseNumber === selectedPhaseNumber) || null
    : null;

  const handlePhaseClick = (phase: PhaseStatus) => {
    setSelectedPhaseNumber(phase.phaseNumber);
  };

  const handleCloseModal = () => {
    setSelectedPhaseNumber(null);
  };

  return (
    <div
      className="backdrop-blur-sm border rounded-2xl px-4 py-5 shadow-xl"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.2)"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-2">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "#e8e4d8" }}>
            Mapa do Processo
          </h3>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Voce esta na{" "}
            <span style={{ color: "#d39e17", fontWeight: 600 }}>
              Fase {currentPhaseIndex + 1}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}>
          <span className="text-xs" style={{ color: "#64748b" }}>
            Total:
          </span>
          <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
            {Math.round(overallProgress)}%
          </span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="px-2 mb-5">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              background: overallProgress >= 100
                ? "#22c55e"
                : "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)"
            }}
          />
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <PhaseCard
            key={phase.phaseNumber}
            phase={phase}
            phaseIndex={index}
            isCurrent={index === currentPhaseIndex}
            isLast={index === phases.length - 1}
            onClick={() => handlePhaseClick(phase)}
          />
        ))}
      </div>

      {/* Phase Modal */}
      {selectedPhase && (
        <PhaseModal
          phase={selectedPhase}
          isOpen={true}
          onClose={handleCloseModal}
          checkedItems={checkedItems}
          onToggleItem={onToggleItem}
        />
      )}
    </div>
  );
}
