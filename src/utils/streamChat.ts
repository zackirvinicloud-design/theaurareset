import { ChatMessage } from '@/hooks/useChatStore';

interface StreamChatOptions {
  messages: ChatMessage[];
  context?: string;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export const streamChat = async ({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions) => {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://mergwwrhcqzbogtnhxus.supabase.co'}/functions/v1/protocol-chat`;

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmd3d3JoY3F6Ym9ndG5oeHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTc0NTgsImV4cCI6MjA3ODc3MzQ1OH0.t0f8RGXnEPaAVC63bKFcHGg9xrVt9gIsW8fMxI7uJ-I'}`,
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        context,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      throw new Error('Failed to connect to AI service');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            onDelta(content);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    if (textBuffer.trim()) {
      for (const raw of textBuffer.split('\n')) {
        if (!raw || raw.startsWith(':')) continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Ignore partial leftovers
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
};
