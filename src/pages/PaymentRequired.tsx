import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const PaymentRequired = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Access Required</CardTitle>
          <CardDescription className="text-base mt-2">
            Get lifetime access to The Aura Reset Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <p className="text-lg font-semibold">What's Included:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Complete reset protocol with step-by-step guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>AI-powered chat assistant for personalized support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Progress tracking and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Lifetime access with all future updates</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              After completing your purchase, you'll be redirected back here with instant access.
            </p>
            <Button
              size="lg"
              className="w-full text-lg py-6"
              onClick={() => {
                // User will provide their payment link
                window.open("YOUR_PAYMENT_LINK_HERE", "_blank");
              }}
            >
              Get Access Now
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="link" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentRequired;
