/**
 * LinkButton Component - Figma Design
 *
 * A button-styled link component for external URLs with blue accent styling.
 */
import * as React from "react";
import { LinkExternalIcon } from "@/utils/icons";

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string;
  label: string;
  openInNewTab?: boolean;
  showIcon?: boolean;
  variant?: "primary" | "secondary" | "default";
}

export function LinkButton({
  url,
  label,
  openInNewTab = true,
  showIcon = true,
  variant = "default",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      href={url}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 transition-all duration-200 ${className}`}
      style={{
        color: "#60a5fa",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: 600,
        fontSize: 14,
      }}
      aria-label={label}
      {...props}
    >
      {children || label}
      {showIcon && (
        <span style={{ opacity: 0.8 }}>
          <LinkExternalIcon size="small" label="" />
        </span>
      )}
    </a>
  );
}

export function LinkButtonCompact({
  url,
  label,
  openInNewTab = true,
  className = "",
}: Pick<LinkButtonProps, "url" | "label" | "openInNewTab" | "className">) {
  return (
    <a
      href={url}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-1 transition-colors ${className}`}
      style={{
        color: "#60a5fa",
        fontFamily: "'Public Sans', sans-serif",
        fontSize: 14,
      }}
    >
      {label}
      <LinkExternalIcon size="small" label="" />
    </a>
  );
}

export default LinkButton;
