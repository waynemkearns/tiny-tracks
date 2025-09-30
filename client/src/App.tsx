import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Charts from "@/pages/charts";
import Growth from "@/pages/growth";
import Export from "@/pages/export";
import Profile from "@/pages/profile";
import Compare from "@/pages/compare";
import Notes from "@/pages/notes";
import PregnancyHome from "@/pages/pregnancy";
import PregnancyHealth from "@/pages/pregnancy/health";
import PregnancyArchive from "@/pages/pregnancy/archive";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
