import { Scale, FileText, FileEdit, Gavel, Map } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { GuideCard } from "./GuideCard";
import type { GuideCategoryInfo } from "@/types/guides";

interface GuidesAccordionProps {
  categories: GuideCategoryInfo[];
  onGuideClick: (guideId: string) => void;
  searchQuery?: string;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  "base-legal": Scale,
  "procedimentos": FileText,
  "modelos": FileEdit,
  "jurisprudencia": Gavel,
  "expansao-regional": Map,
};

export function GuidesAccordion({
  categories,
  onGuideClick,
  searchQuery = "",
}: GuidesAccordionProps) {
  // Filter categories based on search query
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      guides: category.guides.filter((guide) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
          guide.title.toLowerCase().includes(query) ||
          guide.description.toLowerCase().includes(query) ||
          guide.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }),
    }))
    .filter((category) => category.guides.length > 0);

  if (filteredCategories.length === 0) {
    return (
      <div
        className="text-center py-12 px-4 md:px-6 rounded-xl border"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.5)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <p className="text-lg font-medium mb-2" style={{ color: "#f1f5f9" }}>
          Nenhum guia encontrado
        </p>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Tente buscar por outros termos ou navegue pelas categorias
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {filteredCategories.map((category) => {
        const IconComponent = CATEGORY_ICONS[category.id];

        return (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="border rounded-xl mb-3"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <AccordionTrigger className="px-4 md:px-5 py-3 md:py-4 hover:no-underline transition-colors duration-200">
              <div className="flex items-start gap-3 text-left flex-1">
                {IconComponent && (
                  <div
                    className="flex-shrink-0 p-2 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-opacity-25"
                    style={{ backgroundColor: "rgba(211, 158, 23, 0.15)" }}
                  >
                    <IconComponent className="text-[#d39e17]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-base md:text-lg leading-tight" style={{ color: "#f1f5f9" }}>
                      {category.label}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(211, 158, 23, 0.15)",
                        color: "#d39e17",
                      }}
                    >
                      {category.guides.length}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-1 md:line-clamp-2" style={{ color: "#94a3b8" }}>
                    {category.description}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 md:px-5 pb-4">
              <div className="space-y-3">
                {category.guides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    onClick={() => onGuideClick(guide.id)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
