import { ArrowRight, Settings, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { PhaseTutorial } from '@/components/onboarding/PhaseTutorial';

interface ProgressCardProps {
  currentDay: number;
  currentPhase: 1 | 2 | 3 | 4;
  onNextDay: () => void;
  onAdjust: () => void;
}

const PHASE_INFO = {
  1: { name: 'Preliminary (Day 0)', color: 'text-phase-1' },
  2: { name: 'Fungal (Days 1-7)', color: 'text-phase-2' },
  3: { name: 'Parasites (Days 8-14)', color: 'text-phase-3' },
  4: { name: 'Heavy Metals (Days 15-21)', color: 'text-phase-4' },
} as const;

export const ProgressCard = ({ currentDay, currentPhase, onNextDay, onAdjust }: ProgressCardProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Calculate phase based on new 22-day structure (Day 0-21)
  // Phase 1: Day 0 (Preliminary - prep and mindset)
  // Phase 2: Days 1-7 (Fungal + Foundation)
  // Phase 3: Days 8-14 (Parasites + Foundation)
  // Phase 4: Days 15-21 (Heavy Metals + Foundation)
  const calculatePhase = (day: number): 1 | 2 | 3 | 4 => {
    if (day === 0) return 1; // Preliminary phase
    if (day <= 7) return 2; // Fungal phase
    if (day <= 14) return 3; // Parasite phase
    return 4; // Heavy metals phase
  };

  const validPhase = (currentPhase && currentPhase >= 1 && currentPhase <= 4)
    ? currentPhase
    : calculatePhase(Math.min(Math.max(currentDay, 0), 21));
  
  const phase = PHASE_INFO[validPhase];
  const isLastDay = currentDay >= 21;

  return (
    <>
      <Card className="mx-3 mt-3 p-4 bg-muted/50 border-primary/20 animate-fade-in progress-card">
        <div className="flex flex-col gap-3">
          {/* Top row - Day and Phase info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Day</span>
              <h4 className="font-bold text-2xl leading-none">{currentDay}</h4>
              <span className="text-sm text-muted-foreground leading-none self-end pb-0.5">/ 21</span>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-semibold ${phase.color} leading-tight`}>
                Phase {validPhase}:
              </p>
              <p className={`text-sm font-semibold ${phase.color} leading-tight`}>
                {phase.name}
              </p>
            </div>
          </div>
          
          {/* Bottom row - Action buttons */}
          <div className="flex gap-1.5 justify-end">
            <Button
              onClick={() => setShowTutorial(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 px-3 hover-scale"
              title="Phase Tutorial"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Learn</span>
            </Button>
            {!isLastDay && (
              <Button
                onClick={onNextDay}
                size="sm"
                className="gap-1.5 text-xs h-9 px-4"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              onClick={onAdjust}
              variant="outline"
              size="icon"
              className="h-9 w-9"
              title="Adjust progress"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
      
      <PhaseTutorial 
        phase={validPhase} 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </>
  );
};
