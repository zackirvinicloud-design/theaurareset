import { ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  const phase = PHASE_INFO[currentPhase];
  const isLastDay = currentDay >= 28;

  return (
    <Card className="mx-4 mt-4 p-4 bg-muted/50 border-primary/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h4 className="font-semibold text-lg">Day {currentDay}</h4>
            <span className="text-xs text-muted-foreground">of 28</span>
          </div>
          <p className={`text-sm font-medium ${phase.color}`}>
            Phase {currentPhase}: {phase.name}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isLastDay && (
            <Button
              onClick={onNextDay}
              size="sm"
              className="gap-1"
            >
              Next Day
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            onClick={onAdjust}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            Adjust
          </Button>
        </div>
      </div>
    </Card>
  );
};
