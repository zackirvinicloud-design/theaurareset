import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, Leaf, ArrowDown, Sparkles, Brain, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { InsightsDrawer } from '@/components/insights/InsightsDrawer';
import { CoachHistory } from '@/components/chat/CoachHistory';
import { JournalEntry, UserProgress } from '@/hooks/useJournalStore';
import { useGutBrainProfile } from '@/hooks/useGutBrainProfile';
import { streamChat } from '@/utils/streamChat';
import { buildProtocolChatContext, getDayLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GUT_BRAIN_AI_NAME, getGutBrainStarterState } from '@/lib/gutbrain';

interface JournalCenterProps {
    userId: string | null;
    progress: UserProgress;
    entries: JournalEntry[];
    onAddEntry: (role: 'user' | 'assistant', content: string) => Promise<JournalEntry>;
    onUpdateLastEntry: (content: string) => void;
    onFinalizeLastEntry: (content: string) => void;
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
    onUpdateLastEntry,
    onFinalizeLastEntry,
    pendingPrompt,
    onPendingPromptConsumed,
    isMobile = false,
    mobileVariant = 'default',
}: JournalCenterProps) => {
    const gutBrain = useGutBrainProfile(userId);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const phase = getPhaseInfo(progress.currentPhase);
    const starterState = getGutBrainStarterState(progress, gutBrain.profile, gutBrain.snapshot, { mobile: isMobile });
    const isMobileHelpMode = isMobile && mobileVariant === 'help';
    const userMessageCount = useMemo(() => entries.filter(e => e.role === 'user').length, [entries]);
    const messagesUntilInsight = userMessageCount === 0 ? 5 : 5 - (userMessageCount % 5);
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

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, isLoading]);

    const handleSend = useCallback(async (content: string) => {
        await onAddEntry('user', content);
        setIsLoading(true);

        let assistantContent = '';
        let nextDay = progress.currentDay;
        let nextPhase = progress.currentPhase;
        await onAddEntry('assistant', '');

        const phaseNames = ['Prep & Foundation', 'Fungal Elimination', 'Parasite Cleanse', 'Heavy Metal Detox'];
        const dayLabel = getDayLabel(progress.currentDay);
        const enhancedContext = [
            `${dayLabel}, Phase ${progress.currentPhase}: ${phaseNames[progress.currentPhase - 1]}`,
            'Reply in a natural, conversational tone.',
            'Use plain English and make the next step feel simple.',
            'Use English only.',
            'Use only standard ASCII keyboard characters. No non-English words, accented text, curly quotes, emoji, or non-Latin scripts.',
            'Keep the morning elixir simple by default. Do not list every variation unless the user asks for the differences.',
            'Never show internal markers or hidden tags.',
            buildProtocolChatContext(progress.currentDay),
        ].join(' ');

        const mappedMsgs = entries.map(e => ({
            id: e.id,
            role: e.role,
            content: e.content,
            timestamp: new Date(e.createdAt).getTime(),
        }));

        try {
            await streamChat({
                messages: [...mappedMsgs, { id: 'new', role: 'user' as const, content, timestamp: Date.now() }],
                context: enhancedContext,
                brainProfile: gutBrain.profile,
                brainSnapshot: gutBrain.snapshot,
                onDelta: (chunk) => {
                    assistantContent += chunk;
                    const progressMatch = assistantContent.match(/\[PROGRESS_UPDATE:day=(\d+)\]/);
                    if (progressMatch) {
                        const newDay = Math.min(Math.max(parseInt(progressMatch[1], 10), 0), 21);
                        nextDay = newDay;
                        nextPhase = newDay === 0 ? 1 : (newDay <= 7 ? 2 : (newDay <= 14 ? 3 : 4)) as 1 | 2 | 3 | 4;
                    }
                    assistantContent = sanitizeAssistantText(assistantContent);
                    onUpdateLastEntry(assistantContent);
                },
                onDone: () => {
                    assistantContent = sanitizeAssistantText(assistantContent).trim();
                    onFinalizeLastEntry(assistantContent);
                    // Auto-refresh insights every 5 user messages
                    const newUserCount = entries.filter(e => e.role === 'user').length + 1;
                    if (newUserCount % 5 === 0) {
                        void gutBrain.refreshBrain(
                            [
                                ...entries,
                                {
                                    id: `user-${Date.now()}`,
                                    dayNumber: progress.currentDay,
                                    role: 'user',
                                    content,
                                    createdAt: new Date().toISOString(),
                                },
                                {
                                    id: `assistant-${Date.now()}`,
                                    dayNumber: progress.currentDay,
                                    role: 'assistant',
                                    content: assistantContent,
                                    createdAt: new Date().toISOString(),
                                },
                            ],
                            { currentDay: nextDay, currentPhase: nextPhase },
                            { silent: true, force: true },
                        );
                    }
                    setIsLoading(false);
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
        onFinalizeLastEntry,
        onUpdateLastEntry,
        gutBrain,
        progress.currentDay,
        progress.currentPhase,
        sanitizeAssistantText,
    ]);

    // Consume pending prompts from checklist taps
    useEffect(() => {
        if (pendingPrompt && !isLoading) {
            handleSend(pendingPrompt);
            onPendingPromptConsumed?.();
        }
    }, [pendingPrompt, isLoading, handleSend, onPendingPromptConsumed]);

    // Scroll listener for "scroll to bottom" button
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
        <div data-tour="today-space" className="flex flex-col h-full">
            {isMobileHelpMode ? (
                <div className="border-b border-border/50">
                    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">Coach</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <CoachHistory
                                userId={userId}
                                currentDay={progress.currentDay}
                                compact
                            />
                            <InsightsDrawer
                                brain={gutBrain}
                                entries={entries.map((entry) => ({
                                    id: entry.id,
                                    role: entry.role,
                                    content: entry.content,
                                    createdAt: entry.createdAt,
                                }))}
                                progress={{
                                    currentDay: progress.currentDay,
                                    currentPhase: progress.currentPhase,
                                }}
                                compact
                                onUpdateProfile={gutBrain.updateProfile}
                            />
                        </div>
                    </div>
                    {userMessageCount > 0 && (
                        <div className="flex items-center justify-between gap-2 px-4 py-1.5 bg-muted/30 border-t border-border/30">
                            <div className="flex items-center gap-1.5">
                                <Brain className="w-3 h-3 text-primary" />
                                <span className="text-[11px] text-muted-foreground">
                                    {messagesUntilInsight === 5
                                        ? 'Insights just updated'
                                        : `${messagesUntilInsight} message${messagesUntilInsight === 1 ? '' : 's'} until next insight`
                                    }
                                </span>
                            </div>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'w-1.5 h-1.5 rounded-full transition-colors',
                                            i < (userMessageCount % 5 || (messagesUntilInsight === 5 ? 5 : 0))
                                                ? 'bg-primary'
                                                : 'bg-border'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : !isMobile && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <div className="min-w-0">
                            <h3 className="font-semibold text-sm">{GUT_BRAIN_AI_NAME}</h3>
                            <p className="text-xs text-muted-foreground">
                                {getDayLabel(progress.currentDay)} · Ask for help, open insights, or get the next best move
                            </p>
                        </div>
                    </div>
                    <InsightsDrawer
                        brain={gutBrain}
                        entries={entries.map((entry) => ({
                            id: entry.id,
                            role: entry.role,
                            content: entry.content,
                            createdAt: entry.createdAt,
                        }))}
                        progress={{
                            currentDay: progress.currentDay,
                            currentPhase: progress.currentPhase,
                        }}
                        onUpdateProfile={gutBrain.updateProfile}
                    />
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className={cn(
                        'h-full overflow-y-auto',
                        isMobileHelpMode ? 'px-4 pt-4' : isMobile ? 'px-3 pt-3' : 'px-4 pt-4',
                    )}
                    ref={scrollRef}
                >
                    {entries.length === 0 ? (
                        isMobileHelpMode ? (
                            <div className="pb-4">
                                <div className="space-y-3 border-b border-border/40 pb-4">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Ask when stuck
                                        </p>
                                        <h4 className="text-base font-semibold text-foreground">
                                            Get clarification without leaving today&apos;s plan.
                                        </h4>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Use Coach for a blocker, symptom, timing question, or a simpler version of the day.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {starterState.prompts.map((prompt) => (
                                            <Button
                                                key={prompt.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSend(prompt.prompt)}
                                                disabled={isLoading}
                                                className="h-auto rounded-full border-border/70 px-3 py-2 text-xs font-medium leading-relaxed shadow-none whitespace-normal"
                                            >
                                                {prompt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : isMobile ? (
                            <div className="flex h-full flex-col pt-2 pb-4">
                                <div className="rounded-[28px] border border-border/60 bg-card/95 p-4 shadow-sm">
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                                    >
                                        {starterState.eyebrow}
                                    </Badge>
                                    <div className="mt-3 space-y-2">
                                        <h4 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                                            {starterState.title}
                                        </h4>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {starterState.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        {starterState.prompts.map((prompt) => (
                                            <Button
                                                key={prompt.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSend(prompt.prompt)}
                                                disabled={isLoading}
                                                className="h-auto justify-start rounded-2xl border-border/70 bg-background px-3 py-3 text-left text-[13px] font-medium leading-relaxed text-foreground shadow-none whitespace-normal"
                                            >
                                                {prompt.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                                        Start with the question that removes the most confusion right now.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                                    phase.bgColor, "border", phase.borderColor
                                )}>
                                    <Sparkles className={cn("w-7 h-7", phase.color)} />
                                </div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                    {starterState.eyebrow}
                                </p>
                                <h4 className="font-semibold text-base mb-1">
                                    {starterState.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                    {starterState.description}
                                </p>
                                <div className="flex flex-col gap-2 w-full max-w-sm">
                                    {starterState.prompts.map((prompt) => (
                                        <Button
                                            key={prompt.label}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSend(prompt.prompt)}
                                            disabled={isLoading}
                                            className="text-xs justify-start h-auto py-2.5 px-3 whitespace-normal text-left leading-relaxed"
                                        >
                                            {prompt.prompt}
                                        </Button>
                                    ))}
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
                                    />
                                );
                            })}
                            {isLoading && entries[entries.length - 1]?.role !== 'assistant' && (
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20 flex items-center justify-center">
                                        <Leaf className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Scroll to bottom */}
                {showScrollButton && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 rounded-full shadow-lg z-10 h-10 w-10"
                        onClick={scrollToBottom}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div data-tour="today-actions" className={cn(isMobile ? "pb-1" : "")}>
                {/* Input */}
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
