# Codebase Structure

**Analysis Date:** 2026-02-25

## Directory Layout

```
mogadishu/
├── client/                  # Frontend application (React + Vite)
│   ├── public/             # Static assets served directly
│   │   ├── docs/           # Downloadable legal documents (.md files)
│   │   └── __manus__/      # Manus-specific debug scripts
│   └── src/                # Client source code
├── server/                 # Backend server (Express)
├── shared/                 # Code shared between client and server
├── .planning/              # Planning documents and codebase analysis
├── .dr_ai/                 # DR_AI framework artifacts
├── node_modules/           # Dependencies (pnpm)
├── patches/                # Package patches for pnpm
└── [config files]          # Root-level configuration
```

## Directory Purposes

**client/:**
- Purpose: Frontend React application source code and assets
- Contains: React components, pages, hooks, contexts, UI library, styles
- Key files: `src/main.tsx`, `src/App.tsx`, `src/pages/Home.tsx`, `index.html`

**client/src/:**
- Purpose: Application source code (TypeScript/TSX)
- Contains: Components, pages, contexts, hooks, utilities, styles
- Key files: `App.tsx`, `main.tsx`, `pages/Home.tsx`, `components/ui/*.tsx`

**client/src/components/:**
- Purpose: Reusable React components
- Contains: Application-specific components (`ErrorBoundary.tsx`, `Map.tsx`, `ManusDialog.tsx`)
- Key files: `ErrorBoundary.tsx` for error handling

**client/src/components/ui/:**
- Purpose: shadcn/ui design system components (Radix UI primitives)
- Contains: 50+ UI components (button, card, dialog, form, etc.)
- Pattern: Headless UI with Tailwind styling, CVA variants

**client/src/pages/:**
- Purpose: Page-level route components
- Contains: `Home.tsx` (main checklist page), `NotFound.tsx` (404 page)
- Pattern: Each route corresponds to a page component

**client/src/contexts/:**
- Purpose: React Context providers for global state
- Contains: `ThemeContext.tsx` for theme management
- Pattern: Context + Provider component + custom hook

**client/src/hooks/:**
- Purpose: Custom React hooks
- Contains: `useMobile.tsx`, `usePersistFn.ts`, `useComposition.ts`
- Pattern: Reusable stateful logic

**client/src/lib/:**
- Purpose: Utility functions and helpers
- Contains: `utils.ts` (cn function for class merging)
- Pattern: Pure functions without side effects

**client/public/:**
- Purpose: Static assets served at root URL
- Contains: `docs/` (downloadable documents), `__manus__/` (debug collector)
- Key files: `index.html`, `docs/*.md`

**server/:**
- Purpose: Production Express server for serving static files
- Contains: `index.ts` (server entry point)
- Pattern: Simple static file server with SPA fallback

**shared/:**
- Purpose: Constants/types shared between client and server
- Contains: `const.ts` (COOKIE_NAME, ONE_YEAR_MS)
- Pattern: ESM exports consumed by both client and server via `@shared` alias

## Key File Locations

**Entry Points:**
- `client/src/main.tsx`: React application bootstrap
- `client/src/App.tsx`: Root component with routing and providers
- `server/index.ts`: Express server entry point
- `client/index.html`: HTML template with root element

**Configuration:**
- `vite.config.ts`: Vite build configuration with plugins and path aliases
- `tsconfig.json`: TypeScript configuration with path aliases
- `package.json`: Dependencies and scripts
- `components.json`: shadcn/ui configuration
- `client/src/index.css`: Global styles and Tailwind theme

**Core Logic:**
- `client/src/pages/Home.tsx`: Main checklist functionality (523 lines)
- `client/src/contexts/ThemeContext.tsx`: Theme management
- `client/src/lib/utils.ts`: Utility functions (cn helper)

**Testing:**
- Not detected - no test files found in codebase

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ErrorBoundary.tsx`, `StepCard` in `Home.tsx`)
- Pages: PascalCase (e.g., `Home.tsx`, `NotFound.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMobile.tsx`, `usePersistFn.ts`)
- Utilities: camelCase (e.g., `utils.ts`)
- Contexts: PascalCase with `Context` suffix (e.g., `ThemeContext.tsx`)
- UI components: lowercase-kebab-case (e.g., `button.tsx`, `alert-dialog.tsx`)

**Directories:**
- lowercase-kebab-case for standard directories (e.g., `client/src/contexts/`)
- camelCase for special directories (e.g., `__manus__/`)

**React Components:**
- PascalCase for component names
- camelCase for props and functions
- Prefix custom hooks with `use`

**CSS Classes:**
- Tailwind utility classes (kebab-case)
- Custom class names use kebab-case (e.g., `.container`)

## Where to Add New Code

**New Feature (UI):**
- Primary code: `client/src/components/` or inline in existing page component
- Tests: Not applicable (no test framework configured)

**New Page/Route:**
- Implementation: `client/src/pages/[PageName].tsx`
- Add route: Update `<Switch>` in `client/src/App.tsx`

**New UI Component:**
- Implementation: `client/src/components/ui/[component-name].tsx`
- Use Radix UI primitives as base, add Tailwind styling

**New Hook:**
- Implementation: `client/src/hooks/use[FeatureName].ts` or `.tsx`
- Export from file, import in components that need it

**New Context:**
- Implementation: `client/src/contexts/[ContextName]Context.tsx`
- Create Provider, context, and custom hook pattern

**Utilities:**
- Shared helpers: `client/src/lib/utils.ts` or new file in `lib/`
- Shared constants: `shared/const.ts`

**Static Assets:**
- Images/docs: `client/public/` or subdirectories
- Downloadable documents: `client/public/docs/`

## Special Directories

**node_modules/:**
- Purpose: pnpm-managed dependencies
- Generated: Yes
- Committed: No

**patches/:**
- Purpose: pnpm package patches
- Generated: Partially (manual edits)
- Committed: Yes

**.planning/:**
- Purpose: Project planning and codebase documentation
- Generated: Yes (by GSD framework)
- Committed: Yes

**.dr_ai/:**
- Purpose: DR_AI framework artifacts (tasks, logs, cache)
- Generated: Yes
- Committed: Mixed (depends on use)

**.manus-logs/:**
- Purpose: Browser debug logs from Manus debug collector (development only)
- Generated: Yes
- Committed: No

**.omc/:**
- Purpose: Manus-specific configuration or state
- Generated: Yes
- Committed: Mixed

**dist/:**
- Purpose: Production build output (generated by `vite build` and `esbuild`)
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-02-25*
