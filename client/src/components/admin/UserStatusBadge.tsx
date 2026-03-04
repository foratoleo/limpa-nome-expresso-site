/**
 * UserStatusBadge Component
 *
 * Color-coded status badge component for displaying user access status.
 * Supports different status types with distinct colors and icons:
 *
 * - active (green with checkmark): User has active payment access
 * - pending (yellow with clock): Payment pending or processing
 * - expired (red with X): Access has expired
 * - manual (blue with shield): Manual access granted by admin
 * - free (gray): No access, free tier user
 *
 * @example
 * ```tsx
 * <UserStatusBadge status="active" />
 * <UserStatusBadge status="manual" />
 * <UserStatusBadge status="expired" />
 * ```
 */

import { Badge, badgeVariants } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Shield, User } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User access status types
 */
export type UserStatus = "active" | "pending" | "expired" | "manual" | "free";

/**
 * Props for UserStatusBadge component
 */
export interface UserStatusBadgeProps {
  /** The status to display */
  status: UserStatus;
}

// ============================================================================
// Status Configuration
// ============================================================================

/**
 * Configuration for each status type
 * Maps status to badge variant, icon, label, and custom colors
 */
type StatusConfig = {
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  label: string;
  className: string;
};

const statusConfig: Record<UserStatus, StatusConfig> = {
  active: {
    variant: "default",
    icon: <CheckCircle size={12} />,
    label: "Ativo",
    className: "bg-green-500 text-white border-green-500 hover:bg-green-600",
  },
  pending: {
    variant: "secondary",
    icon: <Clock size={12} />,
    label: "Pendente",
    className: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600",
  },
  expired: {
    variant: "destructive",
    icon: <XCircle size={12} />,
    label: "Expirado",
    className: "", // Destructive variant provides red color
  },
  manual: {
    variant: "outline",
    icon: <Shield size={12} />,
    label: "Manual",
    className: "border-blue-500 text-blue-500 hover:bg-blue-50",
  },
  free: {
    variant: "secondary",
    icon: <User size={12} />,
    label: "Grátis",
    className: "bg-gray-500 text-white border-gray-500 hover:bg-gray-600",
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * UserStatusBadge component displays a color-coded badge with icon
 * representing a user's access status.
 *
 * @param props - Component props
 * @returns JSX element
 */
export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status];
  const { variant, icon, label, className } = config;

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {label}
    </Badge>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default UserStatusBadge;
