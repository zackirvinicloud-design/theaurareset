import { useState } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';
import { PHASE_INFO, calculatePhase } from '@/hooks/useProtocolData';
import { cn } from '@/lib/utils';

interface ProtocolRoadmapProps {
  currentDay: number;
  currentPhase: number;
}

const PHASE_ROADMAP = [
  {
    phase: 1,
    days: 'Day 0',
    emoji: '🛡️',
    goal: 'Set up your environment and gather supplies.',
    what: 'Remove non-compliant foods, organize supplements, meal prep for Week 1.',
  },
  {
    phase: 2,
    days: 'Days 1–7',
    emoji: '🍄',
    goal: 'Kill fungal overgrowth (candida) with antifungals.',
    what: 'Oregano oil, caprylic acid, zero sugar. Die-off symptoms are normal — binders help.',
  },
  {
    phase: 3,
    days: 'Days 8–14',
    emoji: '🎯',
    goal: 'Eliminate parasites with targeted herbs.',
    what: 'Black walnut, wormwood, clove stack. Full moon can intensify effects.',
  },
  {
    phase: 4,
    days: 'Days 15–21',
    emoji: '⚡',
    goal: 'Chelate and remove heavy metals from tissues.',
    what: 'Chlorella, spirulina, zeolite, cilantro. Sweating helps — sauna or exercise.',
  },
];

export const ProtocolRoadmap = ({ currentDay, currentPhase }: ProtocolRoadmapProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-border/50 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Full protocol roadmap</h3>
          <p className="text-xs text-muted-foreground">
            See all 4 phases and where you are in the journey.
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-0">
          {/* Vertical timeline */}
          {PHASE_ROADMAP.map((item, index) => {
            const phaseInfo = PHASE_INFO[item.phase];
            const isActive = item.phase === currentPhase;
            const isComplete = item.phase < currentPhase;
            const isFuture = item.phase > currentPhase;
            const isLast = index === PHASE_ROADMAP.length - 1;

            return (
              <div key={item.phase} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold',
                      isComplete && 'border-primary bg-primary text-primary-foreground',
                      isActive && 'border-primary bg-primary/15 text-primary',
                      isFuture && 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isActive ? (
                      <MapPin className="h-3.5 w-3.5" />
                    ) : (
                      item.phase
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 flex-1 min-h-[2rem]',
                        isComplete ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn('pb-5 pt-0.5 min-w-0', isLast && 'pb-1')}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {item.emoji} {phaseInfo.name}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    {item.days}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-foreground/80">
                    {item.goal}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                    {item.what}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
