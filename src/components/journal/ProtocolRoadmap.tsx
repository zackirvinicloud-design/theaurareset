import { ArrowRight, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getProtocolRoadmapPhaseForDay } from '@/lib/protocol-roadmap';

interface ProtocolRoadmapProps {
    currentDay: number;
    currentPhase: number;
    onOpenRoadmapView: () => void;
}

export const ProtocolRoadmap = ({ currentDay, currentPhase: _currentPhase, onOpenRoadmapView }: ProtocolRoadmapProps) => {
    const currentRoadmapPhase = getProtocolRoadmapPhaseForDay(currentDay);

    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
            <div className="relative">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Cleanse roadmap</p>
                    </div>
                    <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {currentRoadmapPhase.dayRange}
                    </span>
                </div>

                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    Four phases, one sequence. Tap in when you want context: what this phase is doing, what you may feel, and what matters most.
                </p>

                <div className="mt-3 rounded-[18px] border border-border/60 bg-background/40 px-3 py-3">
                    <p className="text-[11px] text-muted-foreground">
                        You are here
                    </p>
                    <p className="mt-1 text-[15px] font-medium leading-6 text-foreground">
                        {currentRoadmapPhase.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {currentRoadmapPhase.shortPromise}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 w-full justify-between rounded-xl border-border/60 bg-background/30 px-3 text-xs font-medium hover:bg-muted/25"
                    onClick={onOpenRoadmapView}
                >
                    Open roadmap
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
            </div>
        </section>
    );
};
