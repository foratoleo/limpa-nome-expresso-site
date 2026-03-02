import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import {
  FileIcon,
  ScalesIcon,
  VideoIcon,
  TaskIcon,
  BookWithBookmarkIcon,
  DownloadIcon,
} from "@/utils/icons";
import { DOCUMENT_TEMPLATES, generateAndDownloadDocx, DocumentTemplate } from "@/lib/docxGenerator";

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  TaskIcon: <TaskIcon size="medium" label="" />,
  ScalesIcon: <ScalesIcon size="medium" label="" />,
  VideoIcon: <VideoIcon size="medium" label="" />,
  BookIcon: <BookWithBookmarkIcon size="medium" label="" />,
};

// Step colors
const STEP_COLORS: Record<number, string> = {
  0: "#22c55e", // Guia completo
  1: "#d39e17", // Reunião de Documentos
  2: "#60a5fa", // Preparação da Petição
  3: "#22c55e", // Protocolo no e-SAJ
  4: "#d39e17", // Balcão Virtual
  5: "#22c55e", // Acompanhamento
};

// Step labels
const STEP_LABELS: Record<number, string> = {
  0: "Guia Completo",
  1: "Passo 1 - Documentos",
  2: "Passo 2 - Petição",
  3: "Passo 3 - Protocolo",
  4: "Passo 4 - Balcão Virtual",
  5: "Passo 5 - Acompanhamento",
};

interface TemplateCardProps {
  template: DocumentTemplate;
  onDownload: (id: string) => Promise<void>;
  downloading: boolean;
}

function TemplateCard({ template, onDownload, downloading }: TemplateCardProps) {
  const color = STEP_COLORS[template.step] || "#d39e17";
  const icon = ICON_MAP[template.icon] || <FileIcon size="medium" label="" />;

  return (
    <div
      className="rounded-2xl border p-5 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: `${color}40`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}80`;
        e.currentTarget.style.boxShadow = `0 10px 30px -10px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header with step badge */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}40`,
          }}
        >
          {STEP_LABELS[template.step]}
        </div>
        <span style={{ color }}>{icon}</span>
      </div>

      {/* Title */}
      <h4 className="font-bold text-lg mb-2" style={{ color: "#f1f5f9" }}>
        {template.title}
      </h4>

      {/* Description */}
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>
        {template.description}
      </p>

      {/* Download button */}
      <button
        onClick={() => onDownload(template.id)}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
        style={{
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
        onMouseEnter={(e) => {
          if (!downloading) {
            e.currentTarget.style.backgroundColor = color;
            e.currentTarget.style.color = "#12110d";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${color}20`;
          e.currentTarget.style.color = color;
        }}
      >
        {downloading ? (
          <>
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: color, borderTopColor: "transparent" }}
            />
            Gerando...
          </>
        ) : (
          <>
            <DownloadIcon size="small" label="" />
            Baixar Word (.docx)
          </>
        )}
      </button>
    </div>
  );
}

export function TemplatesSection() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (templateId: string) => {
    setDownloadingId(templateId);
    try {
      await generateAndDownloadDocx(templateId);
      toast.success("Documento baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar o documento. Tente novamente.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Group templates by step
  const templatesByStep = DOCUMENT_TEMPLATES.reduce((acc, template) => {
    const step = template.step;
    if (!acc[step]) acc[step] = [];
    acc[step].push(template);
    return acc;
  }, {} as Record<number, DocumentTemplate[]>);

  // Sort steps (0 first, then 1-5)
  const sortedSteps = Object.keys(templatesByStep)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div
      id="modelos"
      className="scroll-mt-24"
    >
      <Container as="div" maxWidth="lg" className="py-12">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span style={{ color: "#d39e17" }}>
              <BookWithBookmarkIcon size="medium" label="" />
            </span>
            <h2
              className="text-3xl font-bold"
              style={{ color: "#f1f5f9" }}
            >
              Modelos de Documentos
            </h2>
          </div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#94a3b8" }}
          >
            Baixe todos os modelos em formato Word (.docx) para preencher e usar no seu processo.
            Organizados por etapa para facilitar o acompanhamento.
          </p>
        </div>

        {/* Templates by Step */}
        {sortedSteps.map((step) => (
          <div key={step} className="mb-10">
            {/* Step Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: `${STEP_COLORS[step]}20`,
                  color: STEP_COLORS[step],
                  border: `2px solid ${STEP_COLORS[step]}40`,
                }}
              >
                {step === 0 ? "★" : step}
              </div>
              <h3
                className="text-xl font-semibold"
                style={{ color: "#e8e4d8" }}
              >
                {STEP_LABELS[step]}
              </h3>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesByStep[step].map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDownload={handleDownload}
                  downloading={downloadingId === template.id}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Help Section */}
        <div
          className="rounded-2xl border p-6 mt-8"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderColor: "rgba(34, 197, 94, 0.3)",
          }}
        >
          <h4
            className="font-semibold mb-3 flex items-center gap-2"
            style={{ color: "#22c55e" }}
          >
            <span>💡</span> Como usar os modelos
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>1.</span>
              <span>Baixe o documento clicando no botão "Baixar Word (.docx)"</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>2.</span>
              <span>Abra o arquivo no Microsoft Word, Google Docs ou LibreOffice</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>3.</span>
              <span>Substitua todos os campos [PREENCHER: ...] com seus dados reais</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>4.</span>
              <span>Salve o documento preenchido em PDF para anexar ao processo</span>
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}

export default TemplatesSection;
