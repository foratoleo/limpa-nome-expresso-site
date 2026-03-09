import {
  ScalesIcon,
  VideoIcon,
  TaskIcon,
  BookWithBookmarkIcon,
} from "@/utils/icons";
import { DownloadCard } from "@/components/ui/DownloadButton";

interface DownloadDoc {
  icon: React.ReactNode;
  title: string;
  description: string;
  file: string;
  badge: string;
  badgeColor: string;
}

const DEFAULT_DOCS: DownloadDoc[] = [
  {
    icon: <span style={{ color: "#d39e17" }}><TaskIcon size="medium" label="" /></span>,
    title: "Checklist Completo de Documentos",
    description: "Lista detalhada de todos os documentos necessários para o Passo 1",
    file: "/docs/checklist_documentos.md",
    badge: "Passo 1",
    badgeColor: "#d39e17",
  },
  {
    icon: <span style={{ color: "#60a5fa" }}><ScalesIcon size="medium" label="" /></span>,
    title: "Petição Inicial Pré-Preenchida",
    description: "Modelo completo para o JEC de São Paulo - sistema sistema judicial tribunal",
    file: "/docs/peticao_inicial_jec_sp.md",
    badge: "Passo 2",
    badgeColor: "#60a5fa",
  },
  {
    icon: <span style={{ color: "#d39e17" }}><VideoIcon size="medium" label="" /></span>,
    title: "Roteiro do Balcão Virtual",
    description: "Script de fala pré-preenchido para o atendimento por videoconferência",
    file: "/docs/roteiro_balcao_virtual.md",
    badge: "Passo 4",
    badgeColor: "#d39e17",
  },
];

interface DownloadsSectionProps {
  docs?: DownloadDoc[];
  className?: string;
}

export function DownloadsSection({ docs = DEFAULT_DOCS, className = "" }: DownloadsSectionProps) {
  return (
    <div
      className={`rounded-3xl border p-6 backdrop-blur-[4px] ${className}`}
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.2)",
        boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span style={{ color: "#d39e17" }}><BookWithBookmarkIcon size="medium" label="" /></span>
        <h4
          className="font-bold"
          style={{
            color: "#f1f5f9",
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 18,
          }}
        >
          Todos os Documentos para Download
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <DownloadCard
            key={doc.file}
            icon={doc.icon}
            title={doc.title}
            description={doc.description}
            file={doc.file}
            badge={doc.badge}
            badgeColor={doc.badgeColor}
          />
        ))}
      </div>
    </div>
  );
}

export default DownloadsSection;
