import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Progress Component - Custom implementation following Atlassian Design System patterns
 *
 * This component provides a linear progress bar that follows the Atlassian Design
 * System visual language while maintaining compatibility with React 19.
 *
 * @see https://atlassian.design/components/progress-indicator
 */

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  /** Optional aria label for accessibility */
  ariaLabel?: string;
  /** Whether to show the progress as indeterminate */
  isIndeterminate?: boolean;
  /** Color of the progress indicator */
  indicatorColor?: string;
  /** Background color of the track */
  trackColor?: string;
}

function Progress({
  className,
  value = 0,
  ariaLabel = "Progress",
  isIndeterminate = false,
  indicatorColor,
  trackColor,
  ...props
}: ProgressProps) {
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={{ backgroundColor: trackColor || "var(--ds-background-neutral, rgba(0,0,0,0.1))" }}
      {...props}
    >
      {isIndeterminate ? (
        <div
          data-slot="progress-indicator"
          className="h-full w-full animate-pulse"
          style={{
            backgroundColor: indicatorColor || "var(--ds-background-brand-bold, #0052CC)",
          }}
        />
      ) : (
        <div
          data-slot="progress-indicator"
          className="h-full transition-all duration-300 ease-in-out"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: indicatorColor || "var(--ds-background-brand-bold, #0052CC)",
          }}
        />
      )}
    </div>
  );
}

export { Progress };
export type { ProgressProps };
