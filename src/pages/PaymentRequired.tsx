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
                <span>Complete 4-phase reset protocol with step-by-step guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Aurora - Your personal health AI trained 1000+ hours on this protocol</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Automatic progress tracking and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Interactive diary and symptom monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Lifetime access with all future updates</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Regular Price: $297</p>
              <p className="text-5xl font-bold text-primary mb-2">Only $47</p>
              <p className="text-sm font-semibold">One-Time Payment • Lifetime Access</p>
            </div>
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
              Get Access Now - $47
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              ✓ 60-Day Money-Back Guarantee • ✓ Secure Payment
            </p>
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
