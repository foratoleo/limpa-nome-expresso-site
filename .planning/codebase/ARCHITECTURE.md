# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** Client-Side Single Page Application (SPA) with Static File Server

**Key Characteristics:**
- React-based SPA using Wouter for routing
- Server-side static file serving with Express for production
- Local storage for state persistence (no backend database)
- Component-based UI with shadcn/ui design system
- Monorepo-style structure with client/server/shared directories

## Layers

**Presentation Layer (Client):**
- Purpose: User interface and interaction
- Location: `client/src/`
- Contains: React components, pages, contexts, hooks, UI library
- Depends on: React, Wouter, Radix UI, Tailwind CSS, localStorage
- Used by: Browser via Vite dev server or static files

**Server Layer:**
- Purpose: Static file serving and SPA routing fallback
- Location: `server/`
- Contains: Express server with static file middleware
- Depends on: Express, Node.js HTTP server
- Used by: Production environment

**Shared Layer:**
- Purpose: Constants shared between client and server
- Location: `shared/`
- Contains: Type definitions, configuration constants
- Depends on: None
- Used by: Both client and server

## Data Flow

**Request Flow:**

1. User accesses application (browser makes HTTP request)
2. Express server serves static assets from `dist/public/` (production) or Vite dev server handles request (development)
3. `index.html` loads with reference to `main.tsx`
4. React application mounts to `#root` element
5. Wouter router handles client-side navigation
6. Components interact with localStorage for persistence

**State Management:**
- Local component state via React hooks (`useState`, `useEffect`)
- Theme state via React Context (`ThemeContext`)
- Checklist persistence via localStorage (`limpa-nome-checklist`)
- No global state management library (Redux/Zustand not used)

## Key Abstractions

**Route Abstraction:**
- Purpose: Client-side navigation without page reloads
- Examples: `client/src/App.tsx` (Router component with Switch)
- Pattern: Wouter's `<Route>` and `<Switch>` components with file-based page components

**Theme Abstraction:**
- Purpose: Centralized theme management with optional switchable mode
- Examples: `client/src/contexts/ThemeContext.tsx`
- Pattern: React Context with Provider component and custom hook (`useTheme`)

**UI Component Abstraction:**
- Purpose: Reusable design system components based on Radix UI primitives
- Examples: `client/src/components/ui/*.tsx`
- Pattern: Headless UI primitives with Tailwind styling, using class-variance-authority for variants

**Error Boundary Abstraction:**
- Purpose: Catch and display React component errors gracefully
- Examples: `client/src/components/ErrorBoundary.tsx`
- Pattern: Class component extending React Component with `getDerivedStateFromError`

## Entry Points

**Client Entry Point:**
- Location: `client/src/main.tsx`
- Triggers: Browser loads `/src/main.tsx` module from `index.html`
- Responsibilities: Mount React application to DOM via `createRoot`

**Application Entry Point:**
- Location: `client/src/App.tsx`
- Triggers: Imported and rendered by `main.tsx`
- Responsibilities: Set up providers (Theme, Tooltip, Toaster, ErrorBoundary), define routes

**Server Entry Point:**
- Location: `server/index.ts`
- Triggers: Node.js starts server with `node dist/index.js`
- Responsibilities: Serve static files, handle SPA routing fallback

**Vite Config Entry Point:**
- Location: `vite.config.ts`
- Triggers: Vite dev server starts or build runs
- Responsibilities: Configure plugins, path aliases, dev server settings

## Error Handling

**Strategy:** Boundary-based error catching with user-friendly display

**Patterns:**
- **ErrorBoundary Component:** Class component wrapping entire app, catches React errors and displays stack trace
- **Toast Notifications:** Sonner library for user-facing notifications
- **Try-Catch in Hooks:** LocalStorage operations wrapped in try-catch blocks (e.g., `useChecklist` hook in `Home.tsx`)
- **No API Error Handling:** No backend API calls, only local operations

## Cross-Cutting Concerns

**Logging:** Manus debug collector plugin writes browser logs to `.manus-logs/` directory (development only)

**Validation:** No form validation library used; inputs handled as native HTML elements

**Authentication:** Not implemented - public informational site

**Analytics:** Umami analytics integration (placeholder in `index.html`)

**Styling:** Tailwind CSS with custom design tokens, CSS custom properties for theming

**Type Safety:** TypeScript with strict mode enabled across all code

**Build Tooling:** Vite for bundling client, esbuild for server, pnpm for package management

---

*Architecture analysis: 2026-02-25*
