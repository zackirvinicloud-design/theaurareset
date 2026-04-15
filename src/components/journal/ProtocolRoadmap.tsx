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
        <section className="rounded-2xl border border-border/60 bg-card/75 p-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <p className="text-sm font-semibold text-foreground">Cleanse roadmap</p>
                </div>
                <span className="rounded-full border border-border/60 bg-background/55 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {currentRoadmapPhase.dayRange}
                </span>
            </div>

            <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
                Understand the phase order, what to expect, and what matters most next.
            </p>

            <Button
                variant="outline"
                size="sm"
                className="mt-2.5 h-9 w-full justify-between rounded-xl border-border/60 bg-background/40 px-3 text-[12px] font-medium hover:bg-muted/25"
                onClick={onOpenRoadmapView}
            >
                Open roadmap
                <ArrowRight className="h-3.5 w-3.5" />
            </Button>
        </section>
    );
};
