import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useChatStore } from '@/hooks/useChatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const INSIGHTS_STORAGE_KEY = 'aura-protocol-latest-insights';

export const ConversationInsights = () => {
  const { messages, userProgress } = useChatStore();
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load cached insights on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(INSIGHTS_STORAGE_KEY);
      if (cached) {
        setInsights(cached);
      }
    } catch (error) {
      console.error('Failed to load cached insights:', error);
    }
  }, []);

  // Save insights to cache when they change
  useEffect(() => {
    if (insights) {
      try {
        localStorage.setItem(INSIGHTS_STORAGE_KEY, insights);
      } catch (error) {
        console.error('Failed to cache insights:', error);
      }
    }
  }, [insights]);

  const generateInsights = async () => {
    if (messages.length === 0) {
      toast.error('No conversation history to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const conversationHistory = messages
        .slice(-20)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('analyze-insights', {
        body: {
          conversation: conversationHistory,
          currentDay: userProgress.currentDay,
          currentPhase: userProgress.currentPhase,
        },
      });

      if (error) throw error;

      setInsights(data.insights);
      toast.success('Insights generated');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Expose method to update insights from auto-generation
  useEffect(() => {
    const handleAutoInsights = (event: CustomEvent<string>) => {
      setInsights(event.detail);
    };
    
    window.addEventListener('auto-insights-generated' as any, handleAutoInsights as any);
    return () => window.removeEventListener('auto-insights-generated' as any, handleAutoInsights as any);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Aurora analyzes patterns in your journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generateInsights}
          disabled={isLoading || messages.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>

        {insights && (
          <ScrollArea className="max-h-[400px]">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm whitespace-pre-wrap">{insights}</div>
            </div>
          </ScrollArea>
        )}

        {!insights && messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Start chatting with Aurora to get personalized insights
          </p>
        )}
      </CardContent>
    </Card>
  );
};
