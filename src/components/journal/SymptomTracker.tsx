import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSymptomsByCategory, SYMPTOMS } from '@/hooks/symptomData';
import { cn } from '@/lib/utils';

interface SymptomTrackerProps {
  currentDay: number;
  symptoms: string[];
  onToggleSymptom: (key: string) => void;
  onAskCoach: (prompt: string) => void;
  compact?: boolean;
}

export function SymptomTracker({
  currentDay,
  symptoms,
  onToggleSymptom,
  onAskCoach,
  compact = false,
}: SymptomTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = getSymptomsByCategory();
  const activeCount = symptoms.length;

  const handleAskCoach = () => {
    if (activeCount === 0) return;
    
    const activeLabels = symptoms
      .map(key => SYMPTOMS.find(s => s.key === key)?.label)
      .filter(Boolean);
    
    const prompt = `Day ${currentDay} check-in: I'm experiencing ${activeLabels.join(', ')}. Is this expected for today, and what should I do?`;
    onAskCoach(prompt);
  };

  return (
    <section>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/80 text-left transition-colors hover:bg-muted/25',
          compact ? 'px-3 py-2.5' : 'px-4 py-3',
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Activity className="h-4 w-4 flex-shrink-0 text-primary" />
          <div className="min-w-0 flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              How are you feeling?
            </p>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-5">
              
              {Object.entries(categories).map(([category, catSymptoms]) => (
                <div key={category} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {catSymptoms.map((symptom) => {
                      const isActive = symptoms.includes(symptom.key);
                      return (
                        <button
                          key={symptom.key}
                          onClick={() => onToggleSymptom(symptom.key)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                            isActive 
                              ? 'border-primary bg-primary/10 text-foreground' 
                              : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/50'
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

              {activeCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2 border-t border-border/40"
                >
                  <Button 
                    onClick={handleAskCoach}
                    className="w-full gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
                    variant="ghost"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask Coach about these symptoms
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
