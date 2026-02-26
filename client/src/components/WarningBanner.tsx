/**
 * WarningBanner Component - Figma Design
 *
 * A specialized banner component for displaying critical warnings
 * with distinctive orange/red styling matching the Figma design.
 */
import * as React from "react";

interface WarningBannerProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  compact?: boolean;
  secondaryAction?: React.ReactNode;
}

export function WarningBanner({
  children,
  title,
  className,
  compact = false,
  secondaryAction,
}: WarningBannerProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: 24,
        padding: compact ? "12px 16px" : "20px 25px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="flex gap-3">
        {/* Warning icon */}
        <span style={{ flexShrink: 0, color: "#ef4444" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </span>
        <div style={{ flex: 1 }}>
          {title && (
            <p
              style={{
                color: "#fca5a5",
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                marginBottom: 8,
                margin: 0,
              }}
            >
              {title}
            </p>
          )}
          <p
            style={{
              color: "#94a3b8",
              fontFamily: "'Public Sans', sans-serif",
              fontSize: 14,
              lineHeight: 1.5,
              margin: title ? "8px 0 0 0" : 0,
            }}
          >
            {children}
          </p>
          {secondaryAction && (
            <div style={{ marginTop: 12 }}>
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WarningBanner;
