import { useMemo } from "react";
import { STEPS } from "@/data/steps";

export interface PhaseStatus {
  phaseNumber: number;
  phaseName: string;
  totalItems: number;
  completedItems: number;
  progress: number;
  isComplete: boolean;
  isCurrent: boolean;
  isPending: boolean;
}

interface UseCurrentPhaseReturn {
  currentPhase: number;
  phases: PhaseStatus[];
  nextItem: { stepId: number; itemId: string; label: string; detail?: string } | null;
  overallProgress: number;
}

export function useCurrentPhase(checked: Record<string, boolean>): UseCurrentPhaseReturn {
  const phases = useMemo(() => {
    return STEPS.map((step, index) => {
      const completedItems = step.items.filter((item) => checked[item.id]).length;
      const totalItems = step.items.length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      const isComplete = completedItems === totalItems;

      return {
        phaseNumber: step.number,
        phaseName: step.title,
        totalItems,
        completedItems,
        progress,
        isComplete,
        isCurrent: false,
        isPending: false,
      };
    });
  }, [checked]);

  const currentPhase = useMemo(() => {
    const firstIncompleteIndex = phases.findIndex((p) => !p.isComplete);
    return firstIncompleteIndex === -1 ? phases.length : firstIncompleteIndex + 1;
  }, [phases]);

  const phasesWithStatus = useMemo(() => {
    return phases.map((phase, index) => ({
      ...phase,
      isCurrent: index + 1 === currentPhase,
      isPending: index + 1 > currentPhase,
    }));
  }, [phases, currentPhase]);

  const nextItem = useMemo(() => {
    const currentStepIndex = currentPhase - 1;
    if (currentStepIndex < 0 || currentStepIndex >= STEPS.length) return null;

    const currentStep = STEPS[currentStepIndex];
    const incompleteItem = currentStep.items.find((item) => !checked[item.id]);

    if (!incompleteItem) return null;

    return {
      stepId: currentStep.number,
      itemId: incompleteItem.id,
      label: incompleteItem.label,
      detail: incompleteItem.detail,
    };
  }, [checked, currentPhase]);

  const overallProgress = useMemo(() => {
    const totalItems = phases.reduce((acc, p) => acc + p.totalItems, 0);
    const completedItems = phases.reduce((acc, p) => acc + p.completedItems, 0);
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [phases]);

  return {
    currentPhase,
    phases: phasesWithStatus,
    nextItem,
    overallProgress,
  };
}
