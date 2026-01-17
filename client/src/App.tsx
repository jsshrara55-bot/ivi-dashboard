import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import SmartPreAuth from "./pages/SmartPreAuth";
import AdminPanel from "./pages/AdminPanel";
import DataExplorer from "./pages/DataExplorer";
import DataLoader from "./pages/DataLoader";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/clients"} component={Dashboard} />
      <Route path={"/analytics"} component={Dashboard} />
      <Route path={"/predictions"} component={Dashboard} />
      <Route path={"/settings"} component={Dashboard} />
      <Route path={"/pre-auth"} component={SmartPreAuth} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/data-explorer"} component={DataExplorer} />
      <Route path={"/data-loader"} component={DataLoader} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
