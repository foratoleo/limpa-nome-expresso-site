import * as React from "react";
import {
  FileIcon,
  ScalesIcon,
  ArrowRightIcon,
  VideoIcon,
  ShieldIcon,
  AtlaskitIconProps,
} from "@/utils/icons";
import { Container } from "@/components/ui/container";

// =============================================================================
// HOW IT WORKS SECTION - Process Timeline Component
// =============================================================================
// Displays a 5-step horizontal timeline (vertical on mobile) showing the
// legal process for cleaning up negative credit records.
// =============================================================================

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<AtlaskitIconProps>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: 1,
    title: "Reunião de Documentos",
    description: "Coletamos toda a documentação necessária para iniciar seu processo.",
    icon: FileIcon,
  },
  {
    id: 2,
    title: "Preparação da Petição",
    description: "Elaboramos a petição inicial com todos os fundamentos legais.",
    icon: ScalesIcon,
  },
  {
    id: 3,
    title: "Protocolo no sistema judicial",
    description: "Protocolamos seu processo eletronicamente no sistema do tribunal.",
    icon: ArrowRightIcon,
  },
  {
    id: 4,
    title: "Tática do Balcão Virtual",
    description: "Utilizamos estratégias específicas para acelerar o andamento.",
    icon: VideoIcon,
  },
  {
    id: 5,
    title: "Acompanhamento",
    description: "Monitoramos cada etapa e mantemos você informado.",
    icon: ShieldIcon,
  },
];

// Color tokens
const COLORS = {
  gold: "#d39e17",
  title: "#f1f5f9",
  stepText: "#94a3b8",
  background: "rgba(22, 40, 71, 0.95)",
};

// ─── Step Card Component ──────────────────────────────────────────────────────

interface StepCardProps {
  step: Step;
  isLast: boolean;
}

function StepCard({ step, isLast }: StepCardProps) {
  const IconComponent = step.icon;

  return (
    <div className="flex flex-col items-center relative">
      {/* Timeline connector line - horizontal on desktop */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5"
          style={{ backgroundColor: COLORS.gold }}
          aria-hidden="true"
        />
      )}

      {/* Timeline connector line - vertical on mobile/tablet */}
      {!isLast && (
        <div
          className="lg:hidden absolute top-20 left-1/2 -translate-x-1/2 w-0.5 h-8"
          style={{ backgroundColor: COLORS.gold }}
          aria-hidden="true"
        />
      )}

      {/* Step content */}
      <div className="flex flex-col items-center text-center px-4 relative z-10">
        {/* Number badge */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3"
          style={{
            backgroundColor: COLORS.gold,
            color: "#000",
          }}
        >
          {step.id}
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(211, 158, 23, 0.15)" }}
        >
          <span style={{ color: COLORS.gold }}>
            <IconComponent
              label={step.title}
              size="medium"
            />
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: COLORS.title }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed max-w-[200px]"
          style={{ color: COLORS.stepText }}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="py-16 md:py-20 lg:py-24"
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      <Container maxWidth="2xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: COLORS.title }}
          >
            Como funciona o processo
          </h2>
          <p
            className="text-lg md:text-xl"
            style={{ color: COLORS.gold }}
          >
            5 passos simples para limpar seu nome
          </p>
        </div>

        {/* Timeline */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-0">
          {STEPS.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              isLast={index === STEPS.length - 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
