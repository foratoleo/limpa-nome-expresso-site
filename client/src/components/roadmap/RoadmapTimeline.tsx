import { CheckCircleIcon } from "@/utils/icons";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";

interface RoadmapTimelineProps {
  phases: PhaseStatus[];
  currentPhase: number;
  onPhaseClick?: (phaseNumber: number) => void;
}

export function RoadmapTimeline({ phases, currentPhase, onPhaseClick }: RoadmapTimelineProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max px-4 py-2 gap-2">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;

          return (
            <div key={phase.phaseNumber} className="flex items-center">
              {/* Phase Circle */}
              <button
                onClick={() => onPhaseClick?.(phase.phaseNumber)}
                className="relative flex flex-col items-center group"
                disabled={phase.isPending}
              >
                {/* Circle */}
                <div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2
                    ${phase.isComplete
                      ? "border-[#22c55e] bg-[#22c55e]/20"
                      : phase.isCurrent
                        ? "border-[#d39e17] bg-[#d39e17]/20 animate-pulse"
                        : "border-[#64748b] bg-transparent opacity-50"
                    }
                  `}
                >
                  {phase.isComplete ? (
                    <CheckCircleIcon size="medium" label="" />
                  ) : (
                    <span
                      className={`
                        font-bold text-lg
                        ${phase.isCurrent ? "text-[#d39e17]" : "text-[#64748b]"}
                      `}
                    >
                      {phase.phaseNumber}
                    </span>
                  )}

                  {/* Current indicator */}
                  {phase.isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#d39e17]" />
                  )}
                </div>

                {/* Phase Name */}
                <div className="mt-2 text-center max-w-[80px]">
                  <p
                    className={`
                      text-xs font-medium truncate
                      ${phase.isCurrent ? "text-[#d39e17]" : phase.isComplete ? "text-[#22c55e]" : "text-[#64748b]"}
                    `}
                  >
                    Fase {phase.phaseNumber}
                  </p>
                  <p
                    className={`
                      text-[10px] truncate
                      ${phase.isCurrent ? "text-[#94a3b8]" : "text-[#64748b]"}
                    `}
                  >
                    {phase.completedItems}/{phase.totalItems}
                  </p>
                </div>

                {/* Progress Ring for current */}
                {phase.isCurrent && (
                  <svg
                    className="absolute inset-0 w-12 h-12 -rotate-90"
                    viewBox="0 0 48 48"
                  >
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="rgba(211, 158, 23, 0.2)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      fill="none"
                      stroke="#d39e17"
                      strokeWidth="2"
                      strokeDasharray={`${(phase.progress / 100) * 138.23} 138.23`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    w-8 h-0.5 mx-1
                    ${phases[index + 1]?.isComplete || phases[index + 1]?.isCurrent
                      ? "bg-[#22c55e]"
                      : "bg-[#64748b]/30"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
