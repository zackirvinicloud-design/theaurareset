import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const DEFAULT_TOUR_KEY = 'gut-brain-journal-tour-v2-completed';

export const resetTour = (key: string = DEFAULT_TOUR_KEY) => {
  localStorage.removeItem(key);
};

interface TourStep {
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

function resolveTarget(step: TourStep) {
  const selectors = step.target.split(',').map((selector) => selector.trim());

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

const mobileTourSteps: TourStep[] = [
  {
    title: "Welcome to The Gut Brain Journal",
    description: "This tour shows the shortest path to value: what to do today, where to get help, and where the full protocol lives.",
    target: 'body',
    position: 'center',
  },
  {
    title: "Move Day By Day",
    description: "Use Previous day and Next day here to move through the reset. The gear holds export, clear, and sign out so the top bar stays clean.",
    target: '[data-tour=\"day-controls\"]',
    position: 'bottom',
    highlightPadding: 10,
  },
  {
    title: "Open Today's Plan",
    description: "Tap Plan to open today's exact checklist. This is the action layer of the app: tap any item for context, then check it off when done.",
    target: '[data-tour=\"mobile-plan-nav\"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    title: "Use Today As Your Workspace",
    description: "This is where you ask questions, get meal or supplement help, and quickly log symptoms or mood without leaving the flow.",
    target: '[data-tour=\"today-actions\"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    title: "Guide Gives The Why",
    description: "Tap Guide when you want the brief, phase roadmap, and tips. If you ever want this walkthrough again, restart it from Start.",
    target: '[data-tour=\"mobile-guide-nav\"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    title: "Full References Stay One Tap Away",
    description: "Use Shop for the full shopping list and Protocol for the original written protocol. Those are references, not your main workflow.",
    target: '[data-tour=\"mobile-resource-nav\"]',
    position: 'top',
    highlightPadding: 10,
  },
];

const tourSteps: TourStep[] = [
  {
    title: "Welcome to The Gut Brain Journal",
    description: "This quick walkthrough shows the core loop: move day by day, follow today's plan, ask for help when stuck, and keep the full references nearby.",
    target: 'body',
    position: 'center',
  },
  {
    title: "Move Day By Day",
    description: "Use Previous day and Next day here to move through the reset. The gear now holds export, clear, and sign out.",
    target: '[data-tour=\"day-controls\"]',
    position: 'bottom',
    highlightPadding: 10,
  },
  {
    title: "Open Today's Plan",
    description: "This panel is today's exact checklist. Tap any step when you want the AI to explain it in plain English, then check it off when done.",
    target: '[data-tour=\"today-plan\"]',
    position: 'right',
    highlightPadding: 10,
  },
  {
    title: "Use Today As Your Workspace",
    description: "Ask questions here, get meal or supplement guidance, and use the quick actions to log symptoms or mood without breaking your flow.",
    target: '[data-tour=\"today-actions\"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    title: "Guide Gives The Why",
    description: "Guide is where you get the brief, the phase roadmap, and the tips. Start also lets you reopen the tutorial whenever you want a reset.",
    target: '[data-tour=\"guide-panel\"], [data-tour=\"guide-toggle\"]',
    position: 'left',
    highlightPadding: 10,
  },
  {
    title: "References Stay Nearby",
    description: "Use Shop for the full shopping list and Protocol for the original written protocol. Keep those as references while today's plan stays your main workflow.",
    target: '[data-tour=\"shopping-trigger\"], [data-tour=\"protocol-trigger\"], [data-tour=\"guide-panel\"], [data-tour=\"guide-toggle\"]',
    position: 'left',
    highlightPadding: 10,
  },
];

interface InteractiveTourProps {
  completionKey?: string;
  startToken?: number;
}

export const InteractiveTour = ({
  completionKey = DEFAULT_TOUR_KEY,
  startToken = 0,
}: InteractiveTourProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();
  const steps = useMemo(() => (isMobile ? mobileTourSteps : tourSteps), [isMobile]);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(completionKey);
    if (!hasCompleted) {
      setTimeout(() => setIsActive(true), 800);
    }
  }, [completionKey]);

  useEffect(() => {
    if (startToken <= 0) return;
    setCurrentStep(0);
    setIsActive(true);
  }, [startToken]);

