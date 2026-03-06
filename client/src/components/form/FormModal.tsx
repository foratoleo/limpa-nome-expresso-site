import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, DownloadIcon } from "@/utils/icons";
import { FormSection } from "@/types/form";
import { useFormFill } from "@/hooks/useFormFill";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  templatePath: string;
  templateTitle: string;
  userEmail?: string;
  formSections?: FormSection[];
  onSavePDF?: () => void;
}

export function FormModal({
  isOpen,
  onClose,
  templatePath,
  templateTitle,
  userEmail,
  formSections = [],
  onSavePDF,
}: FormModalProps) {
  const formFill = useFormFill(formSections, userEmail || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate progress based on filled fields
  const progress = formFill.getProgress().percentage;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on ESC key
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

  const handleFieldChange = (fieldId: string, value: string) => {
    formFill.updateField(fieldId, value);
    // Clear error for this field when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSavePDF = () => {
    // Validate before saving
    const validation = formFill.validate();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSavePDF?.();
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
          position: "relative",
          width: "100%",
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          backgroundColor: "#162847",
          display: "flex",
          flexDirection: "column",
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
              Preencha o formulário abaixo
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
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c49314";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#d39e17";
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
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <CrossIcon size="medium" label="Fechar" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(211, 158, 23, 0.1)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}
          >
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#94a3b8" }}>Progresso</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#d39e17" }}>
              {Math.round(progress)}%
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
                width: `${progress}%`,
                backgroundColor: "#d39e17",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
          {formSections.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                borderRadius: "12px",
                backgroundColor: "rgba(211, 158, 23, 0.05)",
                border: "1px dashed rgba(211, 158, 23, 0.3)",
              }}
            >
              <p style={{ fontSize: "16px", color: "#94a3b8", margin: 0 }}>
                Formulário em carregamento...
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {formSections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(211, 158, 23, 0.15)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#d39e17",
                      margin: "0 0 16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(211, 158, 23, 0.15)",
                    }}
                  >
                    {section.title}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {section.fields.map((field) => {
                      const fieldError = errors[field.id];
                      return (
                        <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            htmlFor={field.id}
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {field.label}
                            {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              id={field.id}
                              value={String(formFill.values[field.id] || "")}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              maxLength={field.maxLength}
                              style={{
                                padding: "12px",
                                borderRadius: "8px",
                                border: fieldError ? "1px solid #ef4444" : "1px solid rgba(100, 116, 139, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                color: "#f1f5f9",
                                fontSize: "14px",
                                fontFamily: "inherit",
                                resize: "vertical",
                                minHeight: "100px",
                              }}
                            />
                          ) : (
                            <input
                              id={field.id}
                              type={field.type}
                              value={String(formFill.values[field.id] || "")}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              maxLength={field.maxLength}
                              style={{
                                padding: "12px",
                                borderRadius: "8px",
                                border: fieldError ? "1px solid #ef4444" : "1px solid rgba(100, 116, 139, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                color: "#f1f5f9",
                                fontSize: "14px",
                                fontFamily: "inherit",
                              }}
                            />
                          )}
                          {fieldError && (
                            <p style={{ fontSize: "12px", color: "#ef4444", margin: "4px 0 0" }}>
                              {fieldError}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderTop: "1px solid rgba(211, 158, 23, 0.2)",
            backgroundColor: "rgba(22, 40, 71, 0.98)",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            {progress === 100 ? "Formulário completo!" : "Preencha todos os campos obrigatórios"}
          </span>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(100, 116, 139, 0.3)",
                backgroundColor: "transparent",
                color: "#94a3b8",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePDF}
              disabled={progress < 100}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: progress >= 100 ? "#d39e17" : "rgba(211, 158, 23, 0.3)",
                color: progress >= 100 ? "#12110d" : "#64748b",
                fontWeight: 600,
                fontSize: "14px",
                cursor: progress >= 100 ? "pointer" : "not-allowed",
                opacity: progress >= 100 ? 1 : 0.6,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (progress >= 100) {
                  e.currentTarget.style.backgroundColor = "#c49314";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = progress >= 100 ? "#d39e17" : "rgba(211, 158, 23, 0.3)";
              }}
            >
              Salvar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
