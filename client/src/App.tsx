import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy-loaded components
const Home = lazy(() => import("@/pages/home"));
const Charts = lazy(() => import("@/pages/charts"));
const Growth = lazy(() => import("@/pages/growth"));
const Export = lazy(() => import("@/pages/export"));
const Profile = lazy(() => import("@/pages/profile"));
const Compare = lazy(() => import("@/pages/compare"));
const Notes = lazy(() => import("@/pages/notes"));
const PregnancyHome = lazy(() => import("@/pages/pregnancy"));
const PregnancyHealth = lazy(() => import("@/pages/pregnancy/health"));
const PregnancyArchive = lazy(() => import("@/pages/pregnancy/archive"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/charts" component={Charts} />
        <Route path="/growth" component={Growth} />
        <Route path="/compare" component={Compare} />
        <Route path="/export" component={Export} />
        <Route path="/notes" component={Notes} />
        <Route path="/profile" component={Profile} />
        
        {/* Pregnancy routes */}
        <Route path="/pregnancy" component={PregnancyHome} />
        <Route path="/pregnancy/health" component={PregnancyHealth} />
        <Route path="/pregnancy/archive" component={PregnancyArchive} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
