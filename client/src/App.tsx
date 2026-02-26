import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AtlaskitProvider } from "./components/providers/AtlaskitProvider";
import Home from "./pages/Home";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - The app uses a dual-provider architecture during the Atlassian Design System migration:
//   1. AtlaskitProvider: New Atlassian DS theme with navy/gold legal-financial identity
//   2. ThemeProvider: Legacy theme provider for backward compatibility
// - After migration is complete, ThemeProvider can be removed
// - To enable theme switching, pass `switchable` prop to both providers
// - Default mode is 'dark' (navy background) for the legal/financial context

function App() {
  return (
    <ErrorBoundary>
      {/* AtlaskitProvider: Atlassian Design System with Legal Financial theme */}
      <AtlaskitProvider
        defaultMode="dark"
        // switchable // Uncomment to enable theme switching
      >
        {/* ThemeProvider: Legacy theme support for shadcn/ui components during migration */}
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AtlaskitProvider>
    </ErrorBoundary>
  );
}

export default App;
