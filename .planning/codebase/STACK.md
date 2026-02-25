# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- TypeScript 5.6.3 - All client and server code
- JavaScript/JSX - React components and configuration files
- CSS - Tailwind CSS v4 with custom theme variables

**Secondary:**
- Markdown - Documentation files in `/client/public/docs/`

## Runtime

**Environment:**
- Node.js (via `@types/node@^24.7.0`) - Server runtime

**Package Manager:**
- pnpm 10.4.1 - Fast, disk-efficient package manager
- Lockfile: `pnpm-lock.yaml` (present)
- Overrides: `tailwindcss>nanoid: 3.3.7`
- Patched: `wouter@3.7.1` (patch in `/patches/wouter@3.7.1.patch`)

## Frameworks

**Core:**
- React 19.2.1 - UI library with concurrent features
- Vite 7.1.7 - Build tool and dev server
- Express 4.21.2 - Server-side routing and static file serving
- Wouter 3.3.5 - Client-side routing (lightweight alternative to React Router)

**UI Components:**
- shadcn/ui - Component library based on Radix UI primitives
- Radix UI (multiple packages) - Unstyled, accessible component primitives
  - @radix-ui/react-accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toggle, toggle-group, tooltip
- Framer Motion 12.23.22 - Animation library
- Lucide React 0.453.0 - Icon library

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework with Vite plugin
- @tailwindcss/vite 4.1.3 - Vite plugin for Tailwind CSS v4
- tailwindcss-animate 1.0.7 - Animation utilities
- tw-animate-css 1.4.0 - Additional animation utilities
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.3.1 - Merge Tailwind classes without conflicts

**Testing:**
- Vitest 2.1.4 - Unit testing framework (configured but may not be in active use)

**Build/Dev:**
- esbuild 0.25.0 - Server code bundling
- tsx 4.19.1 - TypeScript execution for development
- TypeScript 5.6.3 - Static type checking
- @vitejs/plugin-react 5.0.4 - Vite plugin for React
- Prettier 3.6.2 - Code formatting

## Key Dependencies

**Critical:**
- react-hook-form 7.64.0 - Form state management and validation
- @hookform/resolvers 5.2.2 - Validation schema integration
- zod 4.1.12 - Schema validation and TypeScript inference
- next-themes 0.4.6 - Theme switching (dark/light mode)
- sonner 2.0.7 - Toast notifications
- axios 1.12.0 - HTTP client (imported but may not be actively used)

**Infrastructure:**
- vite-plugin-manus-runtime 0.0.57 - Manus AI runtime integration
- @builder.io/vite-plugin-jsx-loc 0.1.1 - JSX location tracking for debugging
- input-otp 1.4.2 - One-time password input component
- cmdk 1.1.1 - Command palette component
- vaul 1.1.2 - Drawer/sheet component
- embla-carousel-react 8.6.0 - Carousel component
- react-resizable-panels 3.0.6 - Resizable layout panels
- react-day-picker 9.11.1 - Date picker component
- recharts 2.15.2 - Chart components
- streamdown 1.4.0 - Streaming markdown renderer

## Configuration

**Environment:**
- No .env files detected in codebase (all env vars use import.meta.env)
- Vite environment variables: `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`

**Build:**
- `vite.config.ts` - Main build configuration with custom plugins
- `tsconfig.json` - TypeScript configuration with path aliases (@/*, @shared/*)
- `tsconfig.node.json` - TypeScript config for Node.js environment
- `components.json` - shadcn/ui component configuration
- `.prettierrc` - Code formatting rules (semi: true, singleQuote: false, printWidth: 80)

## Platform Requirements

**Development:**
- Node.js with ES modules support
- pnpm 10.4.1+ (package manager)
- Modern browser with React 19 support

**Production:**
- Static site deployment (build output to `/dist/public`)
- Node.js server for Express backend (optional for SPA-only deployment)
- PORT environment variable for server port (default: 3000)

---

*Stack analysis: 2026-02-25*
