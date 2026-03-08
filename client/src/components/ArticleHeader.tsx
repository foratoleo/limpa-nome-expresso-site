import { motion } from "framer-motion";
import { type ArticleCategory, CATEGORY_COLORS } from "@/data/news-articles";

interface ArticleHeaderProps {
  category: ArticleCategory;
  title: string;
}

export function ArticleHeader({ category, title }: ArticleHeaderProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative w-full overflow-hidden flex items-center justify-center min-h-[100px] md:min-h-[160px]"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      }}
    >
      {/* SVG geometric overlay */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id={`hex-pattern-${category}`}
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="30,2 58,17 58,47 30,62 2,47 2,17"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.08"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#hex-pattern-${category})`}
        />
      </svg>

      {/* Title */}
      <div className="relative z-10 px-6 py-8 w-full max-w-3xl mx-auto text-center">
        <h1
          className="font-bold leading-tight"
          style={{
            color: "#f1f5f9",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {title}
        </h1>
      </div>
    </motion.div>
  );
}

export default ArticleHeader;
