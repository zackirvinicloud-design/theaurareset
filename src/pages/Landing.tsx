import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, MessageSquare, LineChart, Brain, Shield, Zap, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    window.location.href = "https://whop.com/checkout/plan_CUGZlF5JjekWR";
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
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="mx-auto gap-2 px-4 py-2">
            <Sparkles className="w-4 h-4" />
            AI-Powered 21-Day Transformation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Transform Your Health in{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              21 Days
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            The only AI-powered protocol that guides you step-by-step through a scientifically-designed cleanse—personalized to your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-lg px-8 py-6 group"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>12,847+ success stories</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">12,847+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">21</div>
              <div className="text-sm text-muted-foreground">Days to Transform</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">97%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlike other programs, we give you the exact tools and support to transform your health—not just information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Health Coach</h3>
              <p className="text-muted-foreground mb-4">
                24/7 personalized guidance powered by advanced AI. Get instant answers to your questions and real-time protocol adjustments.
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
              <h3 className="text-xl font-bold mb-3">4-Phase Protocol</h3>
              <p className="text-muted-foreground mb-4">
                Scientifically designed phases that build on each other. Each phase targets specific health improvements in the right sequence.
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
                Simple Process, Powerful Results
              </h2>
              <p className="text-xl text-muted-foreground">
                Getting started takes less than 2 minutes. Here's how it works:
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sign Up Free</h3>
                  <p className="text-muted-foreground text-lg">
                    Create your account in 30 seconds. No credit card required to start your 7-day free trial.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-lg">
                    Tell our AI about your current symptoms and health goals. This takes 2 minutes and personalizes your entire experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Follow Your Daily Protocol</h3>
                  <p className="text-muted-foreground text-lg">
                    Each day, you'll get clear instructions. Your AI coach guides you through every step, answers questions, and adjusts based on your progress.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Watch Your Transformation</h3>
                  <p className="text-muted-foreground text-lg">
                    Track your energy, mental clarity, and overall wellness as you progress. Most users feel significant improvements by day 14.
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
              Real People, Real Results
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who've transformed their health in just 21 days
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
                "I went from needing 2-3 naps daily to working full 8-hour days with energy to spare. The AI coach made it so easy to stay on track."
              </p>
              <div className="font-semibold">Sarah M.</div>
              <div className="text-sm text-muted-foreground">Product Manager</div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Brain fog completely gone. I can think clearly again, remember things, and my productivity has doubled. This protocol actually works."
              </p>
              <div className="font-semibold">Michael R.</div>
              <div className="text-sm text-muted-foreground">Software Engineer</div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "After years of digestive issues and trying everything, I finally found relief. The step-by-step guidance was exactly what I needed."
              </p>
              <div className="font-semibold">Jennifer K.</div>
              <div className="text-sm text-muted-foreground">Teacher</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-gradient-to-b from-background to-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Start Your Transformation Today
            </h2>
            <p className="text-xl text-muted-foreground">
              Limited-time offer: Get full access for less than the cost of a daily coffee
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
                  className="text-xl px-12 py-8 w-full md:w-auto group"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  Try it free for 7 days. Cancel anytime, full refund within 30 days.
                </p>
              </div>
            </Card>

            <div className="pt-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">287 people started their protocol in the last 24 hours</span>
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
