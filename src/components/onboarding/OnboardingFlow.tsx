import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, Calendar, Brain, Heart, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ONBOARDING_KEY = 'aura-protocol-onboarding-completed';

export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
};

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to the Aura Reset Protocol",
    description: "Your 28-day journey to transformation through food-as-medicine",
    icon: <Heart className="w-12 h-12 text-primary" />,
    content: [
      "The Aura Reset Protocol is a comprehensive 28-day detox program",
      "Heal your body using food, supplements, and targeted detox protocols",
      "Address root causes of illness - from depression to autoimmune conditions",
      "Guided every step by Aurora, your AI nutritionist and health coach"
    ]
  },
  {
    title: "The 4 Phases of Healing",
    description: "Each week targets a specific layer of toxicity",
    icon: <Calendar className="w-12 h-12 text-primary" />,
    content: [
      "PHASE 1 (Days 1-7): Liver Support - Opening bile flow and detox pathways",
      "PHASE 2 (Days 8-14): Fungal & Viral - Targeting candida and viral overgrowth",
      "PHASE 3 (Days 15-21): Parasites - Addressing parasitic infections",
      "PHASE 4 (Days 22-28): Heavy Metals & Mold - Removing deep toxicity"
    ]
  },
  {
    title: "Meet Aurora - Your Guide",
    description: "An authoritative nutritionist trained in food-as-medicine healing",
    icon: <Brain className="w-12 h-12 text-primary" />,
    content: [
      "Aurora understands how food cures disease with the authority of Dr. Hyman and Dr. Huberman",
      "She'll provide phase-specific guidance, recipes, and motivation",
      "Ask her anything: symptoms, supplement timing, food recommendations",
      "She's hyper-observant and will spot patterns in your journey"
    ]
  },
  {
    title: "Key Features",
    description: "Everything you need for success",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    content: [
      "Daily Motivation: Get personalized encouragement each morning",
      "AI Insights: Automatic pattern recognition every 5 messages",
      "Progress Tracking: Advance through days and phases at your pace",
      "Journal History: Export and review your entire healing journey"
    ]
  },
  {
    title: "Remember: BINDERS Are Key",
    description: "The most critical element of successful detox",
    icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
    content: [
      "Take activated charcoal or bentonite clay daily",
      "ALWAYS take binders 2 hours away from food and supplements",
      "Binders capture toxins so they leave your body instead of recirculating",
      "Without binders, detox symptoms can be intense and dangerous"
    ]
  }
];

export const OnboardingFlow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      // Small delay to let the app render first
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {step.icon}
            <span>{step.title}</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <Progress value={progress} className="w-full" />
          
          <Card className="p-6 bg-muted/50">
            <ul className="space-y-4">
              {step.content.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                Skip Tutorial
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {onboardingSteps.length}
              </span>
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStep < onboardingSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Start Your Journey"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};