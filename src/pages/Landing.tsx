import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, MessageSquare, LineChart, Brain, Shield, Zap, Users, Target, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [checkedSymptoms, setCheckedSymptoms] = useState<number>(0);

  const handleCTA = () => {
    window.location.href = "https://whop.com/checkout/plan_CUGZlF5JjekWR";
  };

  const symptoms = [
    "Wake up tired despite getting 7-8 hours of sleep",
    "Experience brain fog or difficulty concentrating",
    "Struggle with bloating, gas, or irregular digestion",
    "Crave sugar, energy drinks, or carbs throughout the day",
    "Feel your energy crash in the afternoon",
    "Deal with unexplained mood swings or anxiety",
    "Notice your skin looks dull or breaks out frequently",
    "Can't seem to lose stubborn weight",
    "Experience random aches in joints or muscles",
    "Feel like you're 'running on empty' most days"
  ];

  const toggleSymptom = () => {
    setCheckedSymptoms(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Aura Reset Protocol</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/auth")} variant="ghost">
              Sign In
            </Button>
            <Button onClick={handleCTA} variant="default">
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Warning Banner */}
          <div className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <span className="text-lg font-bold text-destructive">WARNING</span>
            </div>
            <p className="text-base md:text-lg font-medium">
              If You Have Gut Issues, Brain Fog, OR Crushing Fatigue—STOP Everything And Read This ENTIRE Message. What's Inside You Could Be Stealing YEARS From Your Life Right Now.
            </p>
          </div>

          <div className="text-center space-y-6">
            <Badge variant="secondary" className="mx-auto gap-2 px-4 py-2">
              <Sparkles className="w-4 h-4" />
              2-Day FREE Trial • The Aura Reset Protocol
            </Badge>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              These Invisible Invaders Have Stolen Your Body. Your Identity.{" "}
              <span className="bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
                Your True Self.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              They're poisoning your blood. Clouding your mind. Draining your energy. And they've been winning... until now.
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-6 max-w-2xl mx-auto text-left">
              <p className="text-base md:text-lg font-semibold mb-2">
                The gut discomfort isn't your diet. The brain fog isn't stress. The exhaustion isn't aging.
              </p>
              <p className="text-muted-foreground">
                Something is TAKING from you. Here's how to take it back in 21 days.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-lg px-8 py-6 group shadow-lg hover:shadow-xl"
            >
              Start FREE 2-Day Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-6"
            >
              Show Me The Proof
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">2-Day FREE Trial</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">Instant Digital Access</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">Lifetime Platform Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Assessment */}
      <section id="assessment" className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Is Aura Reset Right For You?
              </h2>
              <p className="text-lg text-muted-foreground">
                Tap the ones that sound familiar...
              </p>
            </div>

            <Card className="p-6 md:p-8 space-y-4">
              {symptoms.map((symptom, index) => (
                <label 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all"
                >
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 text-primary"
                    onChange={toggleSymptom}
                  />
                  <span className="text-base">{symptom}</span>
                </label>
              ))}

              {checkedSymptoms >= 3 && (
                <div className="mt-6 p-6 bg-primary/10 border-2 border-primary rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-lg mb-2">
                        If you checked 3 or more boxes...
                      </p>
                      <p className="text-muted-foreground">
                        Your body is sending clear signals that it's time for a reset. The Aura Reset Protocol was created specifically to address these root causes and restore your natural vitality.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCTA}
                    className="w-full group"
                    size="lg"
                  >
                    Start Your FREE 2-Day Trial Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* The Occupation */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              THE OCCUPATION: A Day In The Life Of Someone Whose Body Is Under Siege
            </h2>
            <p className="text-lg text-muted-foreground">
              (Sound familiar? Then you need to see what comes next...)
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">7AM</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">The Morning Battle</h3>
                  <p className="text-muted-foreground">
                    Your alarm goes off. You've slept 8 hours but feel like you've been hit by a truck. That heavy, drugged feeling isn't normal—it's them feeding while you tried to rest.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">2PM</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">The Afternoon Crash</h3>
                  <p className="text-muted-foreground">
                    You can barely keep your eyes open. You need sugar. NOW. That's not you—that's them demanding their fuel. They've hijacked your cravings.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">9PM</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">The Stolen Evening</h3>
                  <p className="text-muted-foreground">
                    You're bloated, foggy, irritable. Your family gets the worst version of you. Not because you're a bad person—because you're being drained from the inside out.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-bold mb-6">
              This ends now. You're not broken. You're OCCUPIED.
            </p>
            <Button 
              onClick={handleCTA}
              size="lg"
              className="text-lg px-8 py-6 group"
            >
              Take Back Control—Start FREE Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              The Complete Arsenal To Win This War
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Not just information. A complete system to identify, eliminate, and prevent these invaders from ever stealing your life again.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Health Coach (Aurora)</h3>
              <p className="text-muted-foreground mb-4">
                Your 24/7 personal guide who knows EXACTLY what you're dealing with. No judgment. No appointments. Just instant, intelligent support when you need it most.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Instant symptom analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Personalized recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Progress tracking</span>
                </li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">The 4-Phase Elimination System</h3>
              <p className="text-muted-foreground mb-4">
                This isn't random. It's the EXACT sequence needed to safely eliminate parasites, fungal overgrowth, and heavy metals—without triggering dangerous die-off reactions.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Phase 1: Foundation (all 21 days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Phase 2: Fungal cleanse (days 1-7)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Phase 3: Parasite cleanse (days 8-14)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Phase 4: Heavy metals (days 15-21)</span>
                </li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
              <p className="text-muted-foreground mb-4">
                Visual dashboards show your improvements in real-time. See exactly how you're progressing across all health metrics.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Energy level tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Symptom monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Milestone celebrations</span>
                </li>
              </ul>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Journal</h3>
              <p className="text-muted-foreground mb-4">
                Document your journey with AI-powered insights. Your journal learns from you and provides personalized feedback.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>AI-generated insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Pattern recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Export & share</span>
                </li>
              </ul>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Daily Protocols</h3>
              <p className="text-muted-foreground mb-4">
                Never guess what to do next. Get clear, actionable daily instructions with supplement timing and dosages.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Step-by-step guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Reminder notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Progress checkpoints</span>
                </li>
              </ul>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Risk-Free</h3>
              <p className="text-muted-foreground mb-4">
                We're so confident you'll see results, we offer an unconditional money-back guarantee. Zero risk.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>30-day guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>Cancel anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>Full refund, no questions</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              From Occupied To Free In 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground">
              No complexity. No confusion. Just clear action that gets results.
            </p>
          </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Start Your FREE 2-Day Trial</h3>
                  <p className="text-muted-foreground text-lg">
                    No credit card. No risk. Just instant access to everything you need. Takes 30 seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Get Your Custom Battle Plan</h3>
                  <p className="text-muted-foreground text-lg">
                    Aurora analyzes your symptoms and creates your personalized protocol. You'll know exactly what to do, when to do it, and why it matters.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Execute & Evict</h3>
                  <p className="text-muted-foreground text-lg">
                    Follow the daily protocol. Aurora guides you through every phase, answers your questions, and adjusts based on how YOUR body responds.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Reclaim Your Life</h3>
                  <p className="text-muted-foreground text-lg">
                    Watch your energy return. Feel the fog lift. See your body heal. Most people report dramatic improvements by day 14. By day 21, you won't recognize yourself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Real People Who Won Their Freedom Back
            </h2>
            <p className="text-xl text-muted-foreground">
              These were people just like you. Occupied. Drained. Desperate. Here's what happened when they fought back.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "I was taking 2-3 naps just to survive. Day 12, I woke up... different. Clear. Energized. I cried. I forgot what it felt like to actually LIVE."
              </p>
              <div className="font-semibold">Sarah M.</div>
              <div className="text-sm text-muted-foreground">Week 3 of Protocol</div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The brain fog was so bad I couldn't code anymore. Thought my career was over at 34. Day 16, it was like someone flipped a switch. I'm back."
              </p>
              <div className="font-semibold">Michael R.</div>
              <div className="text-sm text-muted-foreground">Completed Protocol</div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Doctors gave me pills for 7 years. Nothing worked. This protocol found the ROOT CAUSE. My gut finally works. I'm not constantly bloated and in pain. This saved my life."
              </p>
              <div className="font-semibold">Jennifer K.</div>
              <div className="text-sm text-muted-foreground">Day 21 Complete</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-gradient-to-b from-background to-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 inline-block">
              <p className="text-destructive font-bold">
                ⚡ Limited spots remaining for this month
              </p>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold">
              Your Body Is Worth Fighting For
            </h2>
            <p className="text-xl text-muted-foreground">
              Every day you wait is another day they're winning. Stop letting them steal your life.
            </p>

            <Card className="p-8 md:p-12 border-2 border-primary/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-2">$47</div>
                  <div className="text-muted-foreground">One-time payment • Lifetime access</div>
                </div>

                <div className="text-left space-y-3 max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Complete 21-day protocol with AI guidance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Unlimited access to AI health coach</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>All tracking and journaling tools</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Lifetime updates and improvements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  onClick={handleCTA}
                  className="text-xl px-12 py-8 w-full md:w-auto group shadow-lg hover:shadow-2xl"
                >
                  Claim Your FREE 2-Day Trial Now
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  Start FREE. No credit card needed. Cancel anytime. 30-day money-back guarantee.
                </p>
              </div>
            </Card>

            <div className="pt-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">287 people started fighting back in the last 24 hours</span>
              </div>
              
              <div className="max-w-2xl mx-auto p-6 bg-muted/50 rounded-lg border border-border">
                <p className="font-bold mb-2">Fair Warning:</p>
                <p className="text-sm text-muted-foreground">
                  This protocol works. But only if you commit. If you're looking for a magic pill or overnight fix, this isn't it. This requires 21 days of focus. But if you're ready to actually DO SOMETHING about what's stealing your life... this is your moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-bold">Aura Reset</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transform your health in 21 days with AI-powered guidance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground">Features</a></li>
                  <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">About</a></li>
                  <li><a href="#" className="hover:text-foreground">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground">Terms</a></li>
                  <li><a href="#" className="hover:text-foreground">Refunds</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>© 2024 Aura Reset Protocol. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
