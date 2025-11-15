import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Download, Trash2, Settings, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ProgressSettingsDialog } from './ProgressSettingsDialog';
import { ProgressCard } from './ProgressCard';
import { useChatStore } from '@/hooks/useChatStore';
import { streamChat } from '@/utils/streamChat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  className?: string;
  context?: string;
}

const SUGGESTED_PROMPTS = [
  "What should I expect in Phase 1?",
  "Tell me about the binders",
  "I'm feeling tired, is this normal?",
  "What supplements should I take today?",
];

export const ChatPanel = ({ className, context }: ChatPanelProps) => {
  const { messages, userProgress, addMessage, updateLastMessage, updateProgress, clearMessages, exportChat } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    addMessage({ role: 'user', content });
    setIsLoading(true);

    let assistantContent = '';
    const assistantMsg = addMessage({ role: 'assistant', content: '' });

    try {
      await streamChat({
        messages: [...messages, { id: '0', role: 'user', content, timestamp: Date.now() }],
        context,
        onDelta: (chunk) => {
          assistantContent += chunk;
          updateLastMessage(assistantContent);
        },
        onDone: () => {
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
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      clearMessages();
      toast({
        title: "Chat cleared",
        description: "All messages have been removed.",
      });
    }
  };

  const handleNextDay = () => {
    const newDay = Math.min(userProgress.currentDay + 1, 28);
    const newPhase = Math.ceil(newDay / 7) as 1 | 2 | 3 | 4;
    updateProgress({ currentDay: newDay, currentPhase: newPhase });
    toast({
      title: "Progress updated",
      description: `Advanced to Day ${newDay}, Phase ${newPhase}`,
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Protocol Companion</h3>
            <p className="text-xs text-muted-foreground">
              Day {userProgress.currentDay} · Phase {userProgress.currentPhase}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSettingsOpen(true)}
            title="Update progress"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={exportChat}
            disabled={messages.length === 0}
            title="Export chat"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={messages.length === 0}
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <ProgressCard
        currentDay={userProgress.currentDay}
        currentPhase={userProgress.currentPhase}
        onNextDay={handleNextDay}
        onAdjust={() => setSettingsOpen(true)}
      />

      {/* Messages */}
      <ScrollArea className="flex-1 pt-4 px-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">Start your journey conversation</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ask me anything about the protocol, track your progress, or use me as a journal.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs justify-start"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} {...msg} />
            ))}
            {isLoading && (
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
          </>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />

      {/* Progress Settings Dialog */}
      <ProgressSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentDay={userProgress.currentDay}
        onSave={(day, phase) => {
          updateProgress({ currentDay: day, currentPhase: phase });
          setSettingsOpen(false);
          toast({
            title: "Progress updated",
            description: `Updated to Day ${day}, Phase ${phase}`,
          });
        }}
      />
    </div>
  );
};
