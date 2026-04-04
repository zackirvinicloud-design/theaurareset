import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Flame, ArrowLeft, ArrowRight, Settings, LogOut, Download, Trash2, Sparkles, FileText } from 'lucide-react';
import { UserProgress } from '@/hooks/useJournalStore';
import { getPhaseInfo, getDayLabel } from '@/hooks/useProtocolData';
import { cn } from '@/lib/utils';

interface TopBarProps {
    progress: UserProgress;
    hasJournalEntries: boolean;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onExportJournal: () => void;
    onClearJournal: () => void;
    onRunTutorialAgain: () => void;
    onReadFullProtocol?: () => void;
    showReadFullProtocol?: boolean;
    onSignOut: () => void;
}

export const TopBar = ({
    progress,
    hasJournalEntries,
    onPreviousDay,
    onNextDay,
    onExportJournal,
    onClearJournal,
    onRunTutorialAgain,
    onReadFullProtocol,
    showReadFullProtocol = false,
    onSignOut,
}: TopBarProps) => {
    const phase = getPhaseInfo(progress.currentPhase);
    const dayLabel = getDayLabel(progress.currentDay);
    const progressPercent = Math.round((progress.currentDay / 21) * 100);
    const isFirstDay = progress.currentDay <= 0;
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
                <div data-tour="day-controls" className="flex items-center gap-1.5">
                    <Button
                        onClick={onPreviousDay}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-8"
                        disabled={isFirstDay}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Previous day</span>
                        <span className="sm:hidden">Prev</span>
                    </Button>
                    <Button
                        onClick={onNextDay}
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        disabled={isLastDay}
                    >
                        <span className="hidden sm:inline">Next day</span>
                        <span className="sm:hidden">Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={onRunTutorialAgain}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Run tutorial again
                            </DropdownMenuItem>
                            {showReadFullProtocol && onReadFullProtocol && (
                                <DropdownMenuItem
                                    onClick={onReadFullProtocol}
                                    className="gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Read full protocol
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onExportJournal}
                                disabled={!hasJournalEntries}
                                className="gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export journal
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onClearJournal}
                                disabled={!hasJournalEntries}
                                className="gap-2 text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear today's journal
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
