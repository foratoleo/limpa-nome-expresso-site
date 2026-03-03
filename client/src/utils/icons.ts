/**
 * Icon Mapping Utility
 *
 * This utility maps lucide-react icons to @atlaskit/icon equivalents where available.
 * Icons not available in @atlaskit/icon fall back to lucide-react.
 *
 * Migration Guide:
 * - Replace `import { IconName } from "lucide-react"` with `import { IconName } from "@/utils/icons"`
 * - Icons from @atlaskit/icon use the `size` prop ("small", "medium", "large", "xlarge")
 * - Icons from lucide-react use numeric `size` prop (default: 24)
 *
 * @atlaskit/icon sizes:
 * - "small": 16px
 * - "medium": 20px (default)
 * - "large": 24px
 * - "xlarge": 32px
 *
 * Icon Mapping Table:
 * | lucide-react     | @atlaskit/icon        | Notes                         |
 * |------------------|----------------------|-------------------------------|
 * | CheckCircle2     | CheckCircleIcon      | Direct equivalent             |
 * | Circle           | CheckCircleUnchecked | Unchecked state               |
 * | Download         | DownloadIcon         | Direct equivalent             |
 * | ChevronDown      | ChevronDownIcon      | Direct equivalent             |
 * | AlertTriangle    | WarningIcon          | Direct equivalent             |
 * | ArrowRight       | ArrowRightIcon       | Direct equivalent             |
 * | ExternalLink     | LinkExternalIcon     | Direct equivalent             |
 * | BookOpen         | BookWithBookmarkIcon | Closest match                 |
 * | ClipboardList    | TaskIcon             | Closest match (checklist)     |
 * | Scale            | ScalesIcon           | Direct equivalent (legal)     |
 * | FileText         | FileIcon             | Closest match                 |
 * | Video            | VideoIcon            | Direct equivalent             |
 * | Shield           | ShieldIcon           | Direct equivalent             |
 */

// ============================================================================
// @atlaskit/icon Imports (Core Icons)
// ============================================================================
// These are default exports from @atlaskit/icon/core/* modules

export { default as CheckCircleIcon } from "@atlaskit/icon/core/check-circle";
export { default as CheckCircleUncheckedIcon } from "@atlaskit/icon/core/check-circle-unchecked";
export { default as DownloadIcon } from "@atlaskit/icon/core/download";
export { default as ChevronDownIcon } from "@atlaskit/icon/core/chevron-down";
export { default as WarningIcon } from "@atlaskit/icon/core/warning";
export { default as ArrowRightIcon } from "@atlaskit/icon/core/arrow-right";
export { default as LinkExternalIcon } from "@atlaskit/icon/core/link-external";
export { default as BookWithBookmarkIcon } from "@atlaskit/icon/core/book-with-bookmark";
export { default as TaskIcon } from "@atlaskit/icon/core/task";
export { default as ScalesIcon } from "@atlaskit/icon/core/scales";
export { default as FileIcon } from "@atlaskit/icon/core/file";
export { default as VideoIcon } from "@atlaskit/icon/core/video";
export { default as ShieldIcon } from "@atlaskit/icon/core/shield";
export { default as SearchIcon } from "@atlaskit/icon/core/search";
export { default as CrossIcon } from "@atlaskit/icon/core/cross";
export { default as ChevronRightIcon } from "@atlaskit/icon/core/chevron-right";
export { default as TrashIcon } from "@atlaskit/icon/core/delete";
export { default as AddCircleIcon } from "@atlaskit/icon/core/add";

// Aliases for convenience (proper re-export pattern for default exports)
import BookWithBookmarkIconAlias from "@atlaskit/icon/core/book-with-bookmark";
import CrossIconAlias from "@atlaskit/icon/core/cross";
export { BookWithBookmarkIconAlias as BookOpenIcon, CrossIconAlias as XIcon };

// ============================================================================
// lucide-react Imports (Fallback for unavailable @atlaskit equivalents)
// ============================================================================
// These icons are kept from lucide-react where no suitable @atlaskit equivalent exists
// or where the visual difference is significant for the use case

// Note: ExternalLink, Scale, FileText, Video, Shield are now available in @atlaskit/icon
// but we may keep lucide-react versions for specific styling needs
// Re-export for backward compatibility during migration

// ============================================================================
// Type Exports
// ============================================================================

export type { NewCoreIconProps as AtlaskitIconProps } from "@atlaskit/icon";

// ============================================================================
// Size Constants
// ============================================================================
// Mapping between lucide-react numeric sizes and @atlaskit/icon size strings

export const ICON_SIZE_MAP = {
  // lucide size -> @atlaskit size
  16: "small" as const,
  18: "small" as const,
  20: "medium" as const,
  22: "medium" as const,
  24: "large" as const,
  32: "xlarge" as const,
} as const;

export type AtlaskitIconSize = "small" | "medium" | "large" | "xlarge";

/**
 * Convert lucide-react numeric size to @atlaskit/icon size string
 */
export function toAtlaskitSize(lucideSize: number): AtlaskitIconSize {
  const closestSize = Object.keys(ICON_SIZE_MAP)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - lucideSize) < Math.abs(prev - lucideSize) ? curr : prev
    );
  return ICON_SIZE_MAP[closestSize as keyof typeof ICON_SIZE_MAP];
}
