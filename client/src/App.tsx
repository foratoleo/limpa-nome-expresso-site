import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AtlaskitProvider } from "./components/providers/AtlaskitProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Documents from "./pages/Documents";
import Templates from "./pages/Templates";
import Support from "./pages/Support";
import Process from "./pages/Process";
import Downloads from "./pages/Downloads";
import PaymentSuccess from "./pages/PaymentSuccess";
import Billing from "./pages/Billing";
import { Agentation } from "agentation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/guia"}>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path={"/documentos"}>
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      <Route path={"/modelos"}>
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      </Route>
      <Route path={"/suporte"}>
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      <Route path={"/downloads"}>
        <ProtectedRoute>
          <Downloads />
        </ProtectedRoute>
      </Route>
      <Route path={"/processo"}>
        <ProtectedRoute>
          <Process />
        </ProtectedRoute>
      </Route>
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/pagamento/sucesso"}>
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      </Route>
      <Route path={"/faturamento"}>
        <ProtectedRoute>
          <Billing />
        </ProtectedRoute>
      </Route>
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
      {/* AuthProvider: Supabase authentication context */}
      <AuthProvider>
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
              {import.meta.env.DEV && <Agentation />}
            </TooltipProvider>
          </ThemeProvider>
        </AtlaskitProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
