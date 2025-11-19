import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Lazy load pages that use Supabase to prevent initialization errors
const Auth = lazy(() => import("./pages/Auth"));
const Signup = lazy(() => import("./pages/Signup"));
const PaymentRequired = lazy(() => import("./pages/PaymentRequired"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Protocol = lazy(() => import("./pages/Protocol"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment-required" element={<PaymentRequired />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/protocol" element={<Protocol />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
