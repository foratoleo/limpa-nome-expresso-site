import { useEffect, useRef } from 'react';
import { XIcon, ExternalLinkIcon, DownloadIcon, FileIcon, BookOpenIcon, ChevronRightIcon } from '@/utils/icons';
import type { SearchResult } from '@/hooks/useSearchGuide';

interface SearchResultsProps {
  results: SearchResult[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, isOpen, onClose, onSelect }: SearchResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'step':
        return <FileIcon size="small" label="" />;
      case 'guide':
        return <BookOpenIcon size="small" label="" />;
      case 'item':
        return <ChevronRightIcon size="small" label="" />;
      default:
        return <ChevronRightIcon size="small" label="" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'step':
        return '#d39e17';
      case 'guide':
        return '#22c55e';
      case 'item':
        return '#60a5fa';
      default:
        return '#64748b';
    }
  };

  if (!isOpen || results.length === 0) return null;

  return (
    <div
      ref={resultsRef}
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-50
        w-full max-w-2xl max-h-[70vh]
        rounded-2xl border
        backdrop-blur-xl
        overflow-hidden
        transition-all duration-300
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.98)",
        borderColor: "rgba(211, 158, 23, 0.3)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}
      >
        <div>
          <h3 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>
            Resultados da Busca
          </h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {results.length} encontrado{results.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
        >
          <XIcon size="small" label="Fechar" />
        </button>
      </div>

      {/* Results List */}
      <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
        {results.map((result) => (
          <button
            key={result.id}
            onClick={() => {
              onSelect(result);
              onClose();
            }}
            className="w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            style={{
              borderBottomColor: "rgba(255, 255, 255, 0.05)"
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{ backgroundColor: `rgba(${getTypeColor(result.type)}, 0.1)` }}
              >
                <span style={{ color: getTypeColor(result.type) }}>
                  {getIcon(result.type)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(${getTypeColor(result.type)}, 0.2)`,
                      color: getTypeColor(result.type)
                    }}
                  >
                    {result.type === 'step' ? 'Fase' :
                     result.type === 'guide' ? 'Guia' : 'Item'}
                  </span>
                  {result.phase && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(211, 158, 23, 0.2)",
                        color: "#d39e17"
                      }}
                    >
                      Fase {result.phase}
                    </span>
                  )}
                  {result.category && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        color: "#22c55e"
                      }}
                    >
                      {result.category}
                    </span>
                  )}
                </div>

                <h4
                  className="font-medium text-sm mb-1 truncate"
                  style={{ color: "#f1f5f9" }}
                >
                  {result.title}
                </h4>

                {result.subtitle && (
                  <p
                    className="text-xs mb-2 truncate"
                    style={{ color: "#94a3b8" }}
                  >
                    {result.subtitle}
                  </p>
                )}

                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: "#64748b" }}
                >
                  {result.description}
                </p>

                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5"
                        style={{ color: "#64748b" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {result.content && (
                  <p
                    className="text-xs mt-2 italic"
                    style={{ color: "#d39e17" }}
                  >
                    {result.content}
                  </p>
                )}
              </div>

              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `rgba(${getTypeColor(result.type)}, 0.1)` }}
              >
                <span style={{ color: getTypeColor(result.type) }}>
                  {result.type === 'item' ? (
                    <DownloadIcon size="small" label="" />
                  ) : (
                    <ChevronRightIcon size="small" label="" />
                  )}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {results.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm" style={{ color: "#64748b" }}>
            Nenhum resultado encontrado para sua busca.
          </p>
        </div>
      )}
    </div>
  );
}