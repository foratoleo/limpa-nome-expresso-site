import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Atlaskit feature flags before rendering
// This prevents "Client must be initialized" errors from @atlaskit/app-provider
import { initAtlaskitFeatureFlags } from "./lib/atlaskit-init";
initAtlaskitFeatureFlags();

// React Query setup
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/query-client';

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
