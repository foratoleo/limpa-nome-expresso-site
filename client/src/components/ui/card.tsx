import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Card Variants ─────────────────────────────────────────────────────────────
type CardVariant = "default" | "elevated" | "outlined" | "filled";
type CardPadding = "none" | "compact" | "default" | "spacious";

interface CardBaseProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children?: React.ReactNode;
}

// ─── Card Component ────────────────────────────────────────────────────────────
// Note: Using native div elements with Tailwind for backward compatibility.
// @atlaskit/primitives Box doesn't support className prop which is required
// for the existing Tailwind-based styling system.
// Future migration: Replace with @atlaskit/box when moving fully to Atlassian tokens.
function Card({
  className,
  variant = "default",
  padding = "default",
  ...props
}: React.ComponentProps<"div"> & CardBaseProps) {
  const paddingMap: Record<CardPadding, string> = {
    none: "p-0",
    compact: "p-4",
    default: "py-6",
    spacious: "p-8",
  };

  const variantStyles: Record<CardVariant, string> = {
    default: "bg-card text-card-foreground border shadow-sm",
    elevated: "bg-card text-card-foreground shadow-lg",
    outlined: "bg-card text-card-foreground border-2",
    filled: "bg-muted text-muted-foreground",
  };

  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        "flex flex-col gap-6 rounded-xl",
        variantStyles[variant],
        paddingMap[padding],
        className
      )}
      {...props}
    />
  );
}

// ─── Card Header ───────────────────────────────────────────────────────────────
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

// ─── Card Title ────────────────────────────────────────────────────────────────
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

// ─── Card Description ──────────────────────────────────────────────────────────
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// ─── Card Action ───────────────────────────────────────────────────────────────
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

// ─── Card Content ──────────────────────────────────────────────────────────────
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

// ─── Card Footer ───────────────────────────────────────────────────────────────
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

// Export types for external use
export type { CardBaseProps, CardVariant, CardPadding };
