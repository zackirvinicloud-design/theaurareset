import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isEmailVerified, rememberPostAuthDestination } from "@/lib/auth-routing";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [needsAccount, setNeedsAccount] = useState(false);

  const paymentId = searchParams.get("payment_id");
  const provider = searchParams.get("provider") || "whop";
  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return `/payment-success${query ? `?${query}` : ""}`;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const activate = async () => {
      setIsProcessing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !isEmailVerified(session.user)) {
        if (!cancelled) {
          setNeedsAccount(true);
          setIsProcessing(false);
        }
        return;
      }

      const { error } = await supabase.functions.invoke("activate-subscription", {
        body: {
          payment_id: paymentId,
          payment_provider: provider,
        },
      });

      if (cancelled) return;

      setIsProcessing(false);

      if (error) {
        toast({
          title: "Activation failed",
          description: "We could not verify your Whop access yet. Please contact support if this keeps happening.",
          variant: "destructive",
        });
        return;
      }

      rememberPostAuthDestination(session.user.id, "/protocol");
      
      const { data: profile } = await supabase
        .from('user_onboarding_profiles')
        .select('completed_at')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      const hasCompletedOnboarding = Boolean(profile?.completed_at);

      if (hasCompletedOnboarding) {
        toast({
          title: "Access unlocked",
          description: "Just one more thing: enable text reminders so you stay on track.",
        });
        const next = new URLSearchParams();
        next.set("redirect", "/protocol");
        next.set("source", "payment-success");
        navigate(`/setup/text-reminders?${next.toString()}`, { replace: true });
      } else {
        toast({
          title: "Access unlocked",
          description: "Next up: a quick profile setup so Coach can tailor this around you.",
        });
        const next = new URLSearchParams();
        next.set("redirect", "/protocol");
        next.set("source", "payment-success");
        next.set("provider", provider);
        if (paymentId) {
          next.set("payment_id", paymentId);
        }
        navigate(`/setup/profile?${next.toString()}`, { replace: true });
      }
    };

    void activate();

    return () => {
      cancelled = true;
    };
  }, [navigate, paymentId, provider]);

  return (
    <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
      <Card className="app-panel-dark w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <CheckCircle className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {isProcessing ? "Verifying checkout..." : "Access ready"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isProcessing
              ? "Checking your Whop checkout and preparing your access."
              : "Your free trial is active."}
          </p>

          {needsAccount && (
            <>
              <p className="text-muted-foreground font-medium">
                Create or verify your account to attach this checkout to your workspace.
              </p>
              <Button
                onClick={() => {
                  const next = new URLSearchParams();
                  next.set("redirect", currentPath);
                  next.set("provider", provider);
                  if (paymentId) {
                    next.set("payment_id", paymentId);
                  }
                  navigate(`/signup?${next.toString()}`);
                }}
                className="w-full"
              >
                Continue to account setup
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
