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
  1: { name: 'Liver Support', color: 'text-phase-1' },
  2: { name: 'Fungal & Viral', color: 'text-phase-2' },
  3: { name: 'Parasites', color: 'text-phase-3' },
  4: { name: 'Heavy Metals', color: 'text-phase-4' },
} as const;

export const ProgressCard = ({ currentDay, currentPhase, onNextDay, onAdjust }: ProgressCardProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Ensure phase is valid (1-4), fallback to calculated phase if invalid
  const validPhase = (currentPhase && currentPhase >= 1 && currentPhase <= 4) 
    ? currentPhase 
    : Math.ceil(Math.min(Math.max(currentDay, 1), 28) / 7) as 1 | 2 | 3 | 4;
  
  const phase = PHASE_INFO[validPhase];
  const isLastDay = currentDay >= 28;

  return (
    <>
      <Card className="mx-3 mt-3 p-4 bg-muted/50 border-primary/20 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Day</span>
                <h4 className="font-bold text-2xl leading-none">{currentDay}</h4>
                <span className="text-sm text-muted-foreground leading-none self-end pb-0.5">/ 28</span>
              </div>
            </div>
            <p className={`text-sm font-semibold ${phase.color}`}>
              Phase {validPhase}: {phase.name}
            </p>
          </div>
          
          <div className="flex gap-1.5 flex-shrink-0">
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
