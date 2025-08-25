import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import NewSalePage from "./pages/NewSalePage";
import BuyStockPage from "./pages/BuyStockPage";
import ReportsPage from "./pages/ReportsPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- THIS IS THE CHANGE --- */}
          {/* The default page is now the NewSalePage for testing */}
          <Route path="/" element={<NewSalePage />} /> 
          {/* --- END OF CHANGE --- */}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales/new" element={<NewSalePage />} />
          <Route path="/purchases/new" element={<BuyStockPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;