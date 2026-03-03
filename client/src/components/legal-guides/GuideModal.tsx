import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuideMetadata, GuideCategory } from "@/types/guides";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { PrinterIcon } from "lucide-react";

interface GuideModalProps {
  guide: GuideMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  "base-legal": "Base Legal",
  "procedimentos": "Procedimentos",
  "modelos": "Modelos",
  "jurisprudencia": "Jurisprudência",
  "expansao-regional": "Expansão Regional",
};

export function GuideModal({ guide, isOpen, onClose }: GuideModalProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load markdown content when guide changes
  useEffect(() => {
    if (!guide || !isOpen) {
      setContent("");
      setError(null);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(guide.contentFile);
        if (!response.ok) {
          throw new Error(`Failed to load guide content: ${response.statusText}`);
        }
        const markdown = await response.text();
        setContent(markdown);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guide content");
        console.error("Error loading guide content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [guide, isOpen]);

  const handlePrint = () => {
    window.print();
  };

  if (!guide) return null;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          [data-dialog-overlay] {
            display: none !important;
          }
          [data-dialog-content] {
            position: static !important;
            transform: none !important;
            max-width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
          }
          body > *:not([data-dialog-content]) {
            display: none !important;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-full max-h-[90vh] overflow-hidden flex flex-col"
          data-dialog-content
          showCloseButton={true}
        >
          <DialogHeader className="border-b border-[#d39e17]/20 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block px-2 py-1 text-xs font-semibold rounded"
                    style={{
                      backgroundColor: "rgba(211, 158, 23, 0.15)",
                      color: "#d39e17",
                      border: "1px solid rgba(211, 158, 23, 0.3)",
                    }}
                  >
                    {CATEGORY_LABELS[guide.category]}
                  </span>
                  <span
                    className="inline-block px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: "rgba(22, 40, 71, 0.5)",
                      color: "#94a3b8",
                    }}
                  >
                    {guide.estimatedReadTime} min de leitura
                  </span>
                </div>
                <DialogTitle
                  className="text-xl md:text-2xl font-bold leading-tight text-[#f1f5f9]"
                  style={{ color: "#f1f5f9" }}
                >
                  {guide.title}
                </DialogTitle>
                <p
                  className="text-sm md:text-base mt-2"
                  style={{ color: "#94a3b8" }}
                >
                  {guide.description}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 md:py-6 px-4 md:px-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div
                    className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-2 border-[#d39e17] mb-4"
                    style={{
                      borderColor: "#d39e17 transparent #d39e17 transparent",
                    }}
                  />
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    Carregando conteúdo...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>
                  Erro ao carregar guia
                </p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {error}
                </p>
              </div>
            )}

            {!isLoading && !error && content && (
              <MarkdownRenderer content={content} />
            )}
          </div>

          <DialogFooter className="border-t border-[#d39e17]/20 pt-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#d39e17] focus:ring-opacity-50"
              style={{
                backgroundColor: "rgba(211, 158, 23, 0.15)",
                color: "#d39e17",
                border: "1px solid rgba(211, 158, 23, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.25)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.15)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <PrinterIcon size={16} />
              Imprimir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
