import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const activateSubscription = async () => {
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to activate your subscription.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Call edge function to activate subscription
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
        toast({
          title: "Welcome!",
          description: "Your subscription has been activated successfully.",
        });
        // Redirect to protocol after 2 seconds
        setTimeout(() => navigate("/protocol"), 2000);
      }
    };

    activateSubscription();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
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
          {isProcessing ? (
            <p className="text-muted-foreground">
              Please wait while we activate your subscription...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Your subscription has been activated. Redirecting to the protocol...
              </p>
              <Button onClick={() => navigate("/protocol")} className="w-full">
                Continue to Protocol
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
