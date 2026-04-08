import { useState } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';
import { PHASE_INFO } from '@/hooks/useProtocolData';
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
    days: 'Week 1 · Days 1-7',
    emoji: '🍄',
    goal: 'Kill fungal overgrowth (candida) with antifungals.',
    what: 'Oregano oil, caprylic acid, zero sugar. Die-off symptoms are normal — binders help.',
  },
  {
    phase: 3,
    days: 'Week 2 · Days 8-14',
    emoji: '🎯',
    goal: 'Eliminate parasites with targeted herbs.',
    what: 'Black walnut, wormwood, clove stack. Full moon can intensify effects.',
  },
  {
    phase: 4,
    days: 'Week 3 · Days 15-21',
    emoji: '⚡',
    goal: 'Chelate and remove heavy metals from tissues.',
    what: 'Chlorella, spirulina, zeolite, cilantro. Sweating helps — sauna or exercise.',
  },
];

export const ProtocolRoadmap = ({ currentDay, currentPhase }: ProtocolRoadmapProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-border/60 bg-card/55">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/20"
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Reset roadmap</h3>
          <p className="text-[11px] leading-5 text-muted-foreground">
            See Prep Day plus Weeks 1-3 at a glance.
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
        <div className="space-y-0 px-3 pb-3 pt-1">
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
                      'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold',
                      isComplete && 'border-primary bg-primary text-primary-foreground',
                      isActive && 'border-primary bg-primary/15 text-primary',
                      isFuture && 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-3 w-3" />
                    ) : isActive ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      item.phase
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 min-h-[1.6rem] flex-1',
                        isComplete ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn('min-w-0 pb-4 pt-0.5', isLast && 'pb-0.5')}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {item.emoji} {item.phase === 1 ? 'Prep Day' : `Week ${item.phase - 1}: ${phaseInfo.shortName}`}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {item.days}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground/85">
                    {item.goal}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
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
