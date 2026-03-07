import { useRef, useState, useEffect } from 'react';
import { MessageSquare, Bot, ArrowDown, Trash2, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { JournalEntry, UserProgress } from '@/hooks/useJournalStore';
import { streamChat } from '@/utils/streamChat';
import { getDayLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface JournalCenterProps {
    progress: UserProgress;
    entries: JournalEntry[];
    onAddEntry: (role: 'user' | 'assistant', content: string) => Promise<JournalEntry>;
    onUpdateLastEntry: (content: string) => void;
    onFinalizeLastEntry: (content: string) => void;
    onClearEntries: () => void;
    onExportChat: () => void;
    onOpenSymptomLogger: () => void;
    onOpenMoodTracker: () => void;
    onExtractActions?: (aiResponse: string) => string[];
    onAddCustomItem?: (label: string, source?: 'ai' | 'manual') => void;
    pendingPrompt?: string | null;
    onPendingPromptConsumed?: () => void;
    isMobile?: boolean;
}

const SUGGESTED_PROMPTS = [
    "What should I focus on today?",
    "How am I doing so far in this phase?",
    "What can I eat for dinner tonight?",
    "I'm feeling some die-off symptoms — is this normal?",
];

export const JournalCenter = ({
    progress,
    entries,
    onAddEntry,
    onUpdateLastEntry,
    onFinalizeLastEntry,
    onClearEntries,
    onExportChat,
    onOpenSymptomLogger,
    onOpenMoodTracker,
    onExtractActions,
    onAddCustomItem,
    pendingPrompt,
    onPendingPromptConsumed,
    isMobile = false,
}: JournalCenterProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const phase = getPhaseInfo(progress.currentPhase);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, isLoading]);

    // Consume pending prompts from checklist taps
    useEffect(() => {
        if (pendingPrompt && !isLoading) {
            handleSend(pendingPrompt);
            onPendingPromptConsumed?.();
        }
    }, [pendingPrompt]);

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

    const handleSend = async (content: string) => {
        await onAddEntry('user', content);
        setIsLoading(true);

        let assistantContent = '';
        await onAddEntry('assistant', '');

        const phaseNames = ['Prep & Foundation', 'Fungal Elimination', 'Parasite Cleanse', 'Heavy Metal Detox'];
        const dayLabel = getDayLabel(progress.currentDay);
        const enhancedContext = `${dayLabel}, Phase ${progress.currentPhase}: ${phaseNames[progress.currentPhase - 1]}`;

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
                    onUpdateLastEntry(assistantContent);
                },
                onDone: () => {
                    onFinalizeLastEntry(assistantContent);
                    setIsLoading(false);
                    // Extract actionable items from AI response and add to checklist
                    if (onExtractActions && assistantContent) {
                        const extracted = onExtractActions(assistantContent);
                        if (extracted.length > 0) {
                            toast({
                                title: `📋 ${extracted.length} task${extracted.length > 1 ? 's' : ''} added to your checklist`,
                                description: extracted[0] + (extracted.length > 1 ? ` +${extracted.length - 1} more` : ''),
                            });
                        }
                    }
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
    };

    const handleClear = () => {
        if (confirm("Clear today's journal entries? This cannot be undone.")) {
            onClearEntries();
            toast({ title: "Cleared", description: "Today's entries have been removed." });
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header — hidden on mobile (TopBar handles it) */}
            {!isMobile && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="font-semibold text-sm">Your Journal</h3>
                            <p className="text-xs text-muted-foreground">
                                {getDayLabel(progress.currentDay)} · {phase.shortName} Phase
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={onExportChat}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={entries.length === 0}
                            title="Export journal"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            onClick={handleClear}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={entries.length === 0}
                            title="Clear today's entries"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
                                    ? "Welcome to Your Healing Journey"
                                    : `Good ${getTimeOfDay()}! Ready for ${getDayLabel(progress.currentDay)}?`
                                }
                            </h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                {progress.currentDay === 0
                                    ? "I'm your personal nutrition coach. Let's get you set up for the 21-day protocol."
                                    : "Tell me how you're feeling, ask questions, or log your progress. I'm here for you."
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
                                        content={entry.content}
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

            {/* Quick actions bar — hidden on mobile (bottom nav handles it) */}
            {!isMobile && (
                <div className="px-4 py-2 border-t border-border/30 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={onOpenSymptomLogger}
                    >
                        📝 Log Symptom
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={onOpenMoodTracker}
                    >
                        😊 Mood Check
                    </Button>
                </div>
            )}

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
    );
};

function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}
