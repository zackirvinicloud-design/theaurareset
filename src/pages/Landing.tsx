import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle, Sparkles, Clock, Target, Zap, MessageSquare, LineChart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        navigate("/protocol");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        navigate("/protocol");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const scrollToCTA = () => {
    document.getElementById("cta-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Urgent Top Bar */}
      {showTopBar && (
        <div className="bg-destructive text-destructive-foreground py-3 px-4 relative">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-semibold text-center">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>⚠️STOP: If You're Suffering From Chronic Fatigue, Brain Fog, or Digestive Problems—DO NOT Close This Page Until You Read This Urgent Message⚠️</p>
            <button 
              onClick={() => setShowTopBar(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="mx-auto gap-1 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4" />
            The Aura Reset Protocol - Limited Offer
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            How I Went From <span className="text-destructive">Daily Burn-Out</span> to{" "}
            <span className="text-primary">Unbeatable Energy</span> in 60 Days—Without Doctors, Drugs, or Endless Testing
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            <strong>(And How 12,847+ Others Used The Same 4-Phase AI-Powered Protocol To Do It Too—Even If They'd "Tried Everything")</strong>
          </p>
          
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm md:text-base font-medium">
              Not Another PDF Download Or Video Course — This Is A Live Interactive Platform With Built-In AI Coach
            </p>
          </div>
          
          <div className="bg-card border-2 border-border rounded-lg p-6 max-w-3xl mx-auto text-left">
            <p className="text-base md:text-lg leading-relaxed">
              <strong>WARNING:</strong> If you're dragging yourself through each day, drowning in brain fog, and watching your productivity die while your doctor says "you're fine"—read every word of this page. <strong>This could save your career, your relationships, and what's left of your sanity.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              YES! Give Me Access Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToCTA}
              className="text-lg px-8 py-6 w-full sm:w-auto"
            >
              Show Me The Proof
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Instant Digital Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>4-Phase AI-Guided Protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>60-Day Energy Restoration Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">The New Meta In Health Transformation</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                This Isn't A Bunch Of PDFs Sitting In Your Downloads Folder
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Forget courses you "plan to watch later." Forget manuals gathering digital dust. This is the <strong>world's first AI-powered interactive detox platform</strong> that guides you through every single day.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 bg-card hover:shadow-lg transition-all">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">AI Health Coach (Built-In)</h3>
                <p className="text-muted-foreground mb-4">
                  Ask questions anytime. Get instant, personalized answers about symptoms, supplements, timing—your 24/7 detox expert.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $297</p>
              </Card>

              <Card className="p-8 bg-card hover:shadow-lg transition-all">
                <Clock className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Automatic Day Tracker</h3>
                <p className="text-muted-foreground mb-4">
                  Never wonder "what day am I on?" or "what phase is this?" Your progress is tracked automatically, always visible.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $97</p>
              </Card>

              <Card className="p-8 bg-card hover:shadow-lg transition-all">
                <LineChart className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Interactive Diary</h3>
                <p className="text-muted-foreground mb-4">
                  Track symptoms, energy levels, and breakthroughs. Watch your transformation unfold in real-time with data.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $97</p>
              </Card>
            </div>

            <Card className="p-8 bg-primary/5 border-2 border-primary/30">
              <h3 className="text-2xl font-bold mb-6 text-center">Why People Get Results Faster With The Platform</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">No guessing:</p>
                    <p className="text-muted-foreground">The AI answers your specific questions instantly—no waiting for customer support</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Stay on track:</p>
                    <p className="text-muted-foreground">Automatic tracking means you never lose your place or miss a phase</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Accountability:</p>
                    <p className="text-muted-foreground">Daily diary tracking keeps you engaged and motivated to complete the protocol</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">See progress:</p>
                    <p className="text-muted-foreground">Watch your energy scores and symptom improvements in real-time—proof that it's working</p>
                  </div>
                </div>
              </div>
              <p className="text-center mt-8 text-lg font-semibold">
                This is why 87% of our users complete the full protocol (vs. 12% for typical PDF courses)
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Problem Agitation Section */}
      <div className="py-16 lg:py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center">
            STOP LYING TO YOURSELF: Your "Normal" Day Is Actually A Living Nightmare
          </h2>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Does this sound brutally familiar? (Be honest—your life may depend on it)
          </p>

          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-bold mb-2">6:30 AM</p>
              <p className="text-muted-foreground">
                You peel your eyes open. It feels like you didn't sleep at all, even though you were in bed for 8 hours. Your body is HEAVY. Your mind is wrapped in fog. You drag yourself to the bathroom mirror and barely recognize the exhausted, depleted person staring back at you.
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-bold mb-2">10:00 AM</p>
              <p className="text-muted-foreground">
                You've already had two cups of coffee. Nothing helps. You're trying to focus on work but you keep reading the same paragraph over and over. Your coworkers are talking around you but their voices sound distant, muffled.
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-bold mb-2">2:00 PM</p>
              <p className="text-muted-foreground">
                The afternoon crash hits like a freight train. You're SO tired you could cry. You sneak another coffee, maybe reach for something sweet. Your gut starts bloating, cramping. You feel disgusted with yourself but you can't stop the cravings.
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-bold mb-2">6:00 PM</p>
              <p className="text-muted-foreground">
                You finally drag yourself home. Your family wants your attention but you have NOTHING left to give. You feel guilty, angry at yourself, hopeless. You collapse on the couch. Is this really what your life has become?
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-bold mb-2">11:00 PM</p>
              <p className="text-muted-foreground">
                You're exhausted but somehow can't sleep. Your mind races with worries. Your gut hurts. You dread waking up tomorrow to do it all over again.
              </p>
            </Card>
          </div>

          <div className="mt-12 p-8 bg-primary/10 rounded-lg text-center">
            <p className="text-xl font-bold mb-4">
              If you're nodding your head right now, I have TWO pieces of news:
            </p>
            <p className="text-lg mb-2">
              <span className="text-primary font-bold">GOOD NEWS</span>—IT'S NOT YOUR FAULT.
            </p>
            <p className="text-lg">
              <span className="text-destructive font-bold">BAD NEWS</span>—If you don't fix this NOW, it only gets worse.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta-section" className="bg-gradient-to-b from-primary/5 to-primary/10 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready To Reclaim Your Energy and Life?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 12,847+ others who transformed their health with the AI-powered Aura Reset Protocol
            </p>
            
            <Card className="p-8 mb-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-lg">AI Health Coach (Built-In)</span>
                  <span className="font-semibold">$297</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Automatic Day Tracker</span>
                  <span className="font-semibold">$97</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Interactive Diary</span>
                  <span className="font-semibold">$97</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <span className="text-xl font-bold">Total Value:</span>
                  <span className="text-2xl font-bold">$491</span>
                </div>
              </div>
              
              <div className="bg-primary/10 p-6 rounded-lg mb-6">
                <p className="text-3xl font-bold mb-2">One-Time Payment</p>
                <p className="text-muted-foreground mb-4">Lifetime access, no subscriptions</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <span className="font-semibold">60-Day Money-Back Guarantee</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-xl px-12 py-8 w-full md:w-auto shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
              >
                <Zap className="w-6 h-6 mr-2" />
                Start Your Transformation Now
              </Button>
            </Card>

            <div className="text-sm text-muted-foreground">
              <p>✓ Instant access after signup</p>
              <p>✓ Works on all devices</p>
              <p>✓ Lifetime updates included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 The Aura Reset Protocol. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
