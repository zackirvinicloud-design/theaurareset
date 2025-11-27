import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const TOUR_KEY = 'gut-brain-journal-tour-completed';

export const resetTour = () => {
  localStorage.removeItem(TOUR_KEY);
};

interface TourStep {
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

// Simplified mobile-only steps
const mobileTourSteps: TourStep[] = [
  {
    title: "Welcome to The Gut Brain Journal! 🌟",
    description: "This quick tour will show you everything you need to succeed on your 28-day healing journey.",
    target: 'body',
    position: 'center',
  },
  {
    title: "📱 Chat with Aurora",
    description: "Tap the chat icon at the bottom to talk with Aurora, your AI health coach. She's available 24/7 to answer questions and provide guidance based on your current phase.",
    target: 'body',
    position: 'center',
  },
  {
    title: "📖 Protocol Guide",
    description: "Use the menu button (☰) to access your complete protocol. Find daily schedules, supplement lists, recipes, and troubleshooting guides organized by phase.",
    target: 'body',
    position: 'center',
  },
  {
    title: "✨ AI Insights",
    description: "Aurora analyzes your journal every 5 messages, spotting patterns and progress. Check the insights section in your chat to see what she's discovered.",
    target: 'body',
    position: 'center',
  },
  {
    title: "📊 Track Your Progress",
    description: "Your progress card in the chat shows which day and phase you're on. Use the buttons to advance days or adjust your position in the protocol.",
    target: 'body',
    position: 'center',
  },
  {
    title: "Ready to Begin! 🚀",
    description: "Remember: Take binders 2 hours away from food, stay hydrated, and trust the process. Aurora is here to guide you every step of the way!",
    target: 'body',
    position: 'center',
  },
];

// Desktop tour steps with spotlight
const tourSteps: TourStep[] = [
  {
    title: "Welcome to The Gut Brain Journal",
    description: "Let me show you around! This interactive tour will guide you through all the features to help you succeed on your 28-day healing journey.",
    target: 'body',
    position: 'center',
  },
  {
    title: "Protocol Navigation",
    description: "This sidebar contains your complete protocol guide. Navigate through phases, daily schedules, supplement lists, and troubleshooting. Everything you need is organized here by phase and topic.",
    target: '.protocol-nav, nav, aside, button[aria-label="Open menu"], button:has(svg.lucide-menu)',
    position: 'right',
    highlightPadding: 8,
  },
  {
    title: "Your Health Journal with Aurora",
    description: "This is your personal AI health coach! Chat with Aurora anytime - ask about symptoms, get recipe ideas, or request daily motivation. She knows where you are in the protocol and tailors guidance to your current phase.",
    target: '.chat-panel, [class*="chat"], .fixed.bottom-0.left-0.right-0',
    position: 'left',
    highlightPadding: 8,
  },
  {
    title: "AI Insights - Pattern Recognition",
    description: "Aurora automatically analyzes your journal entries every 5 messages. She spots patterns you might miss - symptom triggers, progress indicators, and areas needing attention. Click the sparkles icon to view insights anytime.",
    target: 'button[title*="insights" i], button:has(.lucide-sparkles)',
    position: 'bottom',
    highlightPadding: 12,
  },
  {
    title: "Progress Tracking",
    description: "Track your journey through all 28 days and 4 phases. Use 'Next' to advance days, or click the settings icon to jump to any day. Aurora always knows your current phase and provides phase-specific guidance.",
    target: '.progress-card, [class*="progress"]',
    position: 'bottom',
    highlightPadding: 8,
  },
  {
    title: "Journal History & Export",
    description: "Access your complete chat history and export your journal anytime. Track your progress over time and keep a record of your healing journey.",
    target: 'button[title*="history" i], button[title*="export" i]',
    position: 'bottom',
    highlightPadding: 12,
  },
  {
    title: "You're All Set!",
    description: "Remember: Take binders 2 hours away from food. Stay hydrated. Trust the process. Aurora is here 24/7 to guide you. Start by asking 'What should I do today?' - she's got you covered!",
    target: 'body',
    position: 'center',
  },
];

export const InteractiveTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();
  
