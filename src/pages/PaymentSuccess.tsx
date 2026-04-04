import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { rememberPostAuthDestination } from "@/lib/auth-routing";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const checkAndActivate = async () => {
      // First, show we're processing
      setIsProcessing(true);
      
      // Wait a moment to let user see the success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        // User not logged in - stop processing and show signup button
        setIsProcessing(false);
        return;
      }

      // User is logged in - activate subscription
      const { data, error } = await supabase.functions.invoke("activate-subscription", {
        body: {
          payment_id: searchParams.get("payment_id") || "manual",
          payment_provider: searchParams.get("provider") || "external",
        },
      });

      setIsProcessing(false);

      if (error) {
        toast({
          title: "Activation failed",
          description: "Please contact support if this persists.",
          variant: "destructive",
        });
      } else {
        rememberPostAuthDestination(session.data.session.user.id, "/protocol");
        toast({
          title: "Welcome!",
          description: "Your subscription has been activated successfully.",
        });
        // Redirect to protocol after 2 seconds
        setTimeout(() => navigate("/protocol"), 2000);
      }
    };

    checkAndActivate();
  }, [navigate, searchParams]);

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
            {isProcessing ? "Processing Payment..." : "Payment Successful!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment has been received successfully!
          </p>
          {isProcessing ? (
            <p className="text-muted-foreground">
              Activating your subscription...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">
                Create and verify your account to complete activation
              </p>
              <Button onClick={() => {
                const provider = searchParams.get("provider") || "whop";
                navigate(`/signup?redirect=/payment-success&provider=${provider}`);
              }} className="w-full">
                Create Account And Continue
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
