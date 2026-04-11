import { useRef, useState, useEffect, useCallback } from 'react';
import { MessageSquare, Leaf, ArrowDown, Sparkles, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { CoachHistory } from '@/components/chat/CoachHistory';
import { ChatThread, JournalEntry, UserProgress } from '@/hooks/useJournalStore';
import { streamChat } from '@/utils/streamChat';
import { buildProtocolChatContext, getDayLabel } from '@/hooks/useProtocolData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    GUT_BRAIN_AI_NAME,
    getGutBrainDisplayText,
    getGutBrainStarterState,
    type CoachAction,
    type GutBrainConversationEntry,
    type GutBrainProfile,
    parseGutBrainShoppingActions,
    type GutBrainShoppingAction,
    type GutBrainSnapshot,
    type GutBrainStarterState,
} from '@/lib/gutbrain';

interface JournalCenterProps {
    userId: string | null;
    progress: UserProgress;
    entries: JournalEntry[];
    onAddEntry: (role: 'user' | 'assistant', content: string) => Promise<JournalEntry>;
    onUpdateEntry: (entryId: string, content: string) => void;
    onFinalizeEntry: (entryId: string, content: string) => Promise<void> | void;
    onApplyShoppingActions?: (actions: GutBrainShoppingAction[]) => Promise<void> | void;
    onCoachAction?: (action: CoachAction) => void;
    brainProfile: GutBrainProfile;
    brainSnapshot: GutBrainSnapshot | null;
    symptoms?: string[];
    onRefreshBrain: (
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
    isMobile?: boolean;
    mobileVariant?: 'default' | 'help';
}

export const JournalCenter = ({
    userId,
    progress,
    entries,
    onAddEntry,
    onUpdateEntry,
    onFinalizeEntry,
    onApplyShoppingActions,
    onCoachAction,
    brainProfile,
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
    isMobile = false,
    mobileVariant = 'default',
}: JournalCenterProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const starterState = getGutBrainStarterState(progress, brainProfile, brainSnapshot, { mobile: isMobile });
    const isMobileHelpMode = isMobile && mobileVariant === 'help';
    const inputPlaceholder = progress.currentDay === 0
        ? 'Ask what to buy, what to do first, or what could trip you up...'
        : 'Ask what matters today, what to eat, or what to simplify...';

    const sanitizeAssistantText = useCallback((value: string) => {
        return value
            .replace(/\[PROGRESS_UPDATE:day=\d+\]\s*/g, '')
            .replace(/[‘’]/g, "'")
            .replace(/[“”]/g, '"')
            .replace(/[–—]/g, '-')
            .replace(/…/g, '...')
            .replace(/•/g, '-')
            .replace(/→/g, '->')
            .replace(/¼/g, '1/4')
            .replace(/½/g, '1/2')
            .replace(/¾/g, '3/4')
            .replace(/⅓/g, '1/3')
            .replace(/⅔/g, '2/3')
            .replace(/⅛/g, '1/8')
            .replace(/⅜/g, '3/8')
            .replace(/⅝/g, '5/8')
            .replace(/⅞/g, '7/8')
            .replace(/\u00A0/g, ' ')
            .replace(new RegExp('[^\\t\\n\\r -~]', 'g'), '')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trimStart();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, isLoading]);

    const handleSend = useCallback(async (content: string) => {
        const userEntry = await onAddEntry('user', content);
        setIsLoading(true);

        let assistantContent = '';
        let nextDay = progress.currentDay;
        let nextPhase = progress.currentPhase;
        const assistantEntry = await onAddEntry('assistant', '');

        const phaseNames = ['Prep & Foundation', 'Fungal Elimination', 'Parasite Cleanse', 'Heavy Metal Detox'];
        const dayLabel = getDayLabel(progress.currentDay);
        const enhancedContext = [
            `${dayLabel}, Phase ${progress.currentPhase}: ${phaseNames[progress.currentPhase - 1]}`,
            'Reply in a natural, conversational tone.',
            'Use plain English and make the next step feel simple.',
            'Default to redirect-first behavior when the app already has the answer.',
            'Use English only.',
            'Use only standard ASCII keyboard characters. No non-English words, accented text, curly quotes, emoji, or non-Latin scripts.',
            'Keep the morning elixir simple by default. Do not list every variation unless the user asks for the differences.',
            'Never show internal markers or hidden tags.',
            buildProtocolChatContext(progress.currentDay),
        ].join(' ');

        const mappedMsgs = [...entries, userEntry].map((entry) => ({
            id: entry.id,
            role: entry.role,
            content: entry.content,
            timestamp: new Date(entry.createdAt).getTime(),
        }));

        try {
            await streamChat({
                messages: [...mappedMsgs, { id: 'new', role: 'user' as const, content, timestamp: Date.now() }],
                context: enhancedContext,
                brainProfile,
                brainSnapshot,
                symptoms,
                onDelta: (chunk) => {
                    assistantContent += chunk;
                    const progressMatch = assistantContent.match(/\[PROGRESS_UPDATE:day=(\d+)\]/);
                    if (progressMatch) {
                        const newDay = Math.min(Math.max(parseInt(progressMatch[1], 10), 0), 21);
                        nextDay = newDay;
                        nextPhase = newDay === 0 ? 1 : (newDay <= 7 ? 2 : (newDay <= 14 ? 3 : 4)) as 1 | 2 | 3 | 4;
                    }
                    assistantContent = sanitizeAssistantText(assistantContent);
                    onUpdateEntry(assistantEntry.id, assistantContent);
                },
                onDone: () => {
                    void (async () => {
                        try {
                            assistantContent = sanitizeAssistantText(assistantContent).trim();
                            await onFinalizeEntry(assistantEntry.id, assistantContent);

                            const shoppingActions = parseGutBrainShoppingActions(assistantContent);
                            if (shoppingActions.length && onApplyShoppingActions) {
                                await onApplyShoppingActions(shoppingActions);
                            }

                            await onRefreshBrain(
                                [
                                    ...entries,
                                    userEntry,
                                    {
                                        ...assistantEntry,
                                        content: getGutBrainDisplayText(assistantContent),
                                    },
                                ],
                                { currentDay: nextDay, currentPhase: nextPhase },
                                { silent: true, memoryProfile: brainProfile },
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    })();
                },
                onError: (error) => {
                    setIsLoading(false);
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            });
        } catch {
            setIsLoading(false);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        }
    }, [
        entries,
        onAddEntry,
        onApplyShoppingActions,
        onFinalizeEntry,
        onUpdateEntry,
        progress.currentDay,
        progress.currentPhase,
        brainProfile,
        brainSnapshot,
        symptoms,
        onRefreshBrain,
        sanitizeAssistantText,
    ]);

    useEffect(() => {
        if (pendingPrompt && !isLoading) {
            handleSend(pendingPrompt);
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
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">Coach</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Start new chat"
                                onClick={() => void onStartNewChat?.()}
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
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <div className="min-w-0">
                            <h3 className="font-semibold text-sm">{GUT_BRAIN_AI_NAME}</h3>
                            <p className="text-xs text-muted-foreground">
                                {getDayLabel(progress.currentDay)} · Ask for help, simplify today, or troubleshoot what is blocking you
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Start new chat"
                            onClick={() => void onStartNewChat?.()}
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
                                const isStreaming = isLast && entry.role === 'assistant' && isLoading;
                                return (
                                    <ChatMessage
                                        key={entry.id}
                                        role={entry.role}
                                        content={entry.role === 'assistant' ? sanitizeAssistantText(entry.content) : entry.content}
                                        timestamp={new Date(entry.createdAt).getTime()}
                                        isStreaming={isStreaming}
                                        enableChoices={entry.role === 'assistant' && isLast && !isLoading}
                                        onChoiceSelect={(choice) => {
                                            void handleSend(choice);
                                        }}
                                        onActionSelect={onCoachAction}
                                    />
                                );
                            })}
                            {isLoading && entries[entries.length - 1]?.role !== 'assistant' && (
                                <div className="mb-4 flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20">
                                        <Leaf className="w-4 h-4 text-emerald-400" />
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
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg"
                        onClick={scrollToBottom}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div data-tour="today-actions" className={cn(isMobile ? "pb-1" : "")}>
                <ChatInput
                    onSend={handleSend}
                    disabled={isLoading}
                    placeholder={inputPlaceholder}
                    compact={isMobile}
                />
            </div>
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
                    <Sparkles className="h-5 w-5" />
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
