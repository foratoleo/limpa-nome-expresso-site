/**
 * Alert Component - Refactored with @atlaskit/banner
 *
 * This component provides a consistent alert system that integrates
 * with the Atlassian Design System while maintaining backward
 * compatibility with the existing shadcn/ui API.
 *
 * @see https://atlassian.design/components/banner
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Map legacy alert variants to semantic colors
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        warning: "bg-warning/10 border-warning/30 text-warning-foreground",
        success: "bg-success/10 border-success/30 text-success-foreground",
        info: "bg-info/10 border-info/30 text-info-foreground",
        tip: "bg-[#D4A017]/10 border-[#D4A017]/30 text-[#D4A017]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Atlaskit Banner appearance mapping
type BannerAppearance = "default" | "warning" | "error" | "success" | "information";

function getBannerAppearance(variant: string | null | undefined): BannerAppearance {
  switch (variant) {
    case "destructive":
      return "error";
    case "warning":
      return "warning";
    case "success":
      return "success";
    case "info":
    case "tip":
      return "information";
    default:
      return "default";
  }
}

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  /**
   * Icon to display at the start of the alert
   */
  icon?: React.ReactElement;
  /**
   * Secondary action button
   */
  secondaryAction?: React.ReactNode;
}

/**
 * Alert component with styling variants for different message types.
 * Can be used with @atlaskit/banner by importing Banner directly.
 */
function Alert({
  className,
  variant,
  icon,
  secondaryAction,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <div className="contents">
        {children}
        {secondaryAction && <div className="mt-2">{secondaryAction}</div>}
      </div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants, getBannerAppearance };
export type { AlertProps, BannerAppearance };
