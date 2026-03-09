/**
 * MedNexus Frontend - Application Entry Point
 * Initializes React app with providers: QueryClient, BrowserRouter, and app routes
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

/**
 * Configure React Query for API data management
 * Handles caching, refetching, and state synchronization
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache retained for 10 minutes (formerly cacheTime)
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

/**
 * Render app with necessary providers
 * - StrictMode: Development error detection
 * - QueryClientProvider: API state management
 * - BrowserRouter: Client-side routing
 */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
