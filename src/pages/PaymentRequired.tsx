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
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">⚠️ ACCESS DENIED ⚠️</CardTitle>
          <CardDescription className="text-base mt-2 font-semibold">
            You're ONE DECISION Away From Transforming Your Life in 28 Days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6 space-y-3">
            <p className="text-lg font-bold text-destructive text-center">STOP. Read This Before You Leave:</p>
            <p className="text-base font-semibold">What You Get For Just $47:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong>Complete 28-day reset protocol</strong> with step-by-step guidance (Worth $197)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong>Aurora</strong> - Your personal health AI trained 1000+ hours on THIS protocol (Worth $197)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong>Automatic progress tracking</strong> and insights (Worth $97)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong>Interactive diary</strong> and symptom monitoring (Worth $97)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong>Lifetime access</strong> with all future updates (Worth $297)</span>
              </li>
            </ul>
            <div className="border-t-2 border-primary/20 pt-3 mt-3">
              <p className="text-center text-lg font-bold">
                <span className="text-muted-foreground line-through">$885 Total Value</span>
                <span className="text-primary text-2xl ml-3">→ Only $47</span>
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 line-through">$885 Value</p>
              <p className="text-5xl font-bold text-primary mb-2">Only $47</p>
              <p className="text-sm font-semibold text-destructive">ONE-TIME Payment • Lifetime Access • NO Subscriptions</p>
            </div>
            <p className="text-sm text-foreground font-semibold mb-4">
              Click below. Complete purchase in 2 minutes. Start transforming in 28 days. Or stay stuck forever.
            </p>
            <Button
              size="lg"
              className="w-full text-lg py-6 animate-pulse"
              onClick={() => {
                // User will provide their payment link
                window.open("YOUR_PAYMENT_LINK_HERE", "_blank");
              }}
            >
              YES! Get Access Now - $47 (Save $838)
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              ✓ I'll BEG You For A Refund If It Doesn't Work • ✓ Secure Payment • ✓ Less Than 3% Ever Ask For Refund
            </p>
            <p className="text-xs text-destructive font-bold mt-2">
              ⚠️ Close this page = Choose to stay broken. Your decision.
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
