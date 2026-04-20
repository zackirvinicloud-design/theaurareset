import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowDown, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { CoachHistory } from '@/components/chat/CoachHistory';
import { ChatThread, JournalEntry, UserProgress } from '@/hooks/useJournalStore';
import { requestGutBrainTurn } from '@/utils/streamChat';
import { buildProtocolChatContext, getDayLabel } from '@/hooks/useProtocolData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';
import {
    EMPTY_GUT_BRAIN_PROFILE,
    GUT_BRAIN_AI_NAME,
    getGutBrainStarterState,
    type CoachAction,
    type GutBrainConversationEntry,
    type GutBrainProfile,
    type GutBrainRecipeCard,
    type GutBrainRecipeLibraryEntry,
    type GutBrainShoppingAction,
    type GutBrainSnapshot,
    type GutBrainStarterState,
    type GutBrainTurnPayload,
} from '@/lib/gutbrain';

interface JournalCenterProps {
    userId: string | null;
    progress: UserProgress;
    entries: JournalEntry[];
    onAddEntry: (
        role: 'user' | 'assistant',
        content: string,
        assistantPayload?: GutBrainTurnPayload | null,
    ) => Promise<JournalEntry>;
    onUpdateEntry: (entryId: string, content: string, assistantPayload?: GutBrainTurnPayload | null) => void;
    onFinalizeEntry: (
        entryId: string,
        content: string,
        assistantPayload?: GutBrainTurnPayload | null,
    ) => Promise<void> | void;
    onApplyShoppingActions?: (actions: GutBrainShoppingAction[]) => Promise<void> | void;
    onApplyRecipeActions?: (actions: GutBrainRecipeCard[]) => Promise<void> | void;
    onOpenRecipeCard?: (recipe: GutBrainRecipeCard) => void;
    onCoachAction?: (action: CoachAction) => void;
    brainProfile?: GutBrainProfile;
    brainSnapshot?: GutBrainSnapshot | null;
    symptoms?: string[];
    onRefreshBrain?: (
        entries: GutBrainConversationEntry[],
        progress: { currentDay: number; currentPhase: 1 | 2 | 3 | 4 },
        options?: { force?: boolean; silent?: boolean; memoryProfile?: GutBrainProfile | null },
    ) => Promise<void>;
    threads?: ChatThread[];
    activeThreadId?: string | null;
    onStartNewChat?: () => Promise<void> | void;
    onSelectChatThread?: (threadId: string) => Promise<void> | void;
    onRenameChatThread?: (threadId: string, title: string) => Promise<void> | void;
    pendingPrompt?: string | null;
    onPendingPromptConsumed?: () => void;
    recipeContext?: string;
    recipeLibrary?: GutBrainRecipeLibraryEntry[];
    isMobile?: boolean;
    mobileVariant?: 'default' | 'help';
}

