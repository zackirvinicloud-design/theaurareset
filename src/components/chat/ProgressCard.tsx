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
      <Card className="mx-3 mt-3 p-3 bg-muted/50 border-primary/20 animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h4 className="font-semibold text-base">Day {currentDay}</h4>
              <span className="text-xs text-muted-foreground">of 28</span>
            </div>
            <p className={`text-xs font-medium ${phase.color} truncate`}>
              Phase {validPhase}: {phase.name}
            </p>
          </div>
          
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              onClick={() => setShowTutorial(true)}
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-8 px-3 hover-scale"
              title="Phase Tutorial"
            >
              <BookOpen className="w-3 h-3" />
              Learn
            </Button>
            {!isLastDay && (
              <Button
                onClick={onNextDay}
                size="sm"
                className="gap-1 text-xs h-8 px-3"
              >
                Next
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
            <Button
              onClick={onAdjust}
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-8 px-3"
            >
              <Settings className="w-3 h-3" />
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
