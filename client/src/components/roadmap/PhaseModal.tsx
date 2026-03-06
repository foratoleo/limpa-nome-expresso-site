import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, CheckCircleIcon, LinkExternalIcon, DownloadIcon, FileIcon } from "@/utils/icons";
import type { PhaseStatus } from "@/hooks/useCurrentPhase";
import { STEPS } from "@/data/steps";
import type { CheckItemData } from "@/components/CheckItem";
import { useChecklistDocuments } from "@/hooks/useChecklistDocuments";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentListModal } from "./DocumentListModal";
import { DualActionCard } from "@/components/ui/DualActionCard";
import { FormModal } from "@/components/form/FormModal";
import { PETICAO_INICIAL_FORM_SCHEMA } from "@/config/formSchemas";
import type { FormValues } from "@/types/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generatePDF } from "@/lib/pdfGenerator";
import { fetchTemplate } from "@/lib/templateFetcher";

interface PhaseModalProps {
  phase: PhaseStatus;
  isOpen: boolean;
  onClose: () => void;
  checkedItems: Record<string, boolean>;
  onToggleItem: (itemId: string, stepNumber: number) => void;
}

export function PhaseModal({ phase, isOpen, onClose, checkedItems, onToggleItem }: PhaseModalProps) {
  // Get step data from STEPS
  const stepData = STEPS.find(s => s.number === phase.phaseNumber);

  // Document attachment state
  const [selectedItem, setSelectedItem] = useState<{ id: string; label: string } | null>(null);

  // Form modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<{ path: string; title: string } | null>(null);

  // Get user from auth
  const { user } = useAuth();

  const {
    documentsByItem,
    attachDocument,
    detachDocument,
    getDocumentCount,
    refresh: refreshChecklistDocuments,
  } = useChecklistDocuments();
  const { documents: allUserDocuments, downloadDocument, refresh: refreshUserDocuments } = useDocuments();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, selectedItem]);

  if (!isOpen || !stepData) return null;

  const isPhaseComplete = phase.completedItems === phase.totalItems;

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          maxHeight: "95vh",
          overflow: "hidden",
          borderRadius: "16px",
          border: `2px solid ${isPhaseComplete ? "#22c55e" : "#d39e17"}`,
          backgroundColor: "#162847",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "rgba(22, 40, 71, 0.98)",
            borderBottom: "1px solid rgba(211, 158, 23, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${isPhaseComplete ? "#22c55e" : "#d39e17"}`,
                backgroundColor: isPhaseComplete ? "rgba(34, 197, 94, 0.2)" : "rgba(211, 158, 23, 0.2)",
              }}
            >
              {isPhaseComplete ? (
                <CheckCircleIcon size="medium" label="" />
              ) : (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "20px",
                    color: isPhaseComplete ? "#22c55e" : "#d39e17",
                  }}
                >
                  {phase.phaseNumber}
                </span>
              )}
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#f1f5f9", margin: 0 }}>
                {stepData.title}
              </h2>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
                {stepData.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <CrossIcon size="medium" label="Fechar" />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(211, 158, 23, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#94a3b8" }}>
              Progresso
            </span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: isPhaseComplete ? "#22c55e" : "#d39e17" }}>
              {phase.completedItems}/{phase.totalItems} itens
            </span>
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "999px",
              overflow: "hidden",
              backgroundColor: "rgba(100, 116, 139, 0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "999px",
                width: `${phase.progress}%`,
                backgroundColor: isPhaseComplete ? "#22c55e" : "#d39e17",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", maxHeight: "calc(95vh - 180px)" }}>
          {/* Tip */}
          {stepData.tip && (
            <div style={{ margin: "16px 20px 0", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(211, 158, 23, 0.1)", border: "1px solid rgba(211, 158, 23, 0.3)" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: "#d39e17" }}>
                Dica Importante
              </p>
              <p style={{ fontSize: "14px", color: "#e8e4d8", margin: 0 }}>
                {stepData.tip}
              </p>
            </div>
          )}

          {/* Downloads */}
          {stepData.downloads && stepData.downloads.length > 0 && (
            <div style={{ margin: "16px 20px 0" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#f1f5f9" }}>
                Downloads
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stepData.downloads.map((download, idx) => (
                  download.template === 'form-fillable' ? (
                    <DualActionCard
                      key={idx}
                      download={download}
                      onDownload={() => {
                        // Trigger browser download
                        const link = document.createElement('a');
                        link.href = download.file;
                        link.download = '';
                        link.click();
                      }}
                      onFillOnline={() => {
                        setCurrentTemplate({
                          path: download.file,
                          title: download.label,
                        });
                        setFormModalOpen(true);
                      }}
                    />
                  ) : (
                    <a
                      key={idx}
                      href={download.file}
                      download
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(211, 158, 23, 0.08)",
                        border: "1px solid rgba(211, 158, 23, 0.2)",
                        textDecoration: "none",
                      }}
                    >
                      <DownloadIcon size="medium" label="" />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: "14px", color: "#d39e17", margin: 0 }}>
                          {download.label}
                        </p>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                          {download.description}
                        </p>
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {stepData.links && stepData.links.length > 0 && (
            <div style={{ margin: "16px 20px 0" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#f1f5f9" }}>
                Links Úteis
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stepData.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(96, 165, 250, 0.08)",
                      border: "1px solid rgba(96, 165, 250, 0.2)",
                      textDecoration: "none",
                    }}
                  >
                    <LinkExternalIcon size="small" label="" />
                    <span style={{ fontWeight: 500, fontSize: "14px", color: "#60a5fa" }}>
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#f1f5f9" }}>
              Checklist da Fase
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {stepData.items.map((item: CheckItemData) => {
                const isChecked = checkedItems[item.id] === true;
                const docCount = getDocumentCount(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => onToggleItem(item.id, phase.phaseNumber)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: isChecked ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.03)",
                        borderLeft: `4px solid ${isChecked ? "#22c55e" : "transparent"}`,
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          marginTop: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `2px solid ${isChecked ? "#22c55e" : "#64748b"}`,
                          backgroundColor: isChecked ? "#22c55e" : "transparent",
                        }}
                      >
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="#12110d"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            margin: 0,
                            color: isChecked ? "#22c55e" : "#e8e4d8",
                          }}
                        >
                          {item.label}
                        </p>
                        {item.detail && (
                          <p
                            style={{
                              fontSize: "12px",
                              marginTop: "4px",
                              margin: "4px 0 0",
                              color: isChecked ? "#22c55e" : "#64748b",
                            }}
                          >
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </button>
                    {/* Document attachment button */}
                    <button
                      onClick={() => setSelectedItem({ id: item.id, label: item.label })}
                      title="Vincular documentos"
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: docCount > 0 ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(211, 158, 23, 0.3)",
                        backgroundColor: docCount > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(211, 158, 23, 0.08)",
                        color: docCount > 0 ? "#22c55e" : "#d39e17",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 500,
                        marginTop: "4px",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = docCount > 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(211, 158, 23, 0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = docCount > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(211, 158, 23, 0.08)"}
                    >
                      <FileIcon size="small" label="" />
                      {docCount > 0 && <span>{docCount}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Document List Modal */}
      {selectedItem && (
        <DocumentListModal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          itemId={selectedItem.id}
          itemLabel={selectedItem.label}
          stepNumber={phase.phaseNumber}
          documents={documentsByItem[selectedItem.id]?.map(doc => ({
            id: doc.id,
            document: doc.document,
            checklistDocId: doc.id,
          })) || []}
          allUserDocuments={allUserDocuments}
          onAttachDocument={async (documentId: string) => {
            return attachDocument(selectedItem.id, phase.phaseNumber, documentId);
          }}
          onDetachDocument={detachDocument}
          onDownload={(doc) => downloadDocument(doc.file_url, doc.name)}
          onRefresh={async () => {
            await refreshChecklistDocuments();
            await refreshUserDocuments();
          }}
        />
      )}

      {/* Form Modal for Online Filling */}
      {formModalOpen && currentTemplate && (
        <FormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          templatePath={currentTemplate.path}
          templateTitle={currentTemplate.title}
          userEmail={user?.email}
          formSections={PETICAO_INICIAL_FORM_SCHEMA}
          onSavePDF={async (formValues: FormValues) => {
            try {
              const template = await fetchTemplate(currentTemplate.path);
              const stringValues: Record<string, string> = {};
              for (const [key, value] of Object.entries(formValues)) {
                stringValues[key] = String(value);
              }
              await generatePDF({
                template,
                values: stringValues,
                filename: `peticao_inicial_jec_sp`,
                onSuccess: () => {
                  toast.success('PDF gerado com sucesso!');
                  setFormModalOpen(false);
                },
                onError: () => {
                  toast.error('Erro ao gerar PDF. Tente baixar o arquivo.');
                },
              });
            } catch {
              toast.error('Erro ao carregar template. Baixe o arquivo manualmente.');
            }
          }}
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
