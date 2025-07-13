import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import BioPreview from "@/pages/bio-preview";
import Subscribe from "@/pages/subscribe";
import Demo from "@/pages/demo";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";
import ProFeatures from "@/pages/pro-features";
import ProEditor from "@/pages/pro-editor";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/demo" component={Demo} />
          <Route path="/:username" component={BioPreview} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/settings" component={Settings} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/pro-features" component={ProFeatures} />
          <Route path="/pro-editor" component={ProEditor} />
          <Route path="/demo" component={Demo} />
          <Route path="/:username" component={BioPreview} />
        </>
      )}
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
