import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Dashboard from "./pages/Dashboard";
import SmartPreAuth from "./pages/SmartPreAuth";
import AdminPanel from "./pages/AdminPanel";
import DataExplorer from "./pages/DataExplorer";
import DataLoader from "./pages/DataLoader";
import Clients from "./pages/Clients";
import Analytics from "./pages/Analytics";
import ClientDetails from "./pages/ClientDetails";
import Predictions from "./pages/Predictions";
import RiskAlerts from "./pages/RiskAlerts";
import Settings from "./pages/Settings";
import ProjectEvaluation from "./pages/ProjectEvaluation";
import PDFReport from "./pages/PDFReport";
import CompanyComparison from "./pages/CompanyComparison";
import Scenarios from "./pages/Scenarios";
import ROICalculator from "./pages/ROICalculator";
import SMEClients from "./pages/SMEClients";
import KeyAccounts from "./pages/KeyAccounts";
import Providers from "./pages/Providers";
import CategoryAnalysis from "./pages/CategoryAnalysis";
import PresentationReport from "./pages/PresentationReport";
import BeforeAfterComparison from "./pages/BeforeAfterComparison";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/client/:contNo"} component={ClientDetails} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/predictions"} component={Predictions} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/pre-auth"} component={SmartPreAuth} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/data-explorer"} component={DataExplorer} />
      <Route path={"/data-loader"} component={DataLoader} />
      <Route path={"/risk-alerts"} component={RiskAlerts} />
      <Route path={"/evaluation"} component={ProjectEvaluation} />
      <Route path={"/pdf-report"} component={PDFReport} />
      <Route path={"/compare"} component={CompanyComparison} />
      <Route path={"/scenarios"} component={Scenarios} />
      <Route path={"/roi-calculator"} component={ROICalculator} />
      <Route path={"/sme-clients"} component={SMEClients} />
      <Route path={"/key-accounts"} component={KeyAccounts} />
      <Route path={"/providers"} component={Providers} />
      <Route path={"/category-analysis"} component={CategoryAnalysis} />
      <Route path={"/presentation-report"} component={PresentationReport} />
      <Route path={"/before-after"} component={BeforeAfterComparison} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
