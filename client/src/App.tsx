import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { analytics } from "./lib/analytics";
import { Sentry } from "./lib/analytics";
import RegisterSW from "./components/pwa/register-sw";
import FeedbackForm from "./components/feedback-form";

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
  const [location] = useLocation();
  
  // Track page views
  useEffect(() => {
    analytics.pageView(location);
  }, [location]);
  
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
    <Sentry.ErrorBoundary fallback={
      <div className="p-4 text-center">
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p>We've been notified and will fix this issue as soon as possible.</p>
        <button 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    }>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <RegisterSW />
          <FeedbackForm />
        </TooltipProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
