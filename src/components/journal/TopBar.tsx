import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, ArrowRight, Settings, LogOut, BarChart3 } from 'lucide-react';
import { UserProgress } from '@/hooks/useJournalStore';
import { getPhaseInfo, getDayLabel } from '@/hooks/useProtocolData';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TopBarProps {
    progress: UserProgress;
    onAdvanceDay: () => void;
    onSettings: () => void;
    onSignOut: () => void;
    onDashboard: () => void;
}

export const TopBar = ({ progress, onAdvanceDay, onSettings, onSignOut, onDashboard }: TopBarProps) => {
    const phase = getPhaseInfo(progress.currentPhase);
    const dayLabel = getDayLabel(progress.currentDay);
    const progressPercent = Math.round((progress.currentDay / 21) * 100);
    const isLastDay = progress.currentDay >= 21;

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14">
                {/* Left: Day & Phase */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none">{dayLabel}</span>
                            <span className={cn("text-xs font-medium leading-none mt-0.5", phase.color)}>
                                Phase {progress.currentPhase}: {phase.shortName}
                            </span>
                        </div>
                    </div>

                    {/* Progress bar — hidden on very small screens */}
                    <div className="hidden sm:flex items-center gap-2 min-w-[120px] max-w-[200px]">
                        <Progress value={progressPercent} className="h-2" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{progressPercent}%</span>
                    </div>

                    {/* Streak */}
                    {progress.streakCount > 0 && (
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-semibold text-orange-600">{progress.streakCount}</span>
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                    {!isLastDay && (
                        <Button
                            onClick={onAdvanceDay}
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                        >
                            Next Day
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <Button
                        onClick={onDashboard}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Progress Dashboard"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={onSettings}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={onSignOut}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
};
