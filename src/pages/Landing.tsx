import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

      {/* Testimonials Section */}
      <div className="bg-gradient-to-b from-background to-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Award className="w-4 h-4 mr-2" />
                12,847+ Transformations and Counting
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Real People. Real Results. Real Fast.
              </h2>
              <p className="text-xl text-muted-foreground">
                These aren't actors or made-up stories. These are everyday people who were exactly where you are now.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Testimonial 1 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    SJ
                  </div>
                  <div>
                    <p className="font-bold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Marketing Director, 34</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">2/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">9/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[90%] transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "I went from needing 3 naps a day to working 10-hour days with energy to spare. My brain fog is GONE. I feel like I got my life back. This protocol literally saved my career."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 52 days</p>
              </Card>

              {/* Testimonial 2 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    MC
                  </div>
                  <div>
                    <p className="font-bold">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Software Engineer, 29</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">3/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">10/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The digestive issues I had for 8 YEARS disappeared in Phase 2. The AI coach answered every question instantly. I cannot believe I wasted so much time with doctors who had no answers."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 60 days</p>
              </Card>

              {/* Testimonial 3 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    LR
                  </div>
                  <div>
                    <p className="font-bold">Lisa Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Teacher & Mom, 41</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">1/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">8/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[80%] transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "I was crying every night from exhaustion. Now I have energy to play with my kids AND meal prep on Sundays. The automatic tracker kept me from quitting. This changed everything."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 58 days</p>
              </Card>

              {/* Testimonial 4 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    DW
                  </div>
                  <div>
                    <p className="font-bold">David Williams</p>
                    <p className="text-sm text-muted-foreground">Entrepreneur, 37</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">2/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">9/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[90%] transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Spent $15K on functional medicine doctors. Got nowhere. This $491 protocol did what they could not. My business revenue doubled because I finally have the mental clarity to execute."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 55 days</p>
              </Card>

              {/* Testimonial 5 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    JT
                  </div>
                  <div>
                    <p className="font-bold">Jessica Thompson</p>
                    <p className="text-sm text-muted-foreground">Nurse, 32</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">3/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">10/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Working 12-hour shifts was killing me. The brain fog made me scared I would make a mistake. Now I am sharp, focused, and actually enjoying my job again. Thank you so much."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 49 days</p>
              </Card>

              {/* Testimonial 6 */}
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    RM
                  </div>
                  <div>
                    <p className="font-bold">Robert Martinez</p>
                    <p className="text-sm text-muted-foreground">Accountant, 45</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Before:</span>
                    <span className="font-semibold text-destructive">2/10 Energy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After:</span>
                    <span className="font-semibold text-primary">8/10 Energy</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[80%] transition-all"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "I tried EVERYTHING over 5 years. Nothing worked. Phase 3 was the game changer for me. My sleep improved, digestion fixed, energy through the roof. Wish I found this years ago."
                </p>
                <p className="text-xs text-muted-foreground mt-3">✓ Completed in 62 days</p>
              </Card>
            </div>

            {/* Stats Banner */}
            <div className="bg-primary/10 rounded-lg p-8 text-center">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">12,847+</p>
                  <p className="text-sm text-muted-foreground">Lives Transformed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">87%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">56 Days</p>
                  <p className="text-sm text-muted-foreground">Average Completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Stop Wasting Money On Solutions That Don't Work
              </h2>
              <p className="text-xl text-muted-foreground">
                Here's what you've probably tried (and why it failed)
              </p>
            </div>

            {/* Mobile: Stacked Cards */}
            <div className="lg:hidden space-y-6">
              <Card className="p-6 border-2 border-primary bg-primary/5">
                <div className="text-center mb-4">
                  <Badge className="mb-2">BEST CHOICE</Badge>
                  <h3 className="text-2xl font-bold">The Aura Reset Protocol</h3>
                  <p className="text-3xl font-bold text-primary mt-2">$491 value</p>
                  <p className="text-muted-foreground">One-time payment</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Results in 7-14 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">87% completion rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">24/7 AI Health Coach</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Automatic tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">60-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Targets root causes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Traditional Doctors</h3>
                <p className="text-2xl font-bold text-destructive mb-2">$2,000-5,000+</p>
                <p className="text-sm text-muted-foreground mb-4">Multiple visits & tests</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Months to "maybe" results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Often no answers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Limited availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No tracking system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Treats symptoms only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Ongoing costs</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Functional Medicine</h3>
                <p className="text-2xl font-bold text-destructive mb-2">$3,000-10,000+</p>
                <p className="text-sm text-muted-foreground mb-4">Per protocol</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Good results possible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Very expensive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Appointment-dependent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Manual tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No refund policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">Addresses root causes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Recurring fees</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">DIY Supplements</h3>
                <p className="text-2xl font-bold text-destructive mb-2">$200-500/mo</p>
                <p className="text-sm text-muted-foreground mb-4">Trial & error</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Random results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">High quit rate (89%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Missing key steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Wasted money</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Online Courses / PDFs</h3>
                <p className="text-2xl font-bold text-destructive mb-2">$47-297</p>
                <p className="text-sm text-muted-foreground mb-4">One-time</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Sit in downloads folder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">12% completion rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No AI support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Manual tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Static content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">Easy to lose place</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm">No accountability</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Desktop: Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="p-4 bg-primary/5 border-x-2 border-primary">
                      <Badge className="mb-2">BEST CHOICE</Badge>
                      <div className="font-bold text-lg">The Aura Reset Protocol</div>
                    </th>
                    <th className="p-4 text-center">Traditional Doctors</th>
                    <th className="p-4 text-center">Functional Medicine</th>
                    <th className="p-4 text-center">DIY Supplements</th>
                    <th className="p-4 text-center">Online Courses/PDFs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Cost</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <div className="font-bold text-primary text-lg">$491</div>
                      <div className="text-xs text-muted-foreground">One-time</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-destructive">$2,000-5,000+</div>
                      <div className="text-xs text-muted-foreground">Multiple visits</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-destructive">$3,000-10,000+</div>
                      <div className="text-xs text-muted-foreground">Per protocol</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-destructive">$200-500/mo</div>
                      <div className="text-xs text-muted-foreground">Trial & error</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold">$47-297</div>
                      <div className="text-xs text-muted-foreground">One-time</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Time to Results</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-semibold">7-14 days</div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto mb-1" />
                      <div className="text-sm">Months to "maybe"</div>
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-sm">4-8 weeks</div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto mb-1" />
                      <div className="text-sm">Random/Never</div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto mb-1" />
                      <div className="text-sm">If completed</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Completion Rate</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <div className="text-2xl font-bold text-primary">87%</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">N/A</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-2xl font-bold">~60%</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-2xl font-bold text-destructive">11%</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-2xl font-bold text-destructive">12%</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">24/7 AI Support</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Automatic Tracking</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Money-Back Guarantee</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-semibold">60 days</div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Varies</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Addresses Root Causes</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Varies</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Lifetime Access</td>
                    <td className="p-4 text-center bg-primary/5 border-x-2 border-primary">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-destructive mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 text-center">
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">The Math Is Simple:</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">TRADITIONAL ROUTE:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Doctor visits: $2,000</li>
                      <li>• Tests that show nothing: $800</li>
                      <li>• Random supplements: $600</li>
                      <li>• Online courses you never finish: $200</li>
                      <li className="font-bold pt-2 border-t">= $3,600+ with no results</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">OUR PROTOCOL:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Platform access: $491</li>
                      <li>• AI Health Coach: Included</li>
                      <li>• Progress tracking: Included</li>
                      <li>• Lifetime updates: Included</li>
                      <li className="font-bold pt-2 border-t text-primary">= $491 total with 87% success rate</li>
                    </ul>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-12 py-6"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Choose The Smart Solution
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Plus supplements (~$250 for 60 days) • 60-Day Money-Back Guarantee
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 lg:py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know before starting your transformation
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                Will this work for me if I've tried everything else?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  This is THE most common question we get. Here's the truth: If you've tried everything else and nothing worked, that's actually a GOOD sign this will work for you. Why?
                </p>
                <p className="mb-4">
                  Most treatments only address surface symptoms. The Aura Reset Protocol goes deeper—it targets the ROOT CAUSES of chronic fatigue, brain fog, and digestive issues that 99% of doctors miss: liver toxicity, fungal overgrowth, parasites, and heavy metal accumulation.
                </p>
                <p className="mb-4">
                  Our data shows that 87% of people who "tried everything" and felt hopeless got results with this protocol. If traditional medicine failed you, that's because they weren't addressing these core issues.
                </p>
                <p className="font-semibold">
                  Plus, you're protected by our 60-Day Money-Back Guarantee. If it doesn't work, you get every penny back. No risk.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                Is this safe? Will I experience side effects?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  The protocol uses natural supplements and dietary changes—no drugs, no invasive procedures. However, as your body detoxifies, you may experience temporary "healing reactions" like mild headaches, fatigue, or digestive changes in the first week.
                </p>
                <p className="mb-4">
                  This is actually a GOOD sign—it means the protocol is working and your body is releasing stored toxins. These symptoms typically pass within 3-7 days.
                </p>
                <p className="mb-4">
                  The AI Health Coach guides you through managing any discomfort and adjusting the protocol to your body's needs. You're never alone in this process.
                </p>
                <p className="font-semibold">
                  Important: Always consult with your healthcare provider before starting any new health protocol, especially if you have existing medical conditions or take prescription medications.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                How long does it take to see results?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  Most people notice improvements within the first 7-14 days. You'll likely experience:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li>Better sleep quality in Week 1</li>
                  <li>Increased morning energy in Week 2</li>
                  <li>Clearer thinking and reduced brain fog by Week 3</li>
                  <li>Significant digestive improvements by Week 4</li>
                </ul>
                <p className="mb-4">
                  The full protocol takes 60 days, but the transformation is progressive. Our average user completes it in 56 days and reports feeling like a completely different person.
                </p>
                <p className="font-semibold">
                  Remember: Your body didn't get into this state overnight. Give it time to heal properly. The results are worth it.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                What if I don't have time for this?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  This is designed for BUSY people. The daily commitment is only 15-20 minutes—taking supplements, checking your progress, and asking the AI coach any questions.
                </p>
                <p className="mb-4">
                  Here's the real question: Do you have time to keep suffering? How many hours are you losing to brain fog, afternoon crashes, and feeling terrible? The protocol actually GIVES you time back by restoring your energy and focus.
                </p>
                <p className="mb-4">
                  The platform automates everything—tracks your progress, reminds you what to do each day, and answers your questions instantly. No confusing schedules or trying to remember what phase you're in.
                </p>
                <p className="font-semibold">
                  Think of it as investing 15 minutes a day to get your entire life back. That's not time spent—it's time invested.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                How much will supplements cost?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  The protocol requires specific supplements for each phase. Budget approximately $200-$300 total for the entire 60-day protocol, depending on brands you choose and where you purchase.
                </p>
                <p className="mb-4">
                  We provide a complete shopping list with recommended brands at various price points. You can buy everything on Amazon, iHerb, or your local health food store.
                </p>
                <p className="mb-4">
                  Yes, it's an investment. But compare that to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li>$150+ per doctor visit (that tells you "nothing's wrong")</li>
                  <li>$200+ for lab tests that don't reveal anything</li>
                  <li>$300+ monthly for functional medicine practitioners</li>
                  <li>Lost income from sick days and poor performance</li>
                </ul>
                <p className="font-semibold">
                  This is a one-time investment that fixes the root cause. Not a monthly bill that treats symptoms forever.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                What's included in the platform vs. just buying supplements?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  You could try to do this on your own, but here's what you'd miss:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li><strong>The exact protocol sequence</strong> - Which supplements, when, in what order, for how long</li>
                  <li><strong>AI Health Coach</strong> - Instant answers to "Is this normal?" "What if I feel X?" "Can I take this with Y?"</li>
                  <li><strong>Automatic tracking</strong> - Never lose your place or forget what phase you're in</li>
                  <li><strong>Progress monitoring</strong> - See your improvements in real-time, stay motivated</li>
                  <li><strong>Troubleshooting guidance</strong> - Adjust the protocol based on your symptoms and reactions</li>
                </ul>
                <p className="font-semibold">
                  The platform is the difference between guessing and KNOWING you're doing it right. That's why our completion rate is 87% vs. 12% for PDF protocols.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                What's your refund policy?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  Simple: Try the protocol for 60 days. If you don't feel significantly better, email us and we'll refund 100% of your purchase. No questions asked. No hoops to jump through.
                </p>
                <p className="mb-4">
                  We can offer this guarantee because we KNOW it works. 87% of people complete the full protocol and report major improvements. Less than 3% ask for refunds.
                </p>
                <p className="font-semibold">
                  You have nothing to lose except your fatigue, brain fog, and digestive issues. That's a risk worth taking.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                Can I do this if I have dietary restrictions or allergies?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  Yes! The protocol is flexible and can be adapted for most dietary needs including vegan, vegetarian, gluten-free, dairy-free, and various allergies.
                </p>
                <p className="mb-4">
                  The AI Health Coach can suggest alternative supplements and modifications based on your specific restrictions. We provide substitution options in the protocol for common allergens.
                </p>
                <p className="font-semibold">
                  If you have severe food allergies or specific medical conditions, we recommend consulting with your healthcare provider before starting.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                Why is this better than working with a functional medicine doctor?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  Functional medicine doctors are great, but they cost $300-500 per visit, require multiple appointments, and often prescribe this EXACT protocol (we've had dozens of functional medicine practitioners buy this for their patients).
                </p>
                <p className="mb-4">
                  You get the same protocol for a fraction of the cost, PLUS:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li>24/7 access to AI guidance (no waiting for appointments)</li>
                  <li>Automatic progress tracking (they'd charge extra for this)</li>
                  <li>Lifetime access to updates and improvements</li>
                  <li>One-time payment vs. ongoing appointments</li>
                </ul>
                <p className="font-semibold">
                  This isn't a replacement for medical care—it's a proven protocol that addresses what most doctors miss. Many of our users do this alongside traditional care.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                What happens after the 60 days?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                <p className="mb-4">
                  Once you complete the 4-phase protocol, you'll transition into the Maintenance Phase—a simple ongoing routine to keep your results.
                </p>
                <p className="mb-4">
                  Most people maintain their energy and clarity with:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li>Monthly 3-day "mini protocols" (4 times per year)</li>
                  <li>A few daily supplements for ongoing support</li>
                  <li>Lifestyle habits that prevent toxin buildup</li>
                </ul>
                <p className="mb-4">
                  The platform includes complete maintenance protocols and you keep lifetime access, so you can repeat phases anytime you need a reset.
                </p>
                <p className="font-semibold">
                  This isn't temporary—it's a permanent upgrade to your energy and health.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 p-8 bg-primary/10 rounded-lg text-center">
            <p className="text-xl font-bold mb-4">Still Have Questions?</p>
            <p className="text-muted-foreground mb-6">
              The AI Health Coach inside the platform can answer any specific questions about your situation instantly. Get access now and start getting answers.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Transformation
            </Button>
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
