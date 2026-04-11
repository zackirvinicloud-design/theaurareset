import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { getWhopCheckoutUrl, PRODUCT_NAME, PRODUCT_PRICE, PRODUCT_PRIMARY_CTA } from "@/lib/product";

const PAYWALL = {
  headline: "Your protocol workspace is ready.",
  description: "You already know the cleanse is hard to execute cleanly. This one-time purchase keeps the daily plan, shopping, symptom support, and coaching in one place.",
  bullets: [
    "Day-by-day protocol guidance that answers what matters today, not generic wellness advice.",
    "GutBrain coaching tied to your protocol day, your friction, and your real routine.",
    "Shopping, food, timing, symptom support, and troubleshooting without PDF chaos.",
    "Optional text reminders that pull you back into the exact step when life gets messy.",
    "One-time payment. Lifetime access. No subscription drag.",
  ],
};

const PaymentRequired = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      if (!isEmailVerified(session.user)) {
        navigate("/signup");
        return;
      }

      const destination = await getDefaultPostAuthDestination(session.user.id);
      if (destination !== "/payment-required") {
        navigate(destination);
        return;
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCheckout = () => {
    const checkoutUrl = getWhopCheckoutUrl();
    if (!checkoutUrl) {
      toast({
        title: "Checkout is not configured yet",
        description: "Add `VITE_WHOP_CHECKOUT_URL` before sending traffic to this page.",
        variant: "destructive",
      });
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
        <Card className="app-panel-dark w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">Loading</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Checking your access status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
      <Card className="app-panel-dark w-full max-w-3xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold mb-2">
            {PAYWALL.headline}
          </CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base sm:text-lg font-medium">
            {PAYWALL.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="app-panel-muted rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              What full access keeps in place
            </p>
            <div className="mt-5 grid gap-3">
              {PAYWALL.bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  <span className="mt-1 text-base font-bold text-primary">+</span>
                  <p className="text-sm leading-6 text-muted-foreground">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              One-time access
            </p>
            <p className="mt-4 text-4xl font-bold text-primary">{PRODUCT_PRICE}</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              One payment. Lifetime access. No subscription. No app-store friction.
            </p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {PRODUCT_NAME} is not another pile of wellness theory. It is the execution layer built to get you through the cleanse without unnecessary confusion.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-primary/10 p-6">
            <p className="text-base font-semibold text-foreground">
              Open in your browser. Add text reminders only if you want them.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              One payment keeps your cleanse workspace, daily structure, and core product updates in place without another subscription to manage.
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="w-full text-base sm:text-lg py-6 sm:py-8 h-auto font-bold"
              onClick={handleCheckout}
            >
              {PRODUCT_PRIMARY_CTA}
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
              ✓ One-time payment • ✓ Lifetime access • ✓ No app download required
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/60 pt-6">
          <Button variant="link" onClick={handleSignOut} className="text-muted-foreground">
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentRequired;
