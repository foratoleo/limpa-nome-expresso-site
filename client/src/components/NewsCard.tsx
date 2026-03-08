import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  type NewsArticle,
  CATEGORY_COLORS,
} from "@/data/news-articles";

const CATEGORY_LABELS: Record<string, string> = {
  jurisprudencia: "Jurisprudência",
  direitos: "Direitos",
  estatisticas: "Estatísticas",
  prescricao: "Prescrição",
  fraude: "Fraude",
  score: "Score",
  jec: "JEC",
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${day} ${months[parseInt(month, 10) - 1]}. ${year}`;
}

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = CATEGORY_COLORS[article.category];

  return (
    <Link href={`/noticias/${article.slug}`}>
      <motion.article
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl flex flex-col gap-3 overflow-hidden cursor-pointer h-full"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.95)",
          border: "1px solid",
          borderColor: isHovered
            ? "rgba(211, 158, 23, 0.5)"
            : "rgba(211, 158, 23, 0.2)",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Category color bar */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
          }}
        />

        <div className="px-5 pb-5 flex flex-col gap-3 flex-1">
          {/* Category badge */}
          <span
            className="text-xs font-semibold uppercase tracking-wide w-fit"
            style={{ color: colors.primary }}
          >
            {CATEGORY_LABELS[article.category] ?? article.category}
          </span>

          {/* Title */}
          <h3
            className="font-bold leading-snug"
            style={{
              color: "#f1f5f9",
              fontSize: "1.05rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed flex-1"
            style={{
              color: "#94a3b8",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex flex-col gap-2 mt-auto pt-2 border-t" style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
              <time dateTime={article.publishedDate}>
                {formatDate(article.publishedDate)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{article.estimatedReadTime} min de leitura</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                  style={{
                    color: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.25)",
                    backgroundColor: "transparent",
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default NewsCard;