  const steps = isMobile ? mobileTourSteps : tourSteps;

  useEffect(() => {
    const hasCompleted = localStorage.getItem(TOUR_KEY);
    if (!hasCompleted) {
      setTimeout(() => setIsActive(true), 800);
    }
  }, []);

  // Desktop-only highlight logic
  useEffect(() => {
    if (!isActive || isMobile) return;

    const updateHighlight = () => {
      const step = steps[currentStep];
      if (!step) return;

      if (step.position === 'center') {
        setHighlightRect(null);
        return;
      }

      const selectors = step.target.split(',').map(s => s.trim());
      let element: Element | null = null;

      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [currentStep, isActive, isMobile, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsActive(false);
  };

  const getCardPosition = (step: TourStep, rect: DOMRect | null) => {
    if (!rect || step.position === 'center') {
      return {
        x: window.innerWidth / 2 - 190,
        y: window.innerHeight / 2 - 100,
      };
    }

    const padding = 20;
    let x = 0;
    let y = 0;

    switch (step.position) {
      case 'right':
        x = Math.min(rect.right + padding, window.innerWidth - 380 - padding);
        y = Math.max(padding, Math.min(rect.top, window.innerHeight - 200 - padding));
        break;
      case 'left':
        x = Math.max(padding, rect.left - 380 - padding);
        y = Math.max(padding, Math.min(rect.top, window.innerHeight - 200 - padding));
        break;
      case 'bottom':
        x = Math.max(padding, Math.min(rect.left, window.innerWidth - 380 - padding));
        y = Math.min(rect.bottom + padding, window.innerHeight - 200 - padding);
        break;
      case 'top':
        x = Math.max(padding, Math.min(rect.left, window.innerWidth - 380 - padding));
        y = Math.max(padding, rect.top - 200 - padding);
        break;
    }

    return { x, y };
  };

  if (!isActive) return null;

  const step = steps[currentStep];

  // Mobile: Simple bottom sheet
  if (isMobile) {
    return (
      <Sheet open={isActive} onOpenChange={(open) => !open && handleComplete()}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl p-6">
          <div className="space-y-4">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === currentStep 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Skip button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="w-full text-xs text-muted-foreground"
            >
              Skip tour
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Spotlight with positioning
  const cardPosition = getCardPosition(step, highlightRect);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ 
          background: highlightRect 
            ? `
              radial-gradient(
                ellipse at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px,
                transparent 0%,
                transparent ${Math.max(highlightRect.width, highlightRect.height) / 2}px,
                rgba(0, 0, 0, 0.7) ${Math.max(highlightRect.width, highlightRect.height) / 2 + 100}px,
                rgba(0, 0, 0, 0.8) 100%
              )
            `
            : 'rgba(0, 0, 0, 0.6)',
          transition: 'background 0.3s ease-in-out',
        }}
      />

      {/* Highlight box */}
      {highlightRect && (
        <div
          className="fixed z-[9999] pointer-events-none border-2 border-primary rounded-lg transition-all duration-300"
          style={{
            left: `${highlightRect.left - (step.highlightPadding || 0)}px`,
            top: `${highlightRect.top - (step.highlightPadding || 0)}px`,
            width: `${highlightRect.width + (step.highlightPadding || 0) * 2}px`,
            height: `${highlightRect.height + (step.highlightPadding || 0) * 2}px`,
            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.4)',
          }}
        />
      )}

      {/* Tour Card */}
      <Card 
        className="fixed z-[10000] w-[380px] bg-card border-2 border-primary shadow-2xl transition-all duration-300"
        style={{
          left: `${cardPosition.x}px`,
          top: `${cardPosition.y}px`,
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {step.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 w-8 rounded-full transition-all duration-300",
                    idx === currentStep 
                      ? "bg-primary" 
                      : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? "Get Started!" : "Next"}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
