import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/utils/icons";
import CheckCircleIcon from "@atlaskit/icon/core/check-circle";
import * as React from "react";

export interface FormSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  completed?: boolean;
  totalFields?: number;
  completedFields?: number;
  children: React.ReactNode;
  className?: string;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    {
      title,
      description,
      defaultOpen = true,
      completed = false,
      totalFields = 0,
      completedFields = 0,
      children,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    // Count FormField components to calculate progress if not provided
    const calculateProgress = () => {
      if (totalFields > 0) {
        return { total: totalFields, completed: completedFields };
      }

      // If no counts provided, count child elements
      const childArray = React.Children.toArray(children);
      const total = childArray.length;
      // Assume all are completed if marked as completed, otherwise 0
      const completedCount = completed ? total : 0;

      return { total, completed: completedCount };
    };

    const progress = calculateProgress();
    const progressText = progress.total > 0
      ? `${progress.completed}/${progress.total} campos preenchidos`
      : "";

    const toggleSection = () => {
      setIsOpen((prev) => !prev);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-navy-600 bg-[#162847]/50",
          className
        )}
      >
        <button
          type="button"
          onClick={toggleSection}
          className="flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left transition-colors hover:bg-[#162847]/70 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          aria-expanded={isOpen}
        >
          <div className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                completed
                  ? "border-gold-500 bg-gold-500/20"
                  : "border-navy-400 bg-transparent"
              )}
            >
              {completed ? (
                <CheckCircleIcon
                  label="Seção completa"
                  size="small"
                />
              ) : (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isOpen ? "text-gold-500" : "text-navy-400"
                  )}
                >
                  {progress.total > 0 ? progress.completed : 0}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isOpen || completed
                    ? "text-[#f1f5f9]"
                    : "text-navy-300"
                )}
              >
                {title}
              </span>
              {description && (
                <span
                  className={cn(
                    "text-xs leading-tight",
                    isOpen ? "text-navy-200" : "text-navy-400"
                  )}
                >
                  {description}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {progressText && (
              <span
                className={cn(
                  "text-xs",
                  isOpen ? "text-navy-200" : "text-navy-400"
                )}
              >
                {progressText}
              </span>
            )}
            <div className={cn(
              "transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0"
            )}>
              <ChevronDownIcon
                label={isOpen ? "Recolher seção" : "Expandir seção"}
                size="medium"
              />
            </div>
          </div>
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen
              ? "max-h-[9999px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-navy-600 bg-[#12110d]/30 px-4 py-4">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

export { FormSection };
