import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileIcon,
  ScalesIcon,
  VideoIcon,
  TaskIcon,
  BookWithBookmarkIcon,
  DownloadIcon,
  SearchIcon,
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
  3: "#22c55e", // Protocolo no sistema judicial
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

// Quick download links data
const QUICK_DOWNLOADS = [
  {
    href: "/docs/checklist_documentos.md",
    label: "Checklist de Documentos",
    color: "#d39e17",
  },
  {
    href: "/docs/peticao_inicial_jec_sp.md",
    label: "Petição Inicial JEC SP",
    color: "#60a5fa",
  },
  {
    href: "/docs/roteiro_balcao_virtual.md",
    label: "Roteiro Balcão Virtual",
    color: "#22c55e",
  },
];

interface TemplateCardProps {
  template: DocumentTemplate;
  onDownload: (id: string) => Promise<void>;
  downloading: boolean;
  compact?: boolean;
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

// ─── TemplatesSidebar ────────────────────────────────────────────────────────

interface TemplatesSidebarProps {
  activeStep: number | null;
  onStepChange: (step: number | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function TemplatesSidebar({
  activeStep,
  onStepChange,
  searchQuery,
  onSearchChange,
}: TemplatesSidebarProps) {
  // Derive unique steps from data
  const steps = Array.from(new Set(DOCUMENT_TEMPLATES.map((t) => t.step))).sort(
    (a, b) => a - b
  );

  const countByStep = steps.reduce((acc, step) => {
    acc[step] = DOCUMENT_TEMPLATES.filter((t) => t.step === step).length;
    return acc;
  }, {} as Record<number, number>);

  const handleStepClick = (step: number) => {
    onStepChange(activeStep === step ? null : step);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* ── Desktop sidebar card ── */}
      <div
        className="rounded-2xl border p-4 lg:shadow-[0_0_40px_-10px_rgba(211,158,23,0.15)]"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.95)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        {/* Search (mobile only — desktop search is in the header) */}
        <div className="mb-4 lg:hidden">
          <div
            className="flex items-center rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <div className="pl-3 flex items-center justify-center" style={{ color: "#64748b" }}>
              <SearchIcon size="small" label="" />
            </div>
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none py-2.5 px-3 text-sm w-full"
              style={{ color: "#f1f5f9" }}
            />
          </div>
        </div>

        {/* Step filter — horizontal pills on mobile, vertical on desktop */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 hidden lg:block" style={{ color: "#64748b" }}>
            Filtrar por etapa
          </p>

          {/* Mobile: horizontal scrollable row */}
          <div className="flex flex-row overflow-x-auto gap-2 pb-2 lg:hidden">
            <button
              onClick={() => onStepChange(null)}
              aria-pressed={activeStep === null}
              className="h-9 shrink-0 px-3 rounded-full text-sm font-medium transition-all border"
              style={
                activeStep === null
                  ? { backgroundColor: "#d39e17", color: "#12110d", borderColor: "#d39e17" }
                  : { backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", borderColor: "rgba(255,255,255,0.12)" }
              }
            >
              Todos
            </button>
            {steps.map((step) => {
              const color = STEP_COLORS[step];
              const isActive = activeStep === step;
              return (
                <button
                  key={step}
                  onClick={() => handleStepClick(step)}
                  aria-pressed={isActive}
                  className="h-9 shrink-0 px-3 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5"
                  style={
                    isActive
                      ? { backgroundColor: color, color: "#12110d", borderColor: color }
                      : { backgroundColor: `${color}15`, color: color, borderColor: `${color}40` }
                  }
                >
                  {STEP_LABELS[step]}
                  {isActive && <span className="text-xs font-bold">×</span>}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical pill list */}
          <div className="hidden lg:flex flex-col gap-2">
            <button
              onClick={() => onStepChange(null)}
              aria-pressed={activeStep === null}
              className="h-9 w-full text-left px-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-between"
              style={
                activeStep === null
                  ? { backgroundColor: "#d39e17", color: "#12110d", borderColor: "#d39e17" }
                  : { backgroundColor: "rgba(255,255,255,0.04)", color: "#94a3b8", borderColor: "rgba(255,255,255,0.08)" }
              }
            >
              <span>Todos</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={
                  activeStep === null
                    ? { backgroundColor: "rgba(0,0,0,0.2)", color: "#12110d" }
                    : { backgroundColor: "rgba(255,255,255,0.1)", color: "#64748b" }
                }
              >
                {DOCUMENT_TEMPLATES.length}
              </span>
            </button>

            {steps.map((step) => {
              const color = STEP_COLORS[step];
              const isActive = activeStep === step;
              return (
                <button
                  key={step}
                  onClick={() => handleStepClick(step)}
                  aria-pressed={isActive}
                  className="h-9 w-full text-left px-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-between"
                  style={
                    isActive
                      ? { backgroundColor: color, color: "#12110d", borderColor: color }
                      : { backgroundColor: `${color}10`, color: color, borderColor: `${color}30` }
                  }
                >
                  <span className="truncate mr-2">{STEP_LABELS[step]}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={
                        isActive
                          ? { backgroundColor: "rgba(0,0,0,0.2)", color: "#12110d" }
                          : { backgroundColor: `${color}20`, color: color }
                      }
                    >
                      {countByStep[step]}
                    </span>
                    {isActive && <span className="text-xs font-bold">×</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Downloads — always visible on desktop, collapsible on mobile */}
        <div className="mb-4">
          {/* Desktop: always visible */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>
              Downloads Rápidos
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_DOWNLOADS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  download
                  className="flex items-center gap-2.5 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${item.color}08`, border: `1px solid ${item.color}25` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${item.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${item.color}08`;
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium truncate" style={{ color: item.color }}>
                    {item.label}
                  </span>
                  <DownloadIcon size="small" label="" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile: collapsible */}
          <details className="lg:hidden">
            <summary
              className="cursor-pointer text-sm font-semibold py-2 select-none list-none flex items-center justify-between"
              style={{ color: "#d39e17" }}
            >
              <span>Downloads Rápidos ({QUICK_DOWNLOADS.length})</span>
              <span className="text-xs" style={{ color: "#64748b" }}>▼</span>
            </summary>
            <div className="flex flex-col gap-2 mt-2">
              {QUICK_DOWNLOADS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  download
                  className="flex items-center gap-2.5 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${item.color}08`, border: `1px solid ${item.color}25` }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium truncate" style={{ color: item.color }}>
                    {item.label}
                  </span>
                  <DownloadIcon size="small" label="" />
                </a>
              ))}
            </div>
          </details>
        </div>

        {/* How to use — always a <details>, closed by default */}
        <details>
          <summary
            className="cursor-pointer text-sm font-semibold py-2 select-none list-none flex items-center justify-between"
            style={{ color: "#22c55e" }}
          >
            <span>Como usar os modelos</span>
            <span className="text-xs" style={{ color: "#64748b" }}>▼</span>
          </summary>
          <ul className="space-y-2 text-sm mt-2" style={{ color: "#94a3b8" }}>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>1.</span>
              <span>Baixe o documento clicando em "Baixar Word (.docx)"</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>2.</span>
              <span>Abra no Word, Google Docs ou LibreOffice</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>3.</span>
              <span>Substitua os campos [PREENCHER: ...] com seus dados</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#22c55e" }}>4.</span>
              <span>Salve em PDF para anexar ao processo</span>
            </li>
          </ul>
        </details>
      </div>
    </motion.div>
  );
}

// ─── TemplatesGrid ───────────────────────────────────────────────────────────

interface TemplatesGridProps {
  activeStep: number | null;
  searchQuery: string;
  onClearFilters?: () => void;
}

export function TemplatesGrid({ activeStep, searchQuery, onClearFilters }: TemplatesGridProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (templateId: string) => {
    setDownloadingId(templateId);
    try {
      await generateAndDownloadDocx(templateId);
      toast.success("Documento baixado com sucesso!");
    } catch {
      toast.error("Erro ao gerar o documento. Tente novamente.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter templates
  const filtered = DOCUMENT_TEMPLATES.filter((t) => {
    const matchesStep = activeStep === null || t.step === activeStep;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchesStep && matchesSearch;
  });

  const isFiltered = activeStep !== null || searchQuery.trim() !== "";

  // Group by step when no filter active; flat when filtered
  const groups: { step: number; templates: DocumentTemplate[] }[] = [];
  if (!isFiltered) {
    const byStep = filtered.reduce((acc, t) => {
      if (!acc[t.step]) acc[t.step] = [];
      acc[t.step].push(t);
      return acc;
    }, {} as Record<number, DocumentTemplate[]>);
    Object.keys(byStep)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((step) => groups.push({ step, templates: byStep[step] }));
  }

  return (
    <div aria-label={isFiltered ? `Modelos filtrados — ${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}` : "Todos os modelos"}>
      {/* Template count badge */}
      <p className="text-sm mb-4" style={{ color: "#64748b" }}>
        {isFiltered
          ? `Exibindo ${filtered.length} de ${DOCUMENT_TEMPLATES.length} modelos`
          : `${DOCUMENT_TEMPLATES.length} modelos disponíveis`}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4 opacity-40"
          >
            <circle cx="32" cy="32" r="30" stroke="#64748b" strokeWidth="2" />
            <path d="M20 32h24M32 20v24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <path d="M22 22l20 20M42 22L22 42" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-base font-medium mb-2" style={{ color: "#94a3b8" }}>
            Nenhum modelo encontrado
          </p>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>
            Tente ajustar os filtros ou a busca
          </p>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
              style={{
                backgroundColor: "rgba(211,158,23,0.1)",
                color: "#d39e17",
                borderColor: "rgba(211,158,23,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#d39e17";
                e.currentTarget.style.color = "#12110d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211,158,23,0.1)";
                e.currentTarget.style.color = "#d39e17";
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Flat grid when filtered */}
      {isFiltered && filtered.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key="filtered-grid"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            layout
          >
            {filtered.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TemplateCard
                  template={template}
                  onDownload={handleDownload}
                  downloading={downloadingId === template.id}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Grouped grid when no filter */}
      {!isFiltered && groups.length > 0 && (
        <div className="space-y-8">
          {groups.map(({ step, templates }) => {
            const color = STEP_COLORS[step];
            return (
              <div key={step}>
                {/* Step header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      backgroundColor: `${color}20`,
                      color,
                      border: `2px solid ${color}40`,
                    }}
                  >
                    {step === 0 ? "★" : step}
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: "#e8e4d8" }}>
                    {STEP_LABELS[step]}
                  </h3>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onDownload={handleDownload}
                      downloading={downloadingId === template.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Legacy re-export (deprecated) ──────────────────────────────────────────

/**
 * @deprecated Use TemplatesGrid + TemplatesSidebar inside Templates.tsx instead.
 */
export function TemplatesSection() {
  return <TemplatesGrid activeStep={null} searchQuery="" />;
}

export default TemplatesSection;
