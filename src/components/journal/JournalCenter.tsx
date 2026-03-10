import { useRef, useState, useEffect, useCallback } from 'react';
import { MessageSquare, Bot, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { JournalEntry, UserProgress } from '@/hooks/useJournalStore';
import { streamChat } from '@/utils/streamChat';
import { buildProtocolChatContext, getDayLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface JournalCenterProps {
    progress: UserProgress;
    entries: JournalEntry[];
    onAddEntry: (role: 'user' | 'assistant', content: string) => Promise<JournalEntry>;
    onUpdateLastEntry: (content: string) => void;
    onFinalizeLastEntry: (content: string) => void;
    onOpenSymptomLogger: () => void;
    onOpenMoodTracker: () => void;
    pendingPrompt?: string | null;
    onPendingPromptConsumed?: () => void;
    isMobile?: boolean;
}

const SUGGESTED_PROMPTS = [
    "What are the 3 most important things for today?",
    "Explain the next checklist item in plain English.",
    "What can I eat today that stays on plan?",
    "Are these symptoms expected in this phase?",
];

export const JournalCenter = ({
    progress,
    entries,
    onAddEntry,
    onUpdateLastEntry,
    onFinalizeLastEntry,
    onOpenSymptomLogger,
    onOpenMoodTracker,
    pendingPrompt,
    onPendingPromptConsumed,
    isMobile = false,
}: JournalCenterProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const phase = getPhaseInfo(progress.currentPhase);

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
            .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
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
                onDelta: (chunk) => {
                    assistantContent += chunk;
                    assistantContent = sanitizeAssistantText(assistantContent);
                    onUpdateLastEntry(assistantContent);
                },
                onDone: () => {
                    assistantContent = sanitizeAssistantText(assistantContent).trim();
                    onFinalizeLastEntry(assistantContent);
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
            {/* Header — hidden on mobile (TopBar handles it) */}
            {!isMobile && (
                <div className="flex items-center px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="font-semibold text-sm">Today</h3>
                            <p className="text-xs text-muted-foreground">
                                {getDayLabel(progress.currentDay)} · Ask for help or log what changed
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 relative overflow-hidden">
                <div className="h-full overflow-y-auto px-4 pt-4" ref={scrollRef}>
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                                phase.bgColor, "border", phase.borderColor
                            )}>
                                <Sparkles className={cn("w-7 h-7", phase.color)} />
                            </div>
                            <h4 className="font-semibold text-base mb-1">
                                {progress.currentDay === 0
                                    ? "Prep Day starts here"
                                    : `Good ${getTimeOfDay()}! Ready for ${getDayLabel(progress.currentDay)}?`
                                }
                            </h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                {progress.currentDay === 0
                                    ? "Start by getting organized. Ask about shopping, supplements, or what matters most before Day 1."
                                    : "Use this space when you need clarity, meal ideas, or a quick way to log what changed today."
                                }
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-sm">
                                {SUGGESTED_PROMPTS.map((prompt, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSend(prompt)}
                                        disabled={isLoading}
                                        className="text-xs justify-start h-auto py-2.5 px-3 whitespace-normal text-left leading-relaxed"
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </div>
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
                                    />
                                );
                            })}
                            {isLoading && entries[entries.length - 1]?.role !== 'assistant' && (
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-secondary-foreground" />
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

            <div
                data-tour="today-actions"
                className={cn(
                    "px-4 py-2 border-t border-border/30 flex items-center gap-2",
                    isMobile && "overflow-x-auto"
                )}
            >
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "text-xs gap-1",
                        isMobile ? "h-8 px-3 rounded-full flex-none" : "h-7"
                    )}
                    onClick={onOpenSymptomLogger}
                >
                    📝 Log symptom
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "text-xs gap-1",
                        isMobile ? "h-8 px-3 rounded-full flex-none" : "h-7"
                    )}
                    onClick={onOpenMoodTracker}
                >
                    😊 Mood check
                </Button>
            </div>

            {/* Input */}
            <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                placeholder="Ask about today's plan, food, symptoms, or what to do next..."
            />
        </div>
    );
};

function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}
