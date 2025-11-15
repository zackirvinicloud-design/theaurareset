import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ChatMessage, UserProgress } from './useChatStore';

interface UseAutoInsightsProps {
  messages: ChatMessage[];
  userProgress: UserProgress;
  onInsightsGenerated?: (insights: string) => void;
}

export const useAutoInsights = ({ messages, userProgress, onInsightsGenerated }: UseAutoInsightsProps) => {
  const lastInsightCountRef = useRef(0);

  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    
    if (userMessageCount > 0 && userMessageCount % 5 === 0 && userMessageCount !== lastInsightCountRef.current) {
      lastInsightCountRef.current = userMessageCount;
      
      const triggerAutoInsights = async () => {
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

          if (data?.insights) {
            // Store in localStorage
            localStorage.setItem('aura-protocol-latest-insights', data.insights);
            
            // Dispatch custom event for the insights component
            window.dispatchEvent(new CustomEvent('auto-insights-generated', { detail: data.insights }));
            
            onInsightsGenerated?.(data.insights);
            toast({
              title: "New insights available",
              description: "Check the insights drawer to see Aurora's analysis",
            });
          }
        } catch (error) {
          console.error('Auto-insights failed:', error);
        }
      };
      
      triggerAutoInsights();
    }
  }, [messages, userProgress, onInsightsGenerated]);
};
