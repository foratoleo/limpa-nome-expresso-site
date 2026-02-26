import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
 * CONTAINER COMPONENT - Atlassian Grid System Integration
 * =============================================================================
 *
 * This component provides layout utilities using Atlassian grid tokens for
 * consistent layout patterns across the application.
 *
 * MIGRATION GUIDE:
 * - Container: Use for centered, max-width constrained content
 * - GridContainer: Use for multi-column layouts with Atlassian grid
 * - GridColumn: Use within GridContainer for responsive columns
 *
 * USAGE EXAMPLES:
 *
 * // Basic centered container (replaces Tailwind .container)
 * <Container>
 *   <p>Your content here</p>
 * </Container>
 *
 * // With custom max-width
 * <Container maxWidth="lg">
 *   <p>Narrower content</p>
 * </Container>
 *
 * // Responsive grid layout
 * <GridContainer columns={{ xs: 1, md: 2, lg: 3 }}>
 *   <GridColumn><Card /></GridColumn>
 *   <GridColumn><Card /></GridColumn>
 *   <GridColumn><Card /></GridColumn>
 * </GridContainer>
 *
 * TOKENS USED:
 * - --space.* for padding and gaps (Atlassian 8px grid)
 * - --color.background.default for background fallback
 * - --grid.* tokens defined in index.css
 * =============================================================================
 */

// ─── Types ────────────────────────────────────────────────────────────────────
type ContainerMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "prose";

interface ContainerBaseProps {
  children: React.ReactNode;
  className?: string;
  /** HTML element to render */
  as?: "div" | "section" | "article" | "main" | "aside" | "header" | "footer";
}

interface ContainerProps extends ContainerBaseProps {
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth;
  /** Horizontal padding (uses Atlassian spacing tokens) */
  padding?: "none" | "compact" | "default" | "spacious";
  /** Center the container */
  centered?: boolean;
}

interface GridContainerProps extends ContainerBaseProps {
  /** Number of columns at different breakpoints */
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between grid items (uses Atlassian spacing tokens) */
  gap?: "none" | "compact" | "default" | "spacious";
  /** Maximum width of the grid container */
  maxWidth?: ContainerMaxWidth;
}

interface GridColumnProps {
  children: React.ReactNode;
  className?: string;
  /** Column span at different breakpoints */
  span?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Start position at different breakpoints */
  start?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_WIDTH_MAP: Record<ContainerMaxWidth, string> = {
  sm: "640px",    // Small screens
  md: "768px",    // Medium screens / tablets
  lg: "1024px",   // Large screens / laptops
  xl: "1280px",   // Extra large screens (default for main content)
  "2xl": "1536px", // Ultra-wide screens
  full: "100%",   // Full width
  prose: "768px", // Optimal reading width (~65 characters)
};

const PADDING_MAP: Record<"none" | "compact" | "default" | "spacious", string> = {
  none: "px-0",
  compact: "px-4",       // 16px
  default: "px-4 md:px-6 lg:px-8", // 16px -> 24px -> 32px
  spacious: "px-6 md:px-8 lg:px-10", // 24px -> 32px -> 40px
};

const GAP_MAP: Record<"none" | "compact" | "default" | "spacious", string> = {
  none: "gap-0",
  compact: "gap-3",   // 12px - matches the original gap-3 in DownloadsSection
  default: "gap-4",   // 16px
  spacious: "gap-6",  // 24px
};

// ─── Container Component ──────────────────────────────────────────────────────
/**
 * A centered container component with max-width constraints.
 *
 * Replaces the Tailwind .container utility with Atlassian-inspired tokens.
 * Provides consistent padding and max-width for content sections.
 */
function Container({
  children,
  className,
  maxWidth = "xl",
  padding = "default",
  centered = true,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full",
        centered && "mx-auto",
        PADDING_MAP[padding],
        className
      )}
      style={{
        maxWidth: MAX_WIDTH_MAP[maxWidth],
      }}
    >
      {children}
    </Component>
  );
}

// ─── Grid Container Component ─────────────────────────────────────────────────
/**
 * A responsive grid container using CSS Grid.
 *
 * Integrates with Atlassian grid tokens for consistent spacing and alignment.
 * Use GridColumn children for individual grid items.
 */
function GridContainer({
  children,
  className,
  columns = { xs: 1, md: 2, lg: 3 },
  gap = "default",
  maxWidth = "xl",
  as: Component = "div",
}: GridContainerProps) {
  // Build responsive grid template columns
  const getGridColumns = () => {
    const baseColumns = columns.xs || 1;
    let gridClass = `grid-cols-${baseColumns}`;

    if (columns.sm) gridClass += ` sm:grid-cols-${columns.sm}`;
    if (columns.md) gridClass += ` md:grid-cols-${columns.md}`;
    if (columns.lg) gridClass += ` lg:grid-cols-${columns.lg}`;
    if (columns.xl) gridClass += ` xl:grid-cols-${columns.xl}`;

    return gridClass;
  };

  return (
    <Component
      className={cn(
        "grid",
        getGridColumns(),
        GAP_MAP[gap],
        "mx-auto",
        PADDING_MAP.default,
        className
      )}
      style={{
        maxWidth: MAX_WIDTH_MAP[maxWidth],
      }}
    >
      {children}
    </Component>
  );
}

// ─── Grid Column Component ────────────────────────────────────────────────────
/**
 * A grid column component for use within GridContainer.
 *
 * Supports responsive column spanning and positioning.
 */
function GridColumn({
  children,
  className,
  span,
  start,
}: GridColumnProps) {
  // Build span classes
  const getSpanClasses = () => {
    if (!span) return "";
    const classes: string[] = [];
    if (span.xs) classes.push(`col-span-${span.xs}`);
    if (span.sm) classes.push(`sm:col-span-${span.sm}`);
    if (span.md) classes.push(`md:col-span-${span.md}`);
    if (span.lg) classes.push(`lg:col-span-${span.lg}`);
    if (span.xl) classes.push(`xl:col-span-${span.xl}`);
    return classes.join(" ");
  };

  // Build start classes
  const getStartClasses = () => {
    if (!start) return "";
    const classes: string[] = [];
    if (start.xs) classes.push(`col-start-${start.xs}`);
    if (start.sm) classes.push(`sm:col-start-${start.sm}`);
    if (start.md) classes.push(`md:col-start-${start.md}`);
    if (start.lg) classes.push(`lg:col-start-${start.lg}`);
    if (start.xl) classes.push(`xl:col-start-${start.xl}`);
    return classes.join(" ");
  };

  return (
    <div className={cn(getSpanClasses(), getStartClasses(), className)}>
      {children}
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  Container,
  GridContainer,
  GridColumn,
};

// Export types
export type {
  ContainerProps,
  GridContainerProps,
  GridColumnProps,
  ContainerMaxWidth,
};