export const JournalCenter = ({
    userId,
    progress,
    entries,
    onAddEntry,
    onUpdateEntry: _onUpdateEntry,
    onFinalizeEntry: _onFinalizeEntry,
    onApplyShoppingActions,
    onApplyRecipeActions,
    onOpenRecipeCard,
    onCoachAction,
    brainProfile = EMPTY_GUT_BRAIN_PROFILE,
    brainSnapshot,
    symptoms = [],
    onRefreshBrain,
    threads,
    activeThreadId,
    onStartNewChat,
    onSelectChatThread,
    onRenameChatThread,
    pendingPrompt,
    onPendingPromptConsumed,
    recipeContext,
    recipeLibrary = [],
    isMobile = false,
    mobileVariant = 'default',
}: JournalCenterProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showNewChatDialog, setShowNewChatDialog] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const starterState = getGutBrainStarterState(progress, brainProfile, brainSnapshot, { mobile: isMobile });
    const isMobileHelpMode = isMobile && mobileVariant === 'help';
    const inputPlaceholder = progress.currentDay === 0
        ? 'Ask what to buy, what to do first, or why a step matters...'
        : 'Ask what matters today, what to eat, or why an ingredient helps...';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, isLoading]);

    const handleSend = useCallback(async (content: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            return;
        }

        const userEntry = await onAddEntry('user', trimmedContent);
        setIsLoading(true);

        let nextDay = progress.currentDay;
        let nextPhase = progress.currentPhase;

        const phaseNames = ['Prep & Foundation', 'Fungal Elimination', 'Parasite Cleanse', 'Heavy Metal Detox'];
        const dayLabel = getDayLabel(progress.currentDay);
        const enhancedContext = [
            `${dayLabel}, Phase ${progress.currentPhase}: ${phaseNames[progress.currentPhase - 1]}`,
            ...(recipeContext ? [recipeContext] : []),
            buildProtocolChatContext(progress.currentDay),
        ].join('\n\n');

        const mappedMessages = [...entries, userEntry].map((entry) => ({
            id: entry.id,
            role: entry.role,
            content: entry.content,
            timestamp: new Date(entry.createdAt).getTime(),
        }));

        try {
            const payload = await requestGutBrainTurn({
                messages: mappedMessages,
                context: enhancedContext,
                brainProfile,
                brainSnapshot,
                symptoms,
                recipeLibrary,
            });

            if (typeof payload.progressUpdateDay === 'number') {
                nextDay = Math.min(Math.max(payload.progressUpdateDay, 0), 21);
                nextPhase = nextDay === 0 ? 1 : (nextDay <= 7 ? 2 : (nextDay <= 14 ? 3 : 4)) as 1 | 2 | 3 | 4;
            }

            const assistantEntry = await onAddEntry('assistant', payload.replyText, payload);

            await onRefreshBrain?.(
                [
                    ...entries,
                    userEntry,
                    {
                        ...assistantEntry,
                        content: payload.replyText,
                    },
                ],
                { currentDay: nextDay, currentPhase: nextPhase },
                { silent: true, memoryProfile: brainProfile },
            );
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        entries,
        onAddEntry,
        progress.currentDay,
        progress.currentPhase,
        brainProfile,
        brainSnapshot,
        symptoms,
        recipeContext,
        recipeLibrary,
        onRefreshBrain,
    ]);

    const handleRecipeActionSelect = useCallback(async (action: GutBrainRecipeCard) => {
        if (!onApplyRecipeActions || action.status !== 'addable') {
            return;
        }

        await onApplyRecipeActions([action]);
    }, [onApplyRecipeActions]);

    const handleShoppingActionSelect = useCallback(async (action: GutBrainShoppingAction) => {
        if (!onApplyShoppingActions) {
            return;
        }

        await onApplyShoppingActions([action]);
    }, [onApplyShoppingActions]);

    const handleRecipeIngredientsToShoppingSelect = useCallback(async (action: GutBrainRecipeCard) => {
        if (!onApplyShoppingActions || action.type !== 'add' || action.status !== 'addable' || !action.ingredients.length) {
            return;
        }

        const shoppingActions: GutBrainShoppingAction[] = action.ingredients.map((ingredient) => ({
            type: 'add',
            category: 'Recipe ingredients',
            itemName: ingredient,
        }));

        if (!shoppingActions.length) {
            return;
        }

        await onApplyShoppingActions(shoppingActions);
    }, [onApplyShoppingActions]);

    useEffect(() => {
        if (pendingPrompt && !isLoading) {
            void handleSend(pendingPrompt);
            onPendingPromptConsumed?.();
        }
    }, [pendingPrompt, isLoading, handleSend, onPendingPromptConsumed]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const handleScroll = () => {
            const isNear = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
            setShowScrollButton(!isNear && entries.length > 0);
        };
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [entries.length]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    return (
        <div data-tour="today-space" className="flex h-full flex-col">
            {isMobileHelpMode ? (
                <div className="border-b border-border/50">
                    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <GutBrainLogo className="h-4 w-4 rounded-sm" />
                            <h3 className="font-semibold text-sm">{GUT_BRAIN_AI_NAME}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Start new chat"
                                onClick={() => setShowNewChatDialog(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <CoachHistory
                                userId={userId}
                                currentDay={progress.currentDay}
                                threads={threads}
                                activeThreadId={activeThreadId}
                                onSelectThread={onSelectChatThread}
                                onRenameThread={onRenameChatThread}
                                compact
                            />
                        </div>
                    </div>
                </div>
            ) : !isMobile && (
                <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <GutBrainLogo className="h-4 w-4 rounded-sm" />
                        <div className="min-w-0">
                            <h3 className="font-semibold text-sm">{GUT_BRAIN_AI_NAME}</h3>
                            <p className="text-xs text-muted-foreground">
                                {getDayLabel(progress.currentDay)} · Ask for help, simplify today, or troubleshoot what is blocking you
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Start new chat"
                            onClick={() => setShowNewChatDialog(true)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <CoachHistory
                            userId={userId}
                            currentDay={progress.currentDay}
                            threads={threads}
                            activeThreadId={activeThreadId}
                            onSelectThread={onSelectChatThread}
                            onRenameThread={onRenameChatThread}
                        />
                    </div>
                </div>
            )}

            <div className="relative flex-1 overflow-hidden">
                <div
                    className={cn(
                        'h-full overflow-y-auto',
                        isMobileHelpMode ? 'px-4 pt-4' : isMobile ? 'px-3 pt-3' : 'px-4 pt-4',
                    )}
                    ref={scrollRef}
                >
                    {entries.length === 0 ? (
                        isMobile ? (
                            <div className={cn('pb-4', !isMobileHelpMode && 'pt-2')}>
                                <CoachStarterPanel
                                    starterState={starterState}
                                    compact
                                    onPromptSelect={(prompt) => {
                                        void handleSend(prompt);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center px-4 py-6">
                                <div className="w-full max-w-xl">
                                    <CoachStarterPanel
                                        starterState={starterState}
                                        onPromptSelect={(prompt) => {
                                            void handleSend(prompt);
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        <>
                            {entries.map((entry, index) => {
                                const isLast = index === entries.length - 1;
                                return (
                                    <ChatMessage
                                        key={entry.id}
                                        role={entry.role}
                                        content={entry.content}
                                        assistantPayload={entry.assistantPayload}
                                        timestamp={new Date(entry.createdAt).getTime()}
                                        enableChoices={entry.role === 'assistant' && isLast && !isLoading}
                                        onChoiceSelect={(choice) => {
                                            void handleSend(choice);
                                        }}
                                        onActionSelect={onCoachAction}
                                        onRecipeActionSelect={handleRecipeActionSelect}
                                        onRecipeOpenSelect={onOpenRecipeCard}
                                        onShoppingActionSelect={handleShoppingActionSelect}
                                        onRecipeIngredientsToShoppingSelect={handleRecipeIngredientsToShoppingSelect}
                                    />
                                );
                            })}
                            {isLoading && (
                                <div className="mb-4 flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20">
                                        <GutBrainLogo className="h-4 w-4 rounded-sm" />
                                    </div>
                                    <div className="rounded-lg bg-muted px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.1s' }} />
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {showScrollButton && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg"
                        onClick={scrollToBottom}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div data-tour="today-actions" className={cn(isMobile ? "pb-0" : "")}>
                <ChatInput
                    onSend={handleSend}
                    disabled={isLoading}
                    placeholder={inputPlaceholder}
                    compact={isMobile}
                />
            </div>

            <AlertDialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start a new chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a fresh conversation. Your current chat will remain saved in your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setShowNewChatDialog(false);
                            void onStartNewChat?.();
                        }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

function CoachStarterPanel({
    starterState,
    compact = false,
    onPromptSelect,
}: {
    starterState: GutBrainStarterState;
    compact?: boolean;
    onPromptSelect?: (prompt: string) => void;
}) {
    return (
        <div className={cn(compact ? 'space-y-3 px-0.5 py-1' : 'space-y-3 px-1 py-1')}>
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/6 text-primary">
                    <GutBrainLogo className="h-5 w-5 rounded-sm" />
                </div>
                <div className="min-w-0 flex-1 space-y-2 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {starterState.eyebrow}
                    </p>
                    <h4 className={cn(
                        'font-semibold tracking-[-0.03em] text-foreground',
                        compact ? 'text-[1.15rem] leading-tight' : 'text-[1.4rem] leading-tight',
                    )}>
                        {starterState.title}
                    </h4>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {starterState.description}
                    </p>
                </div>
            </div>
            {starterState.prompts.length > 0 && (
                <div className="grid gap-2">
                    {starterState.prompts.map((starterPrompt, index) => (
                        <button
                            key={`${starterPrompt.label}-${index}`}
                            type="button"
                            onClick={() => onPromptSelect?.(starterPrompt.prompt)}
                            className={cn(
                                'group relative flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left text-sm',
                                'bg-background/60 backdrop-blur-sm',
                                'border-border/60 hover:border-emerald-500/40',
                                'hover:bg-emerald-500/5',
                                'transition-all duration-200 ease-out',
                                'active:scale-[0.98]',
                            )}
                        >
                            <span className={cn(
                                'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold flex-shrink-0',
                                'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
                                'group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/40 transition-colors',
                            )}>
                                {String.fromCharCode(65 + (index % 26))}
                            </span>
                            <span className="flex-1 font-medium text-foreground">{starterPrompt.label}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
