import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, DownloadIcon } from "@/utils/icons";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateTitle: string;
  templateContent: string;
  onSavePDF?: (filledMarkdown: string) => void;
}

function toEditableTemplate(template: string): string {
  return template.replace(/\[PREENCHER:\s*([^\]]+?)\s*\]/g, (_, placeholder: string) => {
    const blankSize = Math.max(20, Math.min(placeholder.trim().length + 8, 64));
    return "_".repeat(blankSize);
  });
}

export function FormModal({
  isOpen,
  onClose,
  templateTitle,
  templateContent,
  onSavePDF,
}: FormModalProps) {
  const [editableContent, setEditableContent] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setEditableContent(toEditableTemplate(templateContent));
  }, [isOpen, templateContent]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  const blanksLeft = useMemo(() => {
    return (editableContent.match(/_{8,}/g) || []).length;
  }, [editableContent]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSavePDF = () => {
    onSavePDF?.(editableContent);
  };

  if (!isOpen) return null;

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
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "100vh",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#162847",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            backgroundColor: "rgba(22, 40, 71, 0.98)",
            borderBottom: "1px solid rgba(211, 158, 23, 0.2)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "20px",
                color: "#f1f5f9",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {templateTitle}
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "4px 0 0" }}>
              Texto completo do modelo original. Preencha diretamente nos espaços em branco.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={handleSavePDF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#d39e17",
                color: "#12110d",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <DownloadIcon size="small" label="" />
              Salvar PDF
            </button>
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
            >
              <CrossIcon size="medium" label="Fechar" />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid rgba(211, 158, 23, 0.12)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Espaços em branco restantes: <strong style={{ color: "#f1f5f9" }}>{blanksLeft}</strong>
        </div>

        <div style={{ flex: 1, padding: "16px 24px 24px" }}>
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              resize: "none",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid rgba(211, 158, 23, 0.25)",
              backgroundColor: "rgba(9, 17, 32, 0.9)",
              color: "#f1f5f9",
              lineHeight: 1.55,
              fontSize: "14px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