  useEffect(() => {
    if (!isActive) return;

    const updateHighlight = () => {
      const step = steps[currentStep];
      if (!step) return;

      if (step.position === 'center') {
        setHighlightRect(null);
        return;
      }

      const element = resolveTarget(step);

      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    };

    const step = steps[currentStep];
    const element = step ? resolveTarget(step) : null;

    if (isMobile && step && step.position !== 'center' && element instanceof HTMLElement) {
      const rect = element.getBoundingClientRect();
      const cardClearance = 230;
      const shouldScrollUp = rect.top < 72;
      const shouldScrollDown = rect.bottom > window.innerHeight - cardClearance;

      if (shouldScrollUp || shouldScrollDown) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: shouldScrollUp ? 'start' : 'center',
          inline: 'nearest',
        });
      }
    }

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    document.addEventListener('scroll', updateHighlight, true);

    const settleTimer = window.setTimeout(updateHighlight, isMobile ? 280 : 120);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      document.removeEventListener('scroll', updateHighlight, true);
      window.clearTimeout(settleTimer);
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
    localStorage.setItem(completionKey, 'true');
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

  const getMobileCardStyle = (step: TourStep, rect: DOMRect | null): CSSProperties => {
    const inset = 12;
    const shared = {
      left: inset,
      right: inset,
    };

    if (!rect || step.position === 'center') {
      return {
        ...shared,
        top: '50%',
        transform: 'translateY(-50%)',
      };
    }

    const targetMidpoint = rect.top + rect.height / 2;
    const placeAboveTarget = targetMidpoint > window.innerHeight * 0.55;

    if (placeAboveTarget) {
      return {
        ...shared,
        top: 'calc(env(safe-area-inset-top, 0px) + 72px)',
      };
    }

    return {
      ...shared,
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
    };
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const highlightPadding = step.highlightPadding || 0;

  // Mobile: Spotlight card anchored away from the target
  if (isMobile) {
    const mobileCardStyle = getMobileCardStyle(step, highlightRect);

    return (
      <>
        <div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            background: highlightRect
              ? `
                radial-gradient(
                  ellipse at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px,
                  transparent 0%,
                  transparent ${Math.max(highlightRect.width, highlightRect.height) / 2}px,
                  rgba(0, 0, 0, 0.68) ${Math.max(highlightRect.width, highlightRect.height) / 2 + 88}px,
                  rgba(0, 0, 0, 0.82) 100%
                )
              `
              : 'rgba(0, 0, 0, 0.68)',
            transition: 'background 0.3s ease-in-out',
          }}
        />

        {highlightRect && (
          <div
            className="fixed z-[9999] pointer-events-none rounded-2xl border-2 border-primary transition-all duration-300"
            style={{
              left: `${highlightRect.left - highlightPadding}px`,
              top: `${highlightRect.top - highlightPadding}px`,
              width: `${highlightRect.width + highlightPadding * 2}px`,
              height: `${highlightRect.height + highlightPadding * 2}px`,
              boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.18), 0 0 24px rgba(16, 185, 129, 0.35)',
            }}
          />
        )}

        <Card
          className="fixed z-[10000] border-2 border-primary/70 bg-[hsl(var(--background)/0.94)] shadow-[0_24px_60px_rgba(15,23,42,0.28)] supports-[backdrop-filter]:bg-[hsl(var(--background)/0.78)] supports-[backdrop-filter]:backdrop-blur-xl"
          style={mobileCardStyle}
        >
          <div className="p-5">
            <div className="mb-4 flex justify-center gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="mt-2 w-full text-xs text-muted-foreground"
            >
              Skip tour
            </Button>
          </div>
        </Card>
      </>
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
            left: `${highlightRect.left - highlightPadding}px`,
            top: `${highlightRect.top - highlightPadding}px`,
            width: `${highlightRect.width + highlightPadding * 2}px`,
            height: `${highlightRect.height + highlightPadding * 2}px`,
            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.4)',
          }}
        />
      )}

      {/* Tour Card */}
      <Card 
        className="fixed z-[10000] w-[380px] border-2 border-primary/70 bg-[hsl(var(--background)/0.95)] shadow-[0_24px_60px_rgba(15,23,42,0.28)] transition-all duration-300 supports-[backdrop-filter]:bg-[hsl(var(--background)/0.82)] supports-[backdrop-filter]:backdrop-blur-xl"
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
