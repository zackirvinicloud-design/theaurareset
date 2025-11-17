import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, AlertTriangle, Sparkles, Clock, Target, Zap, MessageSquare, Award, Shield } from "lucide-react";
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
            How I Went From Daily Burn-Out to Unbeatable Energy in 28 Days—Without Doctors, Drugs, or Endless Testing
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            <strong>(And How 12,847+ Others Used The Same 4-Phase AI-Powered Protocol To Do It Too—Even If They'd "Tried Everything")</strong>
          </p>
          
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm md:text-base font-bold text-center">
              Not Another PDF Download Or Video Course — This Is A Live Interactive Platform With Built-In AI Coach
            </p>
          </div>
          
          <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6 max-w-3xl mx-auto text-left">
            <p className="text-base md:text-lg leading-relaxed">
              <strong>WARNING:</strong> If you're dragging yourself through each day, drowning in brain fog, and watching your productivity die while your doctor says "you're fine"—read every word of this page. <strong className="text-destructive">This could save your career, your relationships, and what's left of your sanity.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-12 py-6 animate-pulse"
            >
              <Zap className="w-5 h-5 mr-2" />
              YES! Give Me Access Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToCTA}
              className="text-lg px-12 py-6"
            >
              Show Me The Proof
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
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
              <span>28-Day Energy Restoration Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                The New Meta In Health Transformation
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                This Isn't A Bunch Of PDFs Sitting In Your Downloads Folder
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Forget courses you "plan to watch later." Forget manuals gathering digital dust. This is the <strong>world's first AI-powered interactive detox platform</strong> that guides you through every single day.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Health Coach (Built-In)</h3>
                <p className="text-muted-foreground mb-4">
                  Ask questions anytime. Get instant, personalized answers about symptoms, supplements, timing—your 24/7 detox expert.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $297</p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Automatic Day Tracker</h3>
                <p className="text-muted-foreground mb-4">
                  Never wonder "what day am I on?" or "what phase is this?" Your progress is tracked automatically, always visible.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $97</p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Interactive Diary</h3>
                <p className="text-muted-foreground mb-4">
                  Track symptoms, energy levels, and breakthroughs. Watch your transformation unfold in real-time with data.
                </p>
                <p className="text-sm font-semibold text-primary">Value: $97</p>
              </Card>
            </div>

            <Card className="mt-12 p-8 bg-primary/5 border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-6 text-center">Why People Get Results Faster With The Platform</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">No guessing:</p>
                    <p className="text-muted-foreground text-sm">The AI answers your specific questions instantly—no waiting for customer support</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Stay on track:</p>
                    <p className="text-muted-foreground text-sm">Automatic tracking means you never lose your place or miss a phase</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">Accountability:</p>
                    <p className="text-muted-foreground text-sm">Daily diary tracking keeps you engaged and motivated to complete the protocol</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-bold mb-1">See progress:</p>
                    <p className="text-muted-foreground text-sm">Watch your energy scores and symptom improvements in real-time—proof that it's working</p>
                  </div>
                </div>
              </div>
              <p className="text-center mt-8 text-lg font-bold">
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

      {/* Symptoms Deep Dive */}
      <div className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Chronic Energy Depletion</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You wake up MORE exhausted than when you went to bed. It's like something literally drained your battery overnight. Coffee? Useless. Energy drinks? A cruel joke. You're DRAGGING yourself through every single day while watching everyone else seem to have the vitality you desperately crave. You wonder: 'Is this just my life now? Am I broken?'
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Brain Fog & Mental Fatigue</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Simple decisions feel impossible. You read the same sentence three times and still don't absorb it. Names you've known for years vanish from memory. Conversations feel like swimming through mud. You KNOW you're smarter than this, but it's like your brain is wrapped in thick cotton. The mental sharpness you once had? Gone. And nobody seems to understand how terrifying that is.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Digestive Chaos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your stomach is a war zone. Bloating so bad you look pregnant. Gas that's humiliating. Irregular bowel movements that control your schedule. You've tried every elimination diet, every probiotic, every "gut health" supplement. Nothing works for long. You're afraid to eat in public, plan your day around bathroom access, and feel trapped in your own malfunctioning body.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Cost of Doing Nothing Section */}
      <div className="py-16 lg:py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            The TRUE COST Of Doing Nothing
          </h2>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Let's be brutally honest about what the next 5 years look like if you don't fix this NOW:
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 border-2 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 text-destructive">Your Career</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Missed promotions because you can't sustain the energy</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Watching less-qualified people advance past you</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Declining performance reviews and increasing scrutiny</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Potential cost: $200,000+ in lost earnings over 5 years</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-2 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 text-destructive">Your Relationships</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Too exhausted for quality time with loved ones</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Short-tempered and irritable when you should be present</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Missing your kids' events because you 'just can't today'</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Strained or broken relationships with loved ones</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-2 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 text-destructive">Your Health</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Symptoms progressively worsen, not stabilize</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>New mysterious symptoms appearing regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Immune system weakening, getting sick more often</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Early aging, weight gain, hormonal imbalances</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-2 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 text-destructive">Your Mental State</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Deepening depression from chronic unresolved suffering</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Anxiety intensifying as symptoms multiply</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Loss of identity: 'I'm not who I used to be'</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>Looking back with crushing regret: 'Why didn't I act sooner?'</span>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-8 bg-destructive/10 border-2 border-destructive">
            <h3 className="text-2xl font-bold mb-4 text-center">The Financial Reality</h3>
            <p className="text-center text-lg mb-4">
              Over 5 years, you'll spend <strong className="text-destructive">$60,000+</strong> on doctors, specialists, medications, and supplements that never address the root cause.
            </p>
            <p className="text-center text-lg">
              The Aura Reset Protocol costs <strong className="text-primary">$47 once</strong> and actually fixes the problem.
            </p>
            <p className="text-center text-xl font-bold mt-6">
              Which path makes more sense? Endless expensive suffering... or one decision that changes everything?
            </p>
          </Card>
        </div>
      </div>

      {/* The Protocol Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">The Complete Solution</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                The Aura Reset Protocol: The ONLY 4-Phase System That Eliminates Energy Vampires In The Scientifically-Correct Sequence
              </h2>
              <p className="text-xl text-muted-foreground">
                <strong>Here's why this works when everything else failed:</strong> We attack the ROOT CAUSE in the EXACT sequence your body needs—not just masking symptoms like every other "solution" you've wasted money on.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Phase 1: Foundation</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Continuous Liver Support (Days 1-28)</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Master detoxifier activation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Prevent toxin reabsorption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Daily liver-supporting juices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Targeted supplement protocol</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Complete elimination support</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Phase 2: Prep Work</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Fungal Pre-Conditioning (Days 1-7)</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Starve fungal colonies first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Create hostile environment for parasites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Natural antifungal compounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Gut microbiome restoration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Set stage for main elimination</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Phase 3: Main Event</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Parasite Elimination (Days 8-21)</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Targeted herbal parasite killers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Aggressive elimination support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Die-off symptom management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Complete system cleansing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Energy restoration protocols</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <h3 className="text-xl font-bold">Phase 4: The Epilogue</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Heavy Metal Detox (Days 22-28)</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Safe chelation from deep tissues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Natural metal-binding compounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Cellular toxin removal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Full body purification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Complete system reset</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-12 p-8 bg-destructive/10 border-2 border-destructive">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                WARNING: Sequence Is EVERYTHING
              </h3>
              <p className="text-lg mb-6">
                <strong>CRITICAL:</strong> This 4-phase sequence is scientifically designed! Liver support runs continuously while we systematically eliminate each layer. Skip a phase or change the order and you'll just redistribute toxins and feel WORSE.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p><strong>Phase 1:</strong> Liver support FIRST → Prevents toxin reabsorption throughout</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p><strong>Phase 2:</strong> Weaken fungus → Creates hostile environment for parasites</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p><strong>Phase 3:</strong> Kill parasites → Eliminates main energy drainers</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p><strong>Phase 4:</strong> Remove metals → Safe chelation without redistribution</p>
                </div>
              </div>
            </Card>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-12 py-6"
              >
                Get Access Now 🔥
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Instant access • Start in 5 minutes • 28-day guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background" id="cta-section">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="default" className="mb-6 text-base px-4 py-2">
              ⚡ Limited-Time Pricing Ends Soon
            </Badge>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your Transformation Starts Right Now
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Stop suffering. Stop waiting. Stop hoping it'll magically get better. Take control of your energy, your health, your LIFE—starting today.
            </p>

            <Card className="p-8 mb-8">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2 line-through">$885 Total Value</p>
                <p className="text-6xl font-bold text-primary mb-2">Only $47</p>
                <p className="text-lg font-semibold">ONE-TIME Payment • Lifetime Access • NO Subscriptions</p>
              </div>

              <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Complete 4-Phase AI-Guided Protocol</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">24/7 AI Health Coach (Aurora)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Automatic Progress Tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Interactive Transformation Diary</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Lifetime Platform Access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">28-Day Money-Back Guarantee</span>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-xl px-16 py-8 w-full md:w-auto animate-pulse"
              >
                YES! Transform My Life Now - $47
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                ✓ Instant Access • ✓ Secure Payment • ✓ 28-Day Guarantee
              </p>
            </Card>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
