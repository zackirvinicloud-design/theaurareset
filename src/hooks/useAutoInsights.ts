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
    // Insights notifications removed - user will manually check when desired
  }, [messages, userProgress, onInsightsGenerated]);
};
