import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Lazy load pages that use Supabase to prevent initialization errors
const Auth = lazy(() => import("./pages/Auth"));
const Signup = lazy(() => import("./pages/Signup"));
const PaymentRequired = lazy(() => import("./pages/PaymentRequired"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ProfileOnboarding = lazy(() => import("./pages/ProfileOnboarding"));
const TextReminderSetup = lazy(() => import("./pages/TextReminderSetup"));
const Protocol = lazy(() => import("./pages/Protocol"));
const ProtocolCapture = lazy(() => import("./pages/ProtocolCapture"));
const ProtocolCaptureMobile = lazy(() => import("./pages/ProtocolCaptureMobile"));
const Advertorial = lazy(() => import("./pages/Advertorial"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/payment-required" element={<PaymentRequired />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/setup/profile" element={<ProfileOnboarding />} />
              <Route path="/setup/text-reminders" element={<TextReminderSetup />} />
              <Route path="/protocol" element={<Protocol />} />
              <Route path="/capture/:scene" element={<ProtocolCapture />} />
              <Route path="/capture-mobile/:scene" element={<ProtocolCaptureMobile />} />
              <Route path="/article" element={<Advertorial />} />
              <Route path="/a/:slug" element={<Advertorial />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
