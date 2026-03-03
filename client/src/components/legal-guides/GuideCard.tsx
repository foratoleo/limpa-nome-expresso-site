import { Clock, Tag } from "lucide-react";
import type { GuideMetadata } from "@/types/guides";

interface GuideCardProps {
  guide: GuideMetadata;
  onClick: () => void;
}

export function GuideCard({ guide, onClick }: GuideCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 md:p-6 rounded-xl border transition-all duration-200 hover:border-[#d39e17] hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#d39e17] focus:ring-opacity-50"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.2)",
      }}
    >
      {/* Title */}
      <h4 className="font-medium text-base md:text-lg mb-2 leading-tight" style={{ color: "#f1f5f9" }}>
        {guide.title}
      </h4>

      {/* Description */}
      <p className="text-sm md:text-base mb-3 line-clamp-2 md:line-clamp-3" style={{ color: "#94a3b8" }}>
        {guide.description}
      </p>

      {/* Tags */}
      {guide.tags && guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {guide.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(211, 158, 23, 0.15)",
                color: "#d39e17",
              }}
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
          {guide.tags.length > 3 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(148, 163, 184, 0.15)",
                color: "#94a3b8",
              }}
            >
              +{guide.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs" style={{ color: "#64748b" }}>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{guide.estimatedReadTime} min</span>
        </div>
        <span>Atualizado em {formatDate(guide.lastUpdated)}</span>
      </div>
    </button>
  );
}