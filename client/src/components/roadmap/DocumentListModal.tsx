import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, DownloadIcon, FileIcon, TrashIcon, AddCircleIcon } from "@/utils/icons";
import type { UserDocument } from "@/types/supabase";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentWithAttachment {
  id: string;
  document: UserDocument;
  checklistDocId: string;
}

interface DocumentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemLabel: string;
  stepNumber: number;
  documents: DocumentWithAttachment[];
  allUserDocuments: UserDocument[];
  onAttachDocument: (documentId: string) => Promise<boolean>;
  onDetachDocument: (checklistDocId: string) => Promise<boolean>;
  onDownload: (document: UserDocument) => void;
  onRefresh?: () => void;
  documentKey?: number; // Force re-render when this changes
}

export function DocumentListModal({
  isOpen,
  onClose,
  itemId,
  itemLabel,
  stepNumber,
  documents,
  allUserDocuments,
  onAttachDocument,
  onDetachDocument,
  onDownload,
  onRefresh,
  documentKey,
}: DocumentListModalProps) {
  const { uploadDocument } = useDocuments();
  const [showAttachList, setShowAttachList] = useState(false);
  const [attaching, setAttaching] = useState<string | null>(null);
  const [detaching, setDetaching] = useState<string | null>(null);
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const attachListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAttachList) {
          setShowAttachList(false);
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
  }, [isOpen, onClose, showAttachList]);

  // Filter out already attached documents
  const attachedIds = new Set(documents.map((d) => d.document.id));
  const availableDocuments = allUserDocuments.filter((d) => !attachedIds.has(d.id));

  const handleAttach = async (documentId: string) => {
    setAttaching(documentId);
    try {
      const success = await onAttachDocument(documentId);
      console.log('[DocumentListModal] Attach result:', success, 'Refreshing documents...');
      if (success) {
        setShowAttachList(false);
        // Explicitly refresh to get updated documents
        await onRefresh?.();
        console.log('[DocumentListModal] Documents after refresh:', documents.length);
      }
    } finally {
      setAttaching(null);
    }
  };

  const handleDetach = async (checklistDocId: string) => {
    setDetaching(checklistDocId);
    try {
      await onDetachDocument(checklistDocId);
    } finally {
      setDetaching(null);
    }
  };

  const handleDirectUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[DocumentListModal] No file selected');
      return;
    }

    console.log('[DocumentListModal] File selected:', file.name, file.size, file.type);
    setUploadingDirect(true);

    try {
      // Upload com nome padrão
      const name = file.name.replace(/\.[^/.]+$/, "");
      console.log('[DocumentListModal] Starting upload...');
      const result = await uploadDocument(file, name, "geral");
      console.log('[DocumentListModal] Upload result:', result);

      if (result.success && result.documentId && onAttachDocument) {
        console.log('[DocumentListModal] Upload successful, attaching document...');
        // Vincular automaticamente
        const attachSuccess = await onAttachDocument(result.documentId);
        console.log('[DocumentListModal] Attach result:', attachSuccess);

        if (attachSuccess) {
          console.log('[DocumentListModal] Document attached successfully, refreshing...');
          // Recarregar lista para mostrar novo documento
          await onRefresh?.();
          console.log('[DocumentListModal] Refresh complete');
        } else {
          console.error('[DocumentListModal] Failed to attach document');
          toast.error("Arquivo enviado, mas não foi possível vincular ao item");
        }
      } else {
        console.error('[DocumentListModal] Upload failed or no document ID:', result);
        toast.error("Não foi possível enviar o arquivo");
      }
    } catch (err) {
      console.error('[DocumentListModal] Error in upload process:', err);
      toast.error("Erro ao enviar arquivo");
    } finally {
      console.log('[DocumentListModal] Upload process complete, resetting state');
      setUploadingDirect(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDirectUploadClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!uploadingDirect) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={handleDirectUpload}
      />
      {(() => {
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
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid rgba(211, 158, 23, 0.3)",
          backgroundColor: "#162847",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(211, 158, 23, 0.2)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
              Documentos Vinculados
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "#94a3b8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {itemLabel}
            </p>
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <CrossIcon size="small" label="Fechar" />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", maxHeight: "calc(80vh - 140px)" }}>
          {/* Document List */}
          <div style={{ padding: "16px 20px" }}>
            {documents.length === 0 ? (
              <div
                onClick={(e) => {
                  console.log('[Empty Area] Clicked, stopping propagation');
                  e.stopPropagation();
                  e.preventDefault();
                  handleDirectUploadClick(e);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !uploadingDirect) {
                    console.log('[Empty Area] Enter key pressed');
                    e.stopPropagation();
                    handleDirectUploadClick();
                  }
                }}
                onMouseDown={(e) => {
                  console.log('[Empty Area] Mouse down, stopping propagation');
                  e.stopPropagation();
                }}
                style={{
                  textAlign: "center",
                  padding: "24px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px dashed rgba(211, 158, 23, 0.3)",
                  cursor: uploadingDirect ? "wait" : "pointer",
                  opacity: uploadingDirect ? 0.7 : 1,
                }}
                role="button"
                tabIndex={0}
                aria-label="Fazer upload de documento"
              >
                {uploadingDirect ? (
                  <>
                    <div
                      className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                      style={{ borderColor: "#d39e17", borderTopColor: "transparent" }}
                    />
                    <p style={{ margin: "12px 0 4px", fontSize: "14px", color: "#94a3b8" }}>
                      Enviando documento...
                    </p>
                  </>
                ) : (
                  <>
                    <FileIcon size="medium" label="" />
                    <p style={{ margin: "12px 0 4px", fontSize: "14px", color: "#94a3b8" }}>
                      Nenhum documento vinculado
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      Clique aqui para adicionar
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(34, 197, 94, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(34, 197, 94, 0.15)",
                      }}
                    >
                      <FileIcon size="small" label="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#f1f5f9",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.document.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                        {doc.document.category} {doc.document.file_size ? `• ${formatFileSize(doc.document.file_size)}` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => onDownload(doc.document)}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "rgba(96, 165, 250, 0.15)",
                          color: "#60a5fa",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Baixar"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(96, 165, 250, 0.25)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(96, 165, 250, 0.15)")}
                      >
                        <DownloadIcon size="small" label="Baixar" />
                      </button>
                      <button
                        onClick={() => handleDetach(doc.checklistDocId)}
                        disabled={detaching === doc.checklistDocId}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          cursor: detaching === doc.checklistDocId ? "wait" : "pointer",
                          opacity: detaching === doc.checklistDocId ? 0.5 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Desvincular"
                        onMouseEnter={(e) => detaching !== doc.checklistDocId && (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)")}
                      >
                        <TrashIcon size="small" label="Desvincular" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attach New Document Section */}
          {showAttachList && (
            <div
              ref={attachListRef}
              style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(211, 158, 23, 0.2)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 500, color: "#94a3b8" }}>
                Selecione um documento para vincular:
              </p>
              {availableDocuments.length === 0 ? (
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", textAlign: "center", padding: "16px" }}>
                  Todos os seus documentos ja estao vinculados ou voce nao tem documentos cadastrados.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {availableDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleAttach(doc.id)}
                      disabled={attaching === doc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(211, 158, 23, 0.2)",
                        backgroundColor: attaching === doc.id ? "rgba(211, 158, 23, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        cursor: attaching === doc.id ? "wait" : "pointer",
                        opacity: attaching === doc.id ? 0.7 : 1,
                        textAlign: "left",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => attaching !== doc.id && (e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = attaching === doc.id ? "rgba(211, 158, 23, 0.15)" : "rgba(255, 255, 255, 0.03)")}
                    >
                      <FileIcon size="small" label="" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#f1f5f9" }}>
                          {doc.name}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                          {doc.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderTop: "1px solid rgba(211, 158, 23, 0.2)",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {documents.length} documento{documents.length !== 1 ? "s" : ""} vinculado{documents.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowAttachList(!showAttachList)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: showAttachList ? "rgba(255, 255, 255, 0.1)" : "#d39e17",
              color: showAttachList ? "#f1f5f9" : "#12110d",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <AddCircleIcon size="small" label="" />
            {showAttachList ? "Cancelar" : "Vincular Documento"}
          </button>
        </div>
      </div>
    </div>
  );

        return createPortal(modalContent, document.body);
      })()}
    </>
  );
}
