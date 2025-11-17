import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        // If already logged in, redirect to protocol
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

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Transformation",
      description: "Reset your mindset and energy in minutes with our proven protocol"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Science-Backed Methods",
      description: "Built on psychological principles and tested strategies"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Sustainable Growth",
      description: "Create lasting change with daily practices that compound"
    }
  ];

  const benefits = [
    "Complete step-by-step reset protocol",
    "Interactive AI chat guidance",
    "Progress tracking and insights",
    "Lifetime access to updates",
    "Mobile-optimized experience"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
            The Aura Reset Protocol
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transform your mental state and unlock your full potential with our revolutionary reset system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What You'll Get</h2>
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">One-Time Payment</p>
                <p className="text-muted-foreground mb-6">Lifetime access, no subscriptions</p>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-12 py-6 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
                >
                  Start Your Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 The Aura Reset Protocol. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
