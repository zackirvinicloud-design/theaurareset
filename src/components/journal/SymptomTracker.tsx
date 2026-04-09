import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getSymptomsByCategory } from '@/hooks/symptomData';
import { cn } from '@/lib/utils';

interface SymptomTrackerProps {
  currentDay: number;
  symptoms: string[];
  onToggleSymptom: (key: string) => void;
  compact?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  detox: 'Detox',
  digestive: 'Digestive',
  energy: 'Energy',
  mood: 'Mood',
};

export function SymptomTracker({
  currentDay,
  symptoms,
  onToggleSymptom,
  compact = false,
  className,
}: SymptomTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftSymptoms, setDraftSymptoms] = useState<string[]>(symptoms);
  const categories = useMemo(() => getSymptomsByCategory(), []);
  const activeCount = symptoms.length;

  useEffect(() => {
    if (!isOpen) return;
    setDraftSymptoms(symptoms);
  }, [isOpen, symptoms]);

  const handleToggleDraft = (key: string) => {
    setDraftSymptoms((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const handleSave = () => {
    const current = new Set(symptoms);
    const next = new Set(draftSymptoms);

    // Apply the diff using the existing toggle API.
    for (const key of next) {
      if (!current.has(key)) onToggleSymptom(key);
    }
    for (const key of current) {
      if (!next.has(key)) onToggleSymptom(key);
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="default"
          className={cn(
            'w-full justify-between rounded-xl border-border/60 bg-background/40 px-4 font-medium hover:bg-muted/20',
            compact ? 'h-9 text-sm' : 'h-10 text-sm',
            className,
          )}
        >
          <span className="inline-flex items-center gap-2 text-foreground">
            <Activity className="h-3.5 w-3.5 text-primary/80" />
            How are you feeling
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              activeCount > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            {activeCount > 0 ? `${activeCount} selected` : 'Track'}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md rounded-2xl border-border/70 p-4 sm:p-5">
        <DialogHeader className="space-y-1 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Day {currentDay} check-in
          </p>
          <DialogTitle className="text-base leading-6 text-foreground">How are you feeling?</DialogTitle>
          <p className="text-sm text-muted-foreground">Choose all symptoms that match right now.</p>
        </DialogHeader>

        <div className="space-y-3">
          {Object.entries(categories).map(([category, catSymptoms]) => (
            <div key={category} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                {CATEGORY_LABELS[category] ?? category}
              </p>
              <div className="flex flex-wrap gap-2">
                {catSymptoms.map((symptom) => {
                  const isActive = draftSymptoms.includes(symptom.key);
                  return (
                    <button
                      key={symptom.key}
                      type="button"
                      onClick={() => handleToggleDraft(symptom.key)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        isActive
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/35',
                      )}
                    >
                      <span>{symptom.emoji}</span>
                      <span>{symptom.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-1 flex-row items-center justify-between sm:justify-between sm:space-x-0">
          <p className="text-xs text-muted-foreground">
            {draftSymptoms.length > 0 ? `${draftSymptoms.length} selected` : 'Nothing selected'}
          </p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="h-9 px-3 text-sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="h-9 px-4 text-sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
