import { SearchIcon } from "@/utils/icons";

interface GuidesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalGuides: number;
}

export function GuidesHeader({ searchQuery, onSearchChange, totalGuides }: GuidesHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-start lg:items-center mb-6 lg:mb-8">
      {/* Left side: Title and description */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3 leading-tight" style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}>
          Guias Jurídicos
        </h1>
        <p className="text-sm lg:text-base" style={{ color: "#94a3b8", lineHeight: "1.5" }}>
          Documentos completos para limpeza de nome e direitos do consumidor
        </p>
      </div>

      {/* Right side: Search input and total count */}
      <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center">
        {/* Total count badge */}
        <div
          className="px-3 py-1.5 rounded-full font-medium text-sm flex-shrink-0"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          {totalGuides} guias disponíveis
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm lg:max-w-320">
          <SearchIcon size="medium" label="" />
          <input
            type="text"
            placeholder="Buscar guias..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
              backgroundColor: "rgba(22, 40, 71, 0.95)",
            }}
          />
        </div>
      </div>
    </div>
  );
}