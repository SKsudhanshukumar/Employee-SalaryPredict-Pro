import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import ProgressiveLoader from "@/components/progressive-loader";

// Lazy load pages for better initial load performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

const loadingSteps = [
  { id: 'init', label: 'Initializing application...', completed: false, duration: 500 },
  { id: 'auth', label: 'Setting up authentication...', completed: false, duration: 300 },
  { id: 'data', label: 'Loading dashboard data...', completed: false, duration: 800 },
  { id: 'ui', label: 'Preparing user interface...', completed: false, duration: 400 },
];

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <Suspense fallback={<ProgressiveLoader steps={loadingSteps} />}>
          <Dashboard />
        </Suspense>
      )} />
      <Route path="/dashboard" component={() => (
        <Suspense fallback={<ProgressiveLoader steps={loadingSteps} />}>
          <Dashboard />
        </Suspense>
      )} />
      <Route component={() => (
        <Suspense fallback={<div>Loading...</div>}>
          <NotFound />
        </Suspense>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
