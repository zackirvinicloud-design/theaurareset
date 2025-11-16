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
      
      // Just notify the user to manually generate insights
      toast({
        title: "Time for deeper insights",
        description: "Aurora recommends updating your insights - tap the sparkle icon",
      });
    }
  }, [messages, userProgress, onInsightsGenerated]);
};
