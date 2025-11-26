import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ExternalLink, X } from "lucide-react";
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
      <Card className="w-full max-w-2xl border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold mb-2">
            You're 21 Days Away From Being A Completely Different Person...
          </CardTitle>
          <CardDescription className="text-base sm:text-lg font-semibold text-foreground">
            Or You Can Close This Page And Nothing Changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pain Agitation Section */}
          <div className="bg-destructive/5 border-2 border-destructive/20 rounded-lg p-6 space-y-4">
            <p className="text-lg font-bold text-center">Let's Be Brutally Honest For A Second:</p>
            <div className="space-y-2 text-muted-foreground">
              <p>You've tried the supplements. <span className="text-foreground font-semibold">($40-200/month, ongoing)</span></p>
              <p>You've tried the diets. <span className="text-foreground font-semibold">(Keto, paleo, elimination... exhausting)</span></p>
              <p>You've tried the doctors. <span className="text-foreground font-semibold">($150-400/visit, plus "we found nothing")</span></p>
              <p>You've tried the podcasts. <span className="text-foreground font-semibold">(10,000 hours of conflicting advice)</span></p>
            </div>
            <p className="text-base font-bold text-foreground pt-4 border-t border-destructive/20">
              And you're STILL here. Still searching. Still hoping something will click.
            </p>
            <p className="text-base text-foreground">Total spent so far? Be honest with yourself.</p>
            <p className="text-lg font-bold text-center text-destructive">$500? $1,000? $3,000?</p>
            <p className="text-base text-muted-foreground italic text-center">
              And what do you have to show for it? A cabinet full of half-empty bottles and the same symptoms you had two years ago.
            </p>
          </div>

          {/* Value Comparison */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 space-y-4">
            <p className="text-xl font-bold text-center mb-4">What $27 Gets You vs. What You've Been Paying:</p>
            
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <span>1 doctor visit to hear "your tests are normal" = <span className="font-bold">$200+</span></span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <span>1 month of random supplements = <span className="font-bold">$80-150</span></span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <span>1 "gut health" course that's 47 hours of theory = <span className="font-bold">$297+</span></span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <span>1 session with a nutritionist = <span className="font-bold">$150-300</span></span>
              </div>
            </div>

            <div className="border-t-2 border-primary/30 pt-4 mt-4">
              <p className="text-center text-lg font-bold text-muted-foreground mb-2">
                Total for things that HAVEN'T WORKED: <span className="line-through">$700-900+</span>
              </p>
              <p className="text-center text-3xl font-bold text-primary">
                Complete 21-day transformation system = $27
              </p>
              <p className="text-center text-base font-semibold text-foreground mt-2">
                That's <span className="text-primary">37x LESS</span> than the stuff that didn't work.
              </p>
              <p className="text-center text-sm text-muted-foreground mt-4 italic">
                The math isn't complicated. Your decision shouldn't be either.
              </p>
            </div>
          </div>

          {/* Value Stack */}
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 space-y-3">
            <p className="text-xl font-bold text-center mb-4">What You Get For Just $27:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span className="text-sm sm:text-base"><strong>Complete 21-day reset system</strong> with step-by-step guidance <span className="text-primary">(Worth $297)</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span className="text-sm sm:text-base"><strong>Your personal health guide</strong> trained 1000+ hours on THIS program <span className="text-primary">(Worth $497)</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span className="text-sm sm:text-base"><strong>Automatic progress tracking</strong> and insights <span className="text-primary">(Worth $197)</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span className="text-sm sm:text-base"><strong>Interactive diary</strong> and symptom monitoring <span className="text-primary">(Worth $97)</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span className="text-sm sm:text-base"><strong>Lifetime access</strong> with all future updates <span className="text-primary">(Worth $297)</span></span>
              </li>
            </ul>
            <div className="border-t-2 border-primary/20 pt-4 mt-4">
              <p className="text-center text-base sm:text-lg">
                <span className="text-muted-foreground line-through">$1,385 Total Value</span>
                <span className="text-primary text-3xl sm:text-4xl font-bold ml-3">→ Only $27</span>
              </p>
              <p className="text-center text-sm sm:text-base font-semibold text-foreground mt-2">
                That's just <span className="text-primary font-bold">$1.29/day</span> — less than your morning coffee
              </p>
            </div>
          </div>

          {/* Guarantee */}
          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-6">
            <p className="text-xl font-bold text-center mb-4">My "You'd Have To Be An Idiot Not To Try This" Guarantee:</p>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>Go through the first 14 days.</p>
              <p>If you don't feel a noticeable difference—if your energy isn't better, if your sleep isn't improving, if you're not finally understanding YOUR body's patterns...</p>
              <p className="font-bold text-foreground">Email me. I'll refund every penny. No questions. No hassle. No hard feelings.</p>
              <p className="text-center font-semibold text-foreground pt-4 border-t border-primary/20">
                I've done this for 2,400+ people. Less than 3% ever ask for their money back.
              </p>
              <p className="text-center italic">
                The other 97%? They're too busy feeling incredible to remember they ever doubted this.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-base sm:text-lg font-semibold text-foreground mb-6">
              Click below. Complete purchase in 2 minutes. Start transforming your life in 21 days.
            </p>
            <Button
              size="lg"
              className="w-full text-base sm:text-lg py-6 sm:py-8 h-auto font-bold"
              onClick={() => {
                window.open("YOUR_PAYMENT_LINK_HERE", "_blank");
              }}
            >
              Yes! Give Me The 21-Day System For Just $27 (Save $1,358)
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
              ✓ 100% Money-Back Guarantee • ✓ Secure Payment • ✓ ONE-TIME Payment • ✓ NO Subscriptions
            </p>
            <p className="text-xs sm:text-sm text-primary font-bold mt-3">
              Lifetime Access • Less Than 3% Refund Rate
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="link" onClick={handleSignOut} className="text-muted-foreground">
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentRequired;