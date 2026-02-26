/**
 * TipBanner Component - Figma Design
 *
 * A specialized banner component for displaying tips and helpful hints
 * within StepCard components. Matches the Figma design with gold left border.
 */
import * as React from "react";

interface TipBannerProps {
  children: React.ReactNode;
  icon?: React.ReactElement;
  className?: string;
  compact?: boolean;
}

export function TipBanner({
  children,
  className,
  compact = false,
}: TipBannerProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "rgba(211, 158, 23, 0.1)",
        borderLeft: "4px solid #d39e17",
        borderRadius: "0 16px 16px 0",
        padding: compact ? "12px 16px" : "16px 20px",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        {/* Lightbulb icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 15h-4v-1h4v1zm0-2h-4v-1h4v1zm-1.5-5.59V14h-1v-2.59l-2.5-2.5.71-.71L12 10.5l2.29-2.29.71.71-2.5 2.49z"
            fill="#d39e17"
          />
        </svg>
        <span
          className="font-bold uppercase tracking-wide"
          style={{
            color: "#d39e17",
            fontSize: 12,
          }}
        >
          Dica Pro
        </span>
      </div>
      <p
        style={{
          color: "rgba(232, 228, 216, 0.9)",
          fontFamily: "'Public Sans', sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

export default TipBanner;
