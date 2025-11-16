import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_KEY = 'aura-protocol-tour-completed';

export const resetTour = () => {
  localStorage.removeItem(TOUR_KEY);
};

interface TourStep {
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to The Aura Reset Protocol",
    description: "Let me show you around! This interactive tour will guide you through all the features to help you succeed on your 28-day healing journey.",
    target: 'body',
    position: 'center',
  },
  {
    title: "Protocol Navigation",
    description: "This sidebar contains your complete protocol guide. Navigate through phases, daily schedules, supplement lists, and troubleshooting. Everything you need is organized here by phase and topic.",
    target: '.protocol-nav, nav, aside',
    position: 'right',
    highlightPadding: 8,
  },
  {
    title: "Your Health Journal with Aurora",
    description: "This is your personal AI health coach! Chat with Aurora anytime - ask about symptoms, get recipe ideas, or request daily motivation. She knows where you are in the protocol and tailors guidance to your current phase.",
    target: '.chat-panel, [class*="chat"]',
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

  useEffect(() => {
    const hasCompleted = localStorage.getItem(TOUR_KEY);
    if (!hasCompleted) {
      setTimeout(() => setIsActive(true), 800);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updateHighlight = () => {
      const step = tourSteps[currentStep];
      if (!step) return;

      if (step.position === 'center') {
        setHighlightRect(null);
        return;
      }

      // Try multiple selectors
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
    return () => window.removeEventListener('resize', updateHighlight);
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsActive(false);
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const padding = step.highlightPadding || 0;

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/70 z-[100] animate-fade-in" onClick={handleSkip} />

      {/* Spotlight effect */}
      {highlightRect && (
        <div
          className="fixed z-[101] pointer-events-none transition-all duration-500 ease-out"
          style={{
            top: highlightRect.top - padding,
            left: highlightRect.left - padding,
            width: highlightRect.width + padding * 2,
            height: highlightRect.height + padding * 2,
            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '12px',
          }}
        />
      )}

      {/* Tour card */}
      <Card
        className={cn(
          "fixed z-[102] w-full max-w-md p-6 shadow-2xl animate-scale-in bg-background/95 backdrop-blur-lg border-2 border-primary/30",
          step.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          step.position === 'top' && highlightRect && "bottom-auto",
          step.position === 'bottom' && highlightRect && "top-auto",
          step.position === 'left' && highlightRect && "right-auto",
          step.position === 'right' && highlightRect && "left-auto"
        )}
        style={
          highlightRect && step.position !== 'center'
            ? {
                ...(step.position === 'right' && {
                  left: highlightRect.right + padding + 24,
                  top: highlightRect.top + highlightRect.height / 2,
                  transform: 'translateY(-50%)',
                }),
                ...(step.position === 'left' && {
                  right: window.innerWidth - highlightRect.left + padding + 24,
                  top: highlightRect.top + highlightRect.height / 2,
                  transform: 'translateY(-50%)',
                }),
                ...(step.position === 'bottom' && {
                  top: highlightRect.bottom + padding + 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }),
                ...(step.position === 'top' && {
                  bottom: window.innerHeight - highlightRect.top + padding + 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }),
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={handleSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1">
              {currentStep === tourSteps.length - 1 ? "Let's Go!" : "Next"}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
