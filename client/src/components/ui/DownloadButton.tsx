/**
 * DownloadButton Component - Figma Design
 *
 * A button component for triggering file downloads with gold accent styling.
 */
import * as React from "react";
import { DownloadIcon } from "@/utils/icons";

export interface DownloadButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  file: string;
  label: string;
  description?: string;
  variant?: "primary" | "secondary" | "default";
  size?: "sm" | "md" | "lg";
}

export function DownloadButton({
  file,
  label,
  description,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: DownloadButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <a
      href={file}
      download
      className={`flex items-center gap-2 transition-all duration-200 ${className}`}
      style={{
        backgroundColor: isPrimary ? "#d39e17" : "transparent",
        color: isPrimary ? "#12110d" : "#d39e17",
        padding: size === "sm" ? "8px 16px" : size === "lg" ? "12px 24px" : "8px 16px",
        borderRadius: 16,
        fontWeight: 700,
        fontSize: 14,
        fontFamily: "'Public Sans', sans-serif",
        boxShadow: isPrimary ? "0 0 20px rgba(211, 158, 23, 0.3)" : "none",
        border: isPrimary ? "none" : "1px solid rgba(211, 158, 23, 0.3)",
      }}
      onMouseEnter={(e) => {
        if (isPrimary) {
          e.currentTarget.style.boxShadow = "0 0 30px rgba(211, 158, 23, 0.5)";
        } else {
          e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(211, 158, 23, 0.3)";
        } else {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
      aria-label={`Download ${label}`}
      {...props}
    >
      <DownloadIcon size="small" label="" />
      <span>{children || label}</span>
    </a>
  );
}

export interface DownloadCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  file: string;
  badge: string;
  badgeColor: string;
  className?: string;
}

export function DownloadCard({
  icon,
  title,
  description,
  file,
  badge,
  badgeColor,
  className = "",
}: DownloadCardProps) {
  return (
    <a
      href={file}
      download
      className={`flex flex-col gap-2 p-4 rounded-2xl transition-all duration-200 group ${className}`}
      style={{
        backgroundColor: "rgba(18, 17, 13, 0.6)",
        border: "1px solid rgba(211, 158, 23, 0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.4)";
        e.currentTarget.style.backgroundColor = "rgba(18, 17, 13, 0.8)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)";
        e.currentTarget.style.backgroundColor = "rgba(18, 17, 13, 0.6)";
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: badgeColor }}>{icon}</span>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
            fontFamily: "'Public Sans', sans-serif",
          }}
        >
          {badge}
        </span>
      </div>
      <div
        className="font-semibold leading-snug transition-colors"
        style={{
          color: "#e8e4d8",
          fontSize: 14,
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        {title}
      </div>
      <div
        className="text-xs leading-relaxed"
        style={{
          color: "#64748b",
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        {description}
      </div>
      <div
        className="flex items-center gap-2 text-xs font-medium mt-auto pt-1"
        style={{
          color: "#d39e17",
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        <DownloadIcon size="small" label="" />
        Baixar documento
      </div>
    </a>
  );
}

export default DownloadButton;
