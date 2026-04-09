import { ArrowLeft, Activity, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SymptomTracker } from '@/components/journal/SymptomTracker';
import { getDayLabel, getJourneyStageLabel } from '@/hooks/useProtocolData';
import { getNormalToday } from '@/hooks/normalToday';
import { SYMPTOMS } from '@/hooks/symptomData';
import { cn } from '@/lib/utils';

interface NormalTodayViewProps {
    currentDay: number;
    currentPhase: number;
    onBack: () => void;
    onAskCoach?: () => void;
    onAskCoachPrompt?: (prompt: string) => void;
    symptoms?: string[];
    onToggleSymptom?: (key: string) => void;
}

function SignalCard({
    title,
    items,
    icon,
    tone = 'normal',
}: {
    title: string;
    items: string[];
    icon: ReactNode;
    tone?: 'normal' | 'alert' | 'muted';
}) {
    return (
        <section
            className={cn(
                'rounded-2xl border px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]',
                tone === 'normal' && 'border-primary/22 bg-card/80',
                tone === 'alert' && 'border-rose-500/25 bg-rose-500/[0.06]',
                tone === 'muted' && 'border-border/60 bg-card/75',
            )}
        >
            <div className="flex items-center gap-2">
                {icon}
                <p
                    className={cn(
                        'text-[13px] font-semibold',
                        tone === 'normal' && 'text-foreground',
                        tone === 'alert' && 'text-rose-500',
                        tone === 'muted' && 'text-foreground',
                    )}
                >
                    {title}
                </p>
            </div>
            <ul className="mt-2 space-y-1.5">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] leading-6 text-foreground/88">
                        <span
                            className={cn(
                                'mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                                tone === 'normal' && 'bg-primary/70',
                                tone === 'alert' && 'bg-rose-500',
                                tone === 'muted' && 'bg-muted-foreground/55',
                            )}
                        />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function NormalTodayView({
    currentDay,
    currentPhase,
    onBack,
    onAskCoach,
    onAskCoachPrompt,
    symptoms = [],
    onToggleSymptom,
}: NormalTodayViewProps) {
    const normalToday = getNormalToday(currentDay);
    const dayLabel = getDayLabel(currentDay);
    const stageLabel = getJourneyStageLabel(currentDay, currentPhase);
    const canTrackSymptoms = Boolean(onToggleSymptom);
    const canAskCoach = Boolean(onAskCoachPrompt || onAskCoach);
    const activeSymptomLabels = symptoms
        .map((key) => SYMPTOMS.find((symptom) => symptom.key === key)?.label)
        .filter((label): label is string => Boolean(label));

    const handleAskCoachFromSymptoms = () => {
        if (onAskCoachPrompt) {
            if (activeSymptomLabels.length > 0) {
                onAskCoachPrompt(
                    `Day ${currentDay} symptom check: I'm experiencing ${activeSymptomLabels.join(', ')}. Tell me what is expected today, what to do right now, and what would be a red flag.`,
                );
                return;
            }

            onAskCoachPrompt(
                `Day ${currentDay} symptom check: I need a quick read on what is expected vs what would be a red flag, plus what to do right now.`,
            );
            return;
        }

        onAskCoach?.();
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-3 py-3 sm:px-4 lg:px-6">
                <div className="flex items-start gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-9 w-9 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground sm:text-[24px]">
                            Symptom tracker
                        </h2>
                        <p className="mt-1 text-[13px] leading-6 text-muted-foreground sm:text-[15px]">
                            {dayLabel} · {stageLabel}
                        </p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
                    <section className="mb-3 rounded-2xl border border-primary/24 bg-card/80 px-3.5 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/80">
                            Daily signal
                        </p>
                        <p className="mt-1 text-[15px] leading-6 text-foreground/90">
                            {normalToday.headline}
                        </p>
                    </section>

                    <div className="space-y-2.5">
                        <SignalCard
                            title="Expected"
                            items={normalToday.normal}
                            icon={<Activity className="h-4 w-4 text-primary/80" />}
                            tone="normal"
                        />
                        <SignalCard
                            title="Pause and check"
                            items={normalToday.redFlags}
                            icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
                            tone="alert"
                        />
                        <SignalCard
                            title="Ignore for now"
                            items={normalToday.ignore}
                            icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                            tone="muted"
                        />
                    </div>

                    {(canTrackSymptoms || canAskCoach) && (
                        <div className="mt-3 space-y-2">
                            {canTrackSymptoms && onToggleSymptom && (
                                <SymptomTracker
                                    currentDay={currentDay}
                                    symptoms={symptoms}
                                    onToggleSymptom={onToggleSymptom}
                                />
                            )}
                            {canAskCoach && (
                                <Button
                                    variant="outline"
                                    className="h-10 w-full justify-between rounded-xl border-border/60 bg-background/40 px-4 text-sm font-medium hover:bg-muted/20"
                                    onClick={handleAskCoachFromSymptoms}
                                >
                                    Ask coach about symptoms
                                    <Sparkles className="h-3.5 w-3.5 text-primary/80" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
