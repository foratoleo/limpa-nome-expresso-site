import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { AtlaskitProvider } from "./components/providers/AtlaskitProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Welcome from "./pages/Welcome";
import WelcomeHome from "./pages/WelcomeHome";
import Documents from "./pages/Documents";
import Templates from "./pages/Templates";
import Support from "./pages/Support";
import Process from "./pages/Process";
import Downloads from "./pages/Downloads";
import PaymentSuccess from "./pages/PaymentSuccess";
import Billing from "./pages/Billing";
import { CheckoutPage } from "./components/checkout";
import PaymentFailed from "./pages/PaymentFailed";
import AuthCallback from "./pages/AuthCallback";
import { Agentation } from "agentation";
import AdminPanel from "./pages/AdminPanel";
import DebugAccess from "./pages/DebugAccess";
import { type ReactNode } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/welcome"}>
        <ProtectedRoute requirePayment={false}>
          <Welcome />
        </ProtectedRoute>
      </Route>
      <Route path={"/guia"}>
        <ProtectedRoute requirePayment={true}>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path={"/documentos"}>
        <ProtectedRoute requirePayment={true}>
          <Documents />
        </ProtectedRoute>
      </Route>
      <Route path={"/modelos"}>
        <ProtectedRoute requirePayment={true}>
          <Templates />
        </ProtectedRoute>
      </Route>
      <Route path={"/suporte"}>
        <ProtectedRoute requirePayment={true}>
          <Support />
        </ProtectedRoute>
      </Route>
      <Route path={"/downloads"}>
        <ProtectedRoute requirePayment={true}>
          <Downloads />
        </ProtectedRoute>
      </Route>
      <Route path={"/processo"}>
        <ProtectedRoute requirePayment={true}>
          <Process />
        </ProtectedRoute>
      </Route>
      <Route path={"/bem-vindo"}>
        <ProtectedRoute requirePayment={true}>
          <WelcomeHome />
        </ProtectedRoute>
      </Route>
      <Route path={"/dashboard"}>
        <ProtectedRoute requirePayment={true}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/pagamento/sucesso"}>
        <ProtectedRoute requirePayment={true}>
          <PaymentSuccess />
        </ProtectedRoute>
      </Route>
      <Route path={"/faturamento"}>
        <ProtectedRoute requirePayment={true}>
          <Billing />
        </ProtectedRoute>
      </Route>
      <Route path={"/checkout"}>
        <ProtectedRoute requirePayment={false}>
          <CheckoutPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/checkout/sucesso"}>
        <PaymentSuccess />
      </Route>
      <Route path={"/checkout/falha"}>
        <PaymentFailed />
      </Route>
      <Route path={"/auth/callback"} component={AuthCallback} />
      <Route path={"/admin"}>
        <ProtectedRoute requirePayment={false} requireAdmin={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/access"}>
        <ProtectedRoute requirePayment={false} requireAdmin={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path={"/debug-access"}>
        <ProtectedRoute requirePayment={false}>
          <DebugAccess />
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: Admin access bypass is handled by ProtectedRoute component (lines 47-53, 110-115)
// No router-level wrapper needed - ProtectedRoute handles all access control

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
        {/* PaymentProvider: Payment status and access control */}
        <PaymentProvider>
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
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  duration={5000}
                  toastOptions={{
                    style: {
                      background: '#162847',
                      border: '1px solid #d39e17',
                      color: '#f1f5f9',
                    },
                  }}
                />
                <Router />
                {import.meta.env.DEV && <Agentation />}
              </TooltipProvider>
            </ThemeProvider>
          </AtlaskitProvider>
        </PaymentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
