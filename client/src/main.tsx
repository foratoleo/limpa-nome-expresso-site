import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Atlaskit feature flags before rendering
// This prevents "Client must be initialized" errors from @atlaskit/app-provider
import { initAtlaskitFeatureFlags } from "./lib/atlaskit-init";
initAtlaskitFeatureFlags();

// React Query setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create QueryClient with proper options for access status caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
