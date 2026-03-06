import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, DownloadIcon } from "@/utils/icons";
import { replacePlaceholders } from "@/lib/templateParser";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateTitle: string;
  templateContent: string;
  onSavePDF?: (filledMarkdown: string) => void;
}

type TemplatePart =
  | { type: "text"; value: string }
  | { type: "placeholder"; key: string };

const PLACEHOLDER_REGEX = /\[PREENCHER:\s*([^\]]+?)\s*\]/g;

function parseTemplateParts(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = PLACEHOLDER_REGEX.exec(template)) !== null) {
    const fullMatch = match[0];
    const key = match[1].trim();

    if (match.index > lastIndex) {
      parts.push({ type: "text", value: template.slice(lastIndex, match.index) });
    }

    if (key) {
      parts.push({ type: "placeholder", key });
    } else {
      parts.push({ type: "text", value: fullMatch });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < template.length) {
    parts.push({ type: "text", value: template.slice(lastIndex) });
  }

  return parts;
}

function isLongField(key: string): boolean {
  const value = key.toLowerCase();
  return (
    value.includes("descreva") ||
    value.includes("repita o prejuizo") ||
    value.includes("repita o prejuízo") ||
    value.length > 55
  );
}

export function FormModal({
  isOpen,
  onClose,
  templateTitle,
  templateContent,
  onSavePDF,
}: FormModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setValues({});
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

  const templateParts = useMemo(() => parseTemplateParts(templateContent), [templateContent]);
  const uniqueKeys = useMemo(() => {
    const keys = templateParts
      .filter((part): part is Extract<TemplatePart, { type: "placeholder" }> => part.type === "placeholder")
      .map((part) => part.key);
    return [...new Set(keys)];
  }, [templateParts]);

  const blanksLeft = useMemo(() => {
    const filled = uniqueKeys.filter((key) => (values[key] || "").trim().length > 0).length;
    return uniqueKeys.length - filled;
  }, [uniqueKeys, values]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSavePDF = () => {
    const safeValues: Record<string, string> = {};
    for (const key of uniqueKeys) {
      safeValues[key] = (values[key] || "").trim() || "____________________";
    }

    const filledMarkdown = replacePlaceholders(templateContent, safeValues);
    onSavePDF?.(filledMarkdown);
  };

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
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
          <div
            style={{
              width: "100%",
              height: "100%",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid rgba(211, 158, 23, 0.25)",
              backgroundColor: "rgba(9, 17, 32, 0.9)",
              color: "#f1f5f9",
              lineHeight: 1.55,
              fontSize: "14px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {templateParts.map((part, index) => {
              if (part.type === "text") {
                return <span key={`text-${index}`}>{part.value}</span>;
              }

              const currentValue = values[part.key] || "";
              const longField = isLongField(part.key);

              if (longField) {
                return (
                  <textarea
                    key={`field-${index}`}
                    value={currentValue}
                    onChange={(e) => updateValue(part.key, e.target.value)}
                    placeholder="preencha aqui"
                    style={{
                      display: "inline-block",
                      verticalAlign: "middle",
                      width: "min(100%, 560px)",
                      minHeight: "82px",
                      margin: "4px 0",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(211, 158, 23, 0.45)",
                      backgroundColor: "rgba(18, 17, 13, 0.82)",
                      color: "#fde68a",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      lineHeight: 1.45,
                      resize: "vertical",
                    }}
                  />
                );
              }

              return (
                <input
                  key={`field-${index}`}
                  value={currentValue}
                  onChange={(e) => updateValue(part.key, e.target.value)}
                  placeholder="preencher"
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: "min(420px, 100%)",
                    minWidth: "220px",
                    margin: "0 3px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(211, 158, 23, 0.45)",
                    backgroundColor: "rgba(18, 17, 13, 0.82)",
                    color: "#fde68a",
                    fontFamily: "inherit",
                    fontSize: "13px",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
