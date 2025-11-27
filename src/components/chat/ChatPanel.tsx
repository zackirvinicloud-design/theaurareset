import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Download, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ProgressSettingsDialog } from './ProgressSettingsDialog';
import { ProgressCard } from './ProgressCard';
import { JournalHistory } from './JournalHistory';
import { InsightsDrawer } from '../insights/InsightsDrawer';
import { useChatStore } from '@/hooks/useChatStore';
import { useAutoInsights } from '@/hooks/useAutoInsights';
import { streamChat } from '@/utils/streamChat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  className?: string;
  context?: string;
  onClose?: () => void;
}

const SUGGESTED_PROMPTS = [
  "What should I prep for Day 0?",
  "When do I take my binders today?",
  "What can I order on DoorDash that's compliant?",
  "Is this die-off symptom normal for my phase?",
];

export const ChatPanel = ({ className, context, onClose }: ChatPanelProps) => {
  const { messages, userProgress, addMessage, updateLastMessage, updateProgress, clearMessages, exportChat } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-generate insights every 5 messages
  useAutoInsights({ messages, userProgress });

  // Daily motivation message
  useEffect(() => {
    const today = new Date().toDateString();
    const lastMotivationDate = localStorage.getItem('LAST_MOTIVATION_DATE');
    
    if (lastMotivationDate !== today && messages.length > 0) {
      const phase = userProgress.currentPhase;
      const motivationPrompts = [
        `Give me my daily motivation for day ${userProgress.currentDay}`,
        `What's my morning routine for phase ${phase}?`,
        `Motivate me for today's protocol`,
        `What should I focus on today?`
      ];
      
      const randomPrompt = motivationPrompts[Math.floor(Math.random() * motivationPrompts.length)];
      localStorage.setItem('LAST_MOTIVATION_DATE', today);
      
      // Auto-send motivation request after a brief delay
      setTimeout(() => {
        handleSend(randomPrompt);
      }, 500);
    }
  }, []); // Only run once on mount

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

    // Build enhanced context with user progress
    const phaseNames = ['Preliminary (Prep)', 'Fungal + Foundation', 'Parasites + Foundation', 'Heavy Metals + Foundation'];
    const dayLabel = userProgress.currentDay === 0 ? 'Day 0 (Prep)' : `Day ${userProgress.currentDay} of 21`;
    const enhancedContext = `${dayLabel}, Phase ${userProgress.currentPhase}: ${phaseNames[userProgress.currentPhase - 1]}${context ? `. Viewing: ${context}` : ''}`;

    try {
      await streamChat({
        messages: [...messages, { id: '0', role: 'user', content, timestamp: Date.now() }],
        context: enhancedContext,
        onDelta: (chunk) => {
          assistantContent += chunk;
          
          // Check for progress update marker
          const progressMatch = assistantContent.match(/\[PROGRESS_UPDATE:day=(\d+)\]/);
          if (progressMatch) {
            const newDay = Math.min(Math.max(parseInt(progressMatch[1]), 0), 21);
            const newPhase = newDay === 0 ? 1 : (newDay <= 7 ? 2 : (newDay <= 14 ? 3 : 4)) as 1 | 2 | 3 | 4;
            updateProgress({ currentDay: newDay, currentPhase: newPhase });
            
            // Remove the marker from the displayed content
            assistantContent = assistantContent.replace(/\[PROGRESS_UPDATE:day=\d+\]\s*/, '');
          }
          
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
    const newDay = Math.min(userProgress.currentDay + 1, 21);
    const newPhase = newDay === 0 ? 1 : (newDay <= 7 ? 2 : (newDay <= 14 ? 3 : 4)) as 1 | 2 | 3 | 4;
    updateProgress({ currentDay: newDay, currentPhase: newPhase });
    const dayLabel = newDay === 0 ? 'Day 0 (Prep)' : `Day ${newDay}`;
    toast({
      title: "Progress updated",
      description: `Advanced to ${dayLabel}, Phase ${newPhase}`,
    });
  };

  const handleDailyMotivation = () => {
    const phase = userProgress.currentPhase;
    const motivationPrompts = [
      `Give me my daily motivation for day ${userProgress.currentDay}`,
      `What's my morning routine for phase ${phase}?`,
      `Motivate me for today's protocol`,
      `What should I focus on today?`
    ];
    
    const randomPrompt = motivationPrompts[Math.floor(Math.random() * motivationPrompts.length)];
    handleSend(randomPrompt);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background chat-panel", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">Your Health Journal</h3>
              <p className="text-xs text-muted-foreground truncate">
                Day {userProgress.currentDay} · Phase {userProgress.currentPhase}
              </p>
            </div>
          </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <InsightsDrawer />
          <JournalHistory />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={exportChat}
                disabled={messages.length === 0}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export chat</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClear}
                disabled={messages.length === 0}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear chat</p>
            </TooltipContent>
          </Tooltip>
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
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
            <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
            <h4 className="font-semibold text-sm mb-2">Chat with your journal</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
              Document your journey, ask questions, or get support from your AI assistant anytime.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs justify-start h-auto py-2 px-3"
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
    </TooltipProvider>
  );
};
