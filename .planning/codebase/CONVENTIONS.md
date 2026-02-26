# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- PascalCase for React components: `App.tsx`, `ErrorBoundary.tsx`, `Home.tsx`, `ThemeContext.tsx`
- kebab-case for UI components: `button.tsx`, `card.tsx`, `alert-dialog.tsx`, `scroll-area.tsx`
- camelCase for utilities and hooks: `utils.ts`, `const.ts`, `useComposition.ts`, `useMobile.tsx`
- Descriptive names with prefixes: `useComposition`, `usePersistFn`, `ThemeProvider`, `ErrorBoundary`

**Functions:**
- camelCase: `createRoot`, `startServer`, `cn`, `getLoginUrl`, `toggle`, `resetAll`
- Prefix `use` for React hooks: `useTheme`, `useComposition`, `useMobile`, `usePersistFn`, `useChecklist`
- Event handlers: `onKeyDown`, `onCompositionStart`, `onCompositionEnd`, `onClick`, `onToggle`

**Variables:**
- camelCase: `checked`, `toggle`, `progress`, `totalChecked`, `totalItems`, `stepChecked`
- Boolean prefixes: `isComposing`, `hasError`, `switchable`, `asChild`, `stepDone`
- Constants: UPPER_SNAKE_CASE: `COOKIE_NAME`, `ONE_YEAR_MS`, `MAX_LOG_SIZE_BYTES`

**Types:**
- PascalCase for interfaces and types: `Theme`, `ThemeContextType`, `ThemeProviderProps`, `CheckItem`, `Step`, `Props`, `State`
- Generic parameters: `T` for generic types, `React.ComponentProps<"button">`
- Return types: `UseCompositionReturn<T>`, `UseCompositionOptions<T>`

**Components:**
- PascalCase: `App`, `Router`, `Home`, `NotFound`, `ErrorBoundary`, `Button`, `AspectRatio`
- Display components: `ProgressBar`, `DownloadBtn`, `LinkBtn`, `StepCard`, `DownloadsSection`

## Code Style

**Formatting:**
- Tool: Prettier 3.6.2
- Config: `.prettierrc`
- Key settings:
  - Semi-colons: `true`
  - Single quotes: `false` (uses double quotes)
  - Trailing commas: `es5`
  - Print width: 80 characters
  - Tab width: 2 spaces
  - Arrow parens: `avoid` (omits parens for single param)
  - End of line: `lf`
  - Bracket spacing: `true`
  - JSX single quotes: `false`

**Linting:**
- Not configured (no ESLint config found)
- TypeScript strict mode enabled in `tsconfig.json`

**TypeScript:**
- Strict mode: `true`
- Module: ESNext
- Module resolution: bundler
- JSX: preserve
- Path aliases:
  - `@/*` maps to `./client/src/*`
  - `@shared/*` maps to `./shared/*`

## Import Organization

**Order:**
1. React and core libraries imports
2. Third-party package imports
3. Absolute path imports (using `@/*` aliases)
4. Relative path imports (`./`)

**Path Aliases:**
- `@/*`: `./client/src/*` (for client-side imports)
- `@shared/*`: `./shared/*` (for shared code)
- `@assets/*`: `./attached_assets/*` (for static assets)

**Example from `App.tsx`:**
```typescript
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
```

**Type imports:**
- Type imports are not separated in this codebase
- Types are imported alongside values

## Error Handling

**Patterns:**
- Class component error boundaries: `ErrorBoundary` class component with `getDerivedStateFromError`
- Try-catch for async operations in `server/index.ts`: `startServer().catch(console.error)`
- Try-catch for localStorage operations in hooks
- Error state objects: `{ hasError: boolean; error: Error | null }`

**Server-side error handling:**
```typescript
// From server/index.ts
startServer().catch(console.error);

// Express middleware patterns
server.middlewares.use("/__manus__/logs", (req, res, next) => {
  try {
    handlePayload(reqBody);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: String(e) }));
  }
});
```

**Client-side error handling:**
```typescript
// LocalStorage error handling
const [checked, setChecked] = useState<Record<string, boolean>>(() => {
  try {
    const saved = localStorage.getItem("limpa-nome-checklist");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
```

**Error Boundary pattern:**
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  // Renders error UI with stack trace
}
```

## Logging

**Framework:** Console (no structured logging framework)

**Patterns:**
- Server: `console.log` for server startup messages
- Debug collection: Custom Vite plugin writes logs to `.manus-logs/` directory
- Browser: Custom debug collector in `client/public/__manus__/debug-collector.js`

**Log sources:**
- `browserConsole.log`
- `networkRequests.log`
- `sessionReplay.log`

**Log rotation:**
- Max size: 1MB per log file
- Auto-trim to 60% when exceeded

## Comments

**When to Comment:**
- Section dividers: `// ─── Types ───`, `// ─── Data ───`, `// ─── Main Component ───`
- Implementation notes in complex functions (e.g., composition event handling)
- Config-specific comments (theme provider notes)

**JSDoc/TSDoc:**
- Not extensively used in this codebase
- Type annotations used instead of JSDoc comments
- Interface definitions serve as documentation

**Example comment style:**
```typescript
// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckItem {
  id: string;
  label: string;
  detail?: string;
}

// ─── Checklist Hook ────────────────────────────────────────────────────────────
function useChecklist() {
  // ...
}

// NOTE: About Theme
// - First choose a default theme according to your design style
// - If you want to make theme switchable, pass `switchable` ThemeProvider
```

## Function Design

**Size:** No strict limits observed. Functions range from 5-50 lines

**Parameters:**
- Destructured props for components: `{ children, defaultTheme, switchable }: ThemeProviderProps`
- Options object pattern for hooks: `useComposition<T>(options: UseCompositionOptions<T> = {})`
- Event handlers receive typed event objects

**Return Values:**
- Hooks return objects: `return { checked, toggle, progress, totalChecked, totalItems, resetAll }`
- Components return JSX
- Utility functions return primitives or merged values

**Example function signature:**
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("limpa-nome-checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // ...
  return { checked, toggle, progress, totalChecked, totalItems, resetAll };
}
```

## Module Design

**Exports:**
- Named exports for utilities and multiple exports: `export { cn }`, `export function ThemeProvider`, `export function useTheme`
- Default exports for main components and pages: `export default App`, `export default Home`, `export default ErrorBoundary`
- Type exports alongside value exports: `export interface UseCompositionReturn<T>`, `export function useComposition<T>`

**Barrel Files:**
- UI components use direct imports from `@/components/ui/*`
- No barrel/index files observed for component groups

**Component variant pattern:**
```typescript
// From button.tsx
export { Button, buttonVariants };
// Exports both component and variant function for extensibility
```

**Context pattern:**
```typescript
// From ThemeContext.tsx
export function ThemeProvider({ children, defaultTheme, switchable }: ThemeProviderProps)
export function useTheme()
// Provider and hook exported from same file
```

## CSS/Styling Conventions

**Approach:**
- Utility-first: Tailwind CSS 4.1.14
- Component variants: `class-variance-authority` (CVA)
- Conditional classes: `clsx` + `tailwind-merge` via `cn()` utility

**Styling patterns:**
- Inline styles for dynamic values: `style={{ width: `${progress}%` }}`
- Tailwind classes for static styles
- Dark mode: `dark:` prefix support
- Custom CSS variables for theming

**Component styling example:**
```typescript
function Button({ className, variant, size, asChild = false, ...props }) {
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

---

*Convention analysis: 2026-02-25*
