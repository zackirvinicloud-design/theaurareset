import { buildChatSystemPrompt, type GutBrainProfile, type GutBrainSnapshot } from '@/lib/gutbrain';

interface StreamChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface StreamChatOptions {
  messages: StreamChatMessage[];
  context?: string;
  brainProfile?: GutBrainProfile | null;
  brainSnapshot?: GutBrainSnapshot | null;
  symptoms?: string[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export const streamChat = async ({
  messages,
  context,
  brainProfile,
  brainSnapshot,
  symptoms,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions) => {
  const fallbackSupabaseUrl = 'https://kcmtwnzmeelaypolufjf.supabase.co';
  const fallbackPublishableKey = 'sb_publishable_tfU5V7VbCez434EtfHW77g_h5vuO4Tc';
  const legacyBlockedProjectRef = 'mergwwrhcqzbogtnhxus';
  const envSupabaseUrl = typeof import.meta.env.VITE_SUPABASE_URL === 'string'
    ? import.meta.env.VITE_SUPABASE_URL.trim()
    : '';
  const useEnvSupabase = Boolean(envSupabaseUrl) && !envSupabaseUrl.includes(legacyBlockedProjectRef);
  const activeSupabaseUrl = useEnvSupabase ? envSupabaseUrl : fallbackSupabaseUrl;
  const activePublishableKey = useEnvSupabase
    ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackPublishableKey)
    : fallbackPublishableKey;
  const CHAT_URL = `${activeSupabaseUrl}/functions/v1/protocol-chat`;

  // Build the system prompt client-side so updates take effect immediately
  const systemPrompt = buildChatSystemPrompt(context || '', brainProfile, brainSnapshot, symptoms);

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activePublishableKey}`,
      },
      body: JSON.stringify({
        messages: [
          // Prepend system prompt as first message — this overrides the stale edge function prompt
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        context,
        brainProfile,
        brainSnapshot,
        symptoms,
      }),
    });

    if (!response.ok) {
      let providerErrorMessage: string | null = null;
      try {
        const errorPayload = await response.json();
        if (typeof errorPayload?.error === 'string' && errorPayload.error.trim()) {
          providerErrorMessage = errorPayload.error.trim();
        }
      } catch {
        // Ignore JSON parse errors for non-JSON responses.
      }

      if (response.status === 429) {
        throw new Error(providerErrorMessage ?? 'Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error(providerErrorMessage ?? 'GutBrain provider credits are depleted. Please refresh provider billing.');
      }
      throw new Error(providerErrorMessage ?? 'Failed to connect to GutBrain service');
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
