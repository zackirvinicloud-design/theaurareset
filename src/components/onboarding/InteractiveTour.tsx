import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Simplified mobile-only steps
const mobileTourSteps: TourStep[] = [
  {
    title: "Welcome to The Aura Reset Protocol! 🌟",
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
    target: '.protocol-nav, nav, aside, button[aria-label="Open menu"], button:has(svg.lucide-menu)',
    position: 'right',
    highlightPadding: 8,
    openMenuOnMobile: true,
  },
  {
    title: "Your Health Journal with Aurora",
    description: "This is your personal AI health coach! Chat with Aurora anytime - ask about symptoms, get recipe ideas, or request daily motivation. She knows where you are in the protocol and tailors guidance to your current phase.",
    target: '.chat-panel, [class*="chat"], .fixed.bottom-0.left-0.right-0',
    position: 'left',
    highlightPadding: 8,
    openChatOnMobile: true,
  },
  {
    title: "AI Insights - Pattern Recognition",
    description: "Aurora automatically analyzes your journal entries every 5 messages. She spots patterns you might miss - symptom triggers, progress indicators, and areas needing attention. Click the sparkles icon to view insights anytime.",
    target: 'button[title*="insights" i], button:has(.lucide-sparkles)',
    position: 'bottom',
    highlightPadding: 12,
    openChatOnMobile: true,
  },
  {
    title: "Progress Tracking",
    description: "Track your journey through all 28 days and 4 phases. Use 'Next' to advance days, or click the settings icon to jump to any day. Aurora always knows your current phase and provides phase-specific guidance.",
    target: '.progress-card, [class*="progress"]',
    position: 'bottom',
    highlightPadding: 8,
    openChatOnMobile: true,
  },
  {
    title: "Journal History & Export",
    description: "Access your complete chat history and export your journal anytime. Track your progress over time and keep a record of your healing journey.",
    target: 'button[title*="history" i], button[title*="export" i]',
    position: 'bottom',
    highlightPadding: 12,
    openChatOnMobile: true,
  },
  {
    title: "You're All Set!",
    description: "Remember: Take binders 2 hours away from food. Stay hydrated. Trust the process. Aurora is here 24/7 to guide you. Start by asking 'What should I do today?' - she's got you covered!",
    target: 'body',
    position: 'center',
  },
];

interface InteractiveTourProps {
  onOpenChat?: () => void;
  onOpenMenu?: () => void;
}

export const InteractiveTour = ({ onOpenChat, onOpenMenu }: InteractiveTourProps) => {
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
        try {
          element = document.querySelector(selector);
          if (element) break;
        } catch (e) {
          console.warn(`Invalid selector: ${selector}`);
        }
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

  // Handle opening chat/menu on mobile for specific steps
  useEffect(() => {
    if (!isActive || !isMobile) return;
    
    const step = tourSteps[currentStep];
    
    if (step.openChatOnMobile && onOpenChat) {
      setTimeout(() => onOpenChat(), 300);
    }
    
    if (step.openMenuOnMobile && onOpenMenu) {
      setTimeout(() => onOpenMenu(), 300);
    }
  }, [currentStep, isActive, isMobile, onOpenChat, onOpenMenu]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  // Calculate card position for both mobile and desktop
  const getCardPosition = () => {
    if (step.position === 'center' || !highlightRect) {
      return isMobile
        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md'
        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px]';
    }

    if (isMobile) {
      // On mobile, always show at bottom with smaller width
      return 'bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-md';
    }

    // Desktop positioning logic
    const { top, left, right, bottom, width } = highlightRect;
    const cardOffset = 24;

    switch (step.position) {
      case 'right':
        return `top-[${top}px] left-[${right + cardOffset}px]`;
      case 'left':
        return `top-[${top}px] right-[${window.innerWidth - left + cardOffset}px]`;
      case 'top':
        return `bottom-[${window.innerHeight - top + cardOffset}px] left-[${left + width / 2}px] -translate-x-1/2`;
      case 'bottom':
        return `top-[${bottom + cardOffset}px] left-[${left + width / 2}px] -translate-x-1/2`;
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/70 z-[100] animate-fade-in" 
        onClick={handleSkip}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Spotlight effect */}
      {highlightRect && (
        <>
          <div
            className="fixed z-[101] pointer-events-none transition-all duration-500 ease-out"
            style={{
              top: `${highlightRect.top - padding}px`,
              left: `${highlightRect.left - padding}px`,
              width: `${highlightRect.width + padding * 2}px`,
              height: `${highlightRect.height + padding * 2}px`,
              boxShadow: `
                0 0 0 4px rgba(16, 185, 129, 0.4),
                0 0 0 9999px rgba(0, 0, 0, 0.7),
                0 0 40px rgba(16, 185, 129, 0.3)
              `,
              borderRadius: '12px',
            }}
          />
          {/* Pulse animation ring */}
          <div
            className="fixed z-[101] pointer-events-none transition-all duration-500 ease-out animate-pulse"
            style={{
              top: `${highlightRect.top - padding - 4}px`,
              left: `${highlightRect.left - padding - 4}px`,
              width: `${highlightRect.width + padding * 2 + 8}px`,
              height: `${highlightRect.height + padding * 2 + 8}px`,
              border: '2px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '14px',
            }}
          />
        </>
      )}

      {/* Tour card */}
      <Card 
        className={cn(
          "fixed z-[102] shadow-2xl animate-scale-in border-primary/20",
          isMobile ? "p-4" : "p-6",
          getCardPosition()
        )}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("text-primary flex-shrink-0", isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <span className={cn("font-medium text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(isMobile ? "h-6 w-6 -mr-1" : "h-8 w-8 -mr-2")} 
            onClick={handleSkip}
          >
            <X className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
          </Button>
        </div>

        {/* Content */}
        <div className={cn(isMobile ? "mb-4" : "mb-6")}>
          <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-xl")}>{step.title}</h3>
          <p className={cn("text-muted-foreground leading-relaxed", isMobile ? "text-xs" : "text-sm")}>
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className={cn("flex justify-center gap-2", isMobile ? "mb-4" : "mb-6")}>
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all",
                isMobile ? "h-1" : "h-1.5",
                index === currentStep
                  ? isMobile ? "w-6 bg-primary" : "w-8 bg-primary"
                  : index < currentStep
                  ? isMobile ? "w-1 bg-primary/50" : "w-1.5 bg-primary/50"
                  : isMobile ? "w-1 bg-muted" : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"}
            className={cn(isMobile && "text-xs h-8 px-3")}
            onClick={handleSkip}
          >
            Skip
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(isMobile ? "h-8 w-8" : "h-9 w-9")} 
                onClick={handlePrev}
              >
                <ChevronLeft className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={handleNext} 
              className={cn("gap-2", isMobile && "text-xs h-8 px-3")}
            >
              {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
