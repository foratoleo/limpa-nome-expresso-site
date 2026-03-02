// Video configuration and design system colors
export const COLORS = {
  gold: "#d39e17",
  navy: "#162847",
  green: "#22c55e",
  blue: "#60a5fa",
  dark: "#12110d",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
} as const;

// 5 Phases of the process
export const PHASES = [
  {
    id: 1,
    title: "Documentos",
    icon: "folder",
    color: COLORS.gold,
    description: "Reuna suas provas",
    explanation: "Simples e rápido. O sistema te guia passo a passo.",
  },
  {
    id: 2,
    title: "Petição",
    icon: "file",
    color: COLORS.blue,
    description: "Prepare o documento",
    explanation: "Modelo pronto pra você. Basta preencher e enviar.",
  },
  {
    id: 3,
    title: "Protocolo",
    icon: "send",
    color: COLORS.green,
    description: "Envie ao tribunal",
    explanation: "100% online. Você acompanha tudo em tempo real.",
  },
  {
    id: 4,
    title: "Balcão Virtual",
    icon: "video",
    color: COLORS.gold,
    description: "Acelere o processo",
    explanation: "Videoconferência rápida. Sem sair de casa.",
  },
  {
    id: 5,
    title: "Acompanhe",
    icon: "shield",
    color: COLORS.green,
    description: "Monitore o resultado",
    explanation: "Acompanhe de perto. Notificações a cada atualização.",
  },
] as const;

export const FPS = 30;
export const DURATION_SECONDS = 30;
export const DURATION_FRAMES = FPS * DURATION_SECONDS;
