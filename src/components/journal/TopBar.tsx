import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Flame, ArrowLeft, ArrowRight, Settings, LogOut, UserRoundCog } from 'lucide-react';
import { UserProgress } from '@/hooks/useJournalStore';
import { getDayLabel, getJourneyStageLabel } from '@/hooks/useProtocolData';
import { cn } from '@/lib/utils';

interface TopBarProps {
    progress: UserProgress;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onOpenSettings: () => void;
    onSignOut: () => void;
}

export const TopBar = ({
    progress,
    onPreviousDay,
    onNextDay,
    onOpenSettings,
    onSignOut,
}: TopBarProps) => {
    const dayLabel = getDayLabel(progress.currentDay);
    const stageLabel = getJourneyStageLabel(progress.currentDay, progress.currentPhase);
    const progressPercent = Math.round((progress.currentDay / 21) * 100);
    const isFirstDay = progress.currentDay <= 0;
    const isLastDay = progress.currentDay >= 21;

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14">
                {/* Left: Day & Week */}
                <div className="flex items-center gap-3 min-w-0 sm:gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold leading-none tracking-[-0.01em]">{dayLabel}</span>
                            <span className={cn("text-[11px] font-medium leading-none mt-0.5", progress.currentDay === 0 ? "text-primary" : "text-muted-foreground")}>
                                {stageLabel}
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
                <div
                    data-tour="day-controls"
                    className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/70 p-1 shadow-[inset_0_1px_0_hsl(var(--background)/0.45)] sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none sm:gap-1.5"
                >
                    <Button
                        onClick={onPreviousDay}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-45 sm:h-8 sm:w-auto sm:px-2 sm:gap-1.5 sm:text-xs"
                        disabled={isFirstDay}
                        aria-label="Previous day"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                    </Button>
                    <Button
                        onClick={onNextDay}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg p-0 text-primary hover:bg-primary/12 hover:text-primary disabled:opacity-45 sm:h-8 sm:w-auto sm:px-2 sm:gap-1.5 sm:text-xs sm:text-foreground"
                        disabled={isLastDay}
                        aria-label="Next day"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                title="Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                                onClick={onOpenSettings}
                                className="gap-2"
                            >
                                <UserRoundCog className="w-4 h-4" />
                                Edit profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onSignOut}
                                className="gap-2 text-destructive focus:text-destructive"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
