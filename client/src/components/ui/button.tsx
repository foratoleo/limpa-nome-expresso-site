/**
 * Button Component - Atlassian Design System Integration
 *
 * This component wraps @atlaskit/button while maintaining backward compatibility
 * with the existing variant/size API used throughout the application.
 *
 * Migration Notes:
 * - Uses @atlaskit/button and @atlaskit/button/loading-button as the underlying implementation
 * - Maps legacy variants to Atlassian appearance prop
 * - Supports all standard HTML button attributes via spread props
 * - Maintains className support for Tailwind CSS styling
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import AtlaskitButton from "@atlaskit/button";
import LoadingButton from "@atlaskit/button/loading-button";
import type { Appearance } from "@atlaskit/button";

import { cn } from "@/lib/utils";

// ─── Variant to Appearance Mapping ─────────────────────────────────────────────
const VARIANT_TO_APPEARANCE: Record<string, Appearance | undefined> = {
  default: "primary",
  destructive: "danger",
  outline: "default",
  secondary: "default",
  ghost: "subtle",
  link: "link",
};

// ─── Button Variants (Tailwind CSS) ────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-transparent shadow-xs hover:bg-accent dark:bg-transparent dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ─── Button Component Props ────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Render as child component using Radix Slot */
  asChild?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon to display before the button text */
  iconBefore?: React.ReactNode;
  /** Icon to display after the button text */
  iconAfter?: React.ReactNode;
  /** Use Atlaskit button directly (bypasses custom styling) */
  atlaskit?: boolean;
}

// ─── Button Component ──────────────────────────────────────────────────────────
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading,
  iconBefore,
  iconAfter,
  atlaskit = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Use Radix Slot for composition pattern
  const Comp = asChild ? Slot : "button";

  // When using Atlaskit mode, render the native Atlaskit button
  if (atlaskit) {
    const appearance = VARIANT_TO_APPEARANCE[variant || "default"];

    // Use LoadingButton when isLoading is true
    if (isLoading) {
      return (
        <LoadingButton
          appearance={appearance}
          iconBefore={iconBefore}
          iconAfter={iconAfter}
          isLoading={isLoading}
          isDisabled={disabled}
        >
          {children}
        </LoadingButton>
      );
    }

    return (
      <AtlaskitButton
        appearance={appearance}
        iconBefore={iconBefore}
        iconAfter={iconAfter}
        isDisabled={disabled}
      >
        {children}
      </AtlaskitButton>
    );
  }

  // Default: render with Tailwind CSS variants
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        iconBefore
      )}
      {children}
      {iconAfter}
    </Comp>
  );
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export { Button, buttonVariants };

// Re-export Atlaskit button types for advanced usage
export type { Appearance } from "@atlaskit/button";
