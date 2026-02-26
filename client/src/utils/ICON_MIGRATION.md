# Icon System Migration Guide

This document describes the icon mapping between `lucide-react` and `@atlaskit/icon` for the Limpa Nome Expresso project.

## Overview

The project is migrating from `lucide-react` icons to `@atlaskit/icon` where equivalent icons are available. This migration is part of the broader Atlassian Design System adoption.

## Icon Mapping Table

| lucide-react     | @atlaskit/icon (core)     | Status          | Notes                           |
|------------------|---------------------------|-----------------|---------------------------------|
| `CheckCircle2`   | `CheckCircleIcon`         | Migrated        | Direct equivalent               |
| `Circle`         | `CheckCircleUncheckedIcon`| Migrated        | Unchecked state equivalent      |
| `Download`       | `DownloadIcon`            | Migrated        | Direct equivalent               |
| `ChevronDown`    | `ChevronDownIcon`         | Migrated        | Direct equivalent               |
| `AlertTriangle`  | `WarningIcon`             | Migrated        | Direct equivalent               |
| `ArrowRight`     | `ArrowRightIcon`          | Migrated        | Direct equivalent               |
| `ExternalLink`   | `LinkExternalIcon`        | Migrated        | Direct equivalent               |
| `BookOpen`       | `BookWithBookmarkIcon`    | Migrated        | Closest match                   |
| `ClipboardList`  | `TaskIcon`                | Migrated        | Closest match (checklist/task)  |
| `Scale`          | `ScalesIcon`              | Migrated        | Direct equivalent (legal theme) |
| `FileText`       | `FileIcon`                | Migrated        | Closest match                   |
| `Video`          | `VideoIcon`               | Migrated        | Direct equivalent               |
| `Shield`         | `ShieldIcon`              | Migrated        | Direct equivalent               |

## Usage

### Import Icons

Replace lucide-react imports with the icons utility:

```typescript
// Before (lucide-react)
import { CheckCircle2, Download, AlertTriangle } from "lucide-react";

// After (@atlaskit/icon via utility)
import { CheckCircleIcon, DownloadIcon, WarningIcon } from "@/utils/icons";
```

### Icon Sizes

@atlaskit/icon uses string-based size props instead of numeric values:

| Size Prop | Pixel Size | lucide-react Equivalent |
|-----------|------------|------------------------|
| `"small"` | 16px       | `size={16}` or `size={18}` |
| `"medium"`| 20px       | `size={20}` or `size={22}` |
| `"large"` | 24px       | `size={24}`             |

### Styling Icons

@atlaskit/icon core icons do not accept `className` prop. For custom styling, wrap the icon in a span:

```typescript
// Before (lucide-react)
<Download size={16} className="text-gold flex-shrink-0" />

// After (@atlaskit/icon)
<span className="text-gold flex-shrink-0">
  <DownloadIcon size="small" label="" />
</span>
```

### Label Prop

All @atlaskit/icon components require a `label` prop for accessibility:

- **Decorative icons**: Use `label=""` (empty string)
- **Meaningful icons**: Provide descriptive label, e.g., `label="Download document"`

## File Locations

- Icon mapping utility: `client/src/utils/icons.ts`
- This documentation: `client/src/utils/ICON_MIGRATION.md`
- Reference implementation: `client/src/pages/Home.tsx`

## Size Conversion Utility

A helper function is available for converting numeric sizes:

```typescript
import { toAtlaskitSize } from "@/utils/icons";

const atlaskitSize = toAtlaskitSize(18); // Returns "small"
```

## Notes

- The @atlaskit/icon package has peer dependency on React 18.2.0, but works with React 19.2.1
- All icons inherit color from their parent element via `currentColor`
- For animated icons (like rotation), apply the animation to the wrapper span

## Components Updated

- [x] Home.tsx - Full migration complete
- [ ] StepCard.tsx - To be extracted and migrated (future task)
- [ ] DownloadsSection.tsx - To be extracted and migrated (future task)
- [ ] TipBanner.tsx - To be created (future task)
- [ ] WarningBanner.tsx - To be created (future task)
