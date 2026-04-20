import type {
  GutBrainProfile,
  GutBrainRecipeLibraryEntry,
  GutBrainSnapshot,
  GutBrainTurnPayload,
} from '@/lib/gutbrain';

interface ChatRequestMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface RequestGutBrainTurnOptions {
  messages: ChatRequestMessage[];
  context?: string;
  brainProfile?: GutBrainProfile | null;
  brainSnapshot?: GutBrainSnapshot | null;
  symptoms?: string[];
  recipeLibrary?: GutBrainRecipeLibraryEntry[];
}

const fallbackSupabaseUrl = 'https://kcmtwnzmeelaypolufjf.supabase.co';
const fallbackPublishableKey = 'sb_publishable_tfU5V7VbCez434EtfHW77g_h5vuO4Tc';
const legacyBlockedProjectRef = 'mergwwrhcqzbogtnhxus';

const resolveChatEndpoint = () => {
  const envSupabaseUrl = typeof import.meta.env.VITE_SUPABASE_URL === 'string'
    ? import.meta.env.VITE_SUPABASE_URL.trim()
    : '';
  const useEnvSupabase = Boolean(envSupabaseUrl) && !envSupabaseUrl.includes(legacyBlockedProjectRef);
  const activeSupabaseUrl = useEnvSupabase ? envSupabaseUrl : fallbackSupabaseUrl;
  const activePublishableKey = useEnvSupabase
    ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackPublishableKey)
    : fallbackPublishableKey;

  return {
    url: `${activeSupabaseUrl}/functions/v1/protocol-chat`,
    publishableKey: activePublishableKey,
  };
};

export const requestGutBrainTurn = async ({
  messages,
  context,
  brainProfile,
  brainSnapshot,
  symptoms,
  recipeLibrary,
}: RequestGutBrainTurnOptions): Promise<GutBrainTurnPayload> => {
  const { url, publishableKey } = resolveChatEndpoint();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify({
      messages: messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({ role: message.role, content: message.content })),
      context,
      brainProfile,
      brainSnapshot,
      symptoms,
      recipeLibrary,
    }),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const providerErrorMessage = typeof payload === 'object' && payload && 'error' in payload && typeof payload.error === 'string'
      ? payload.error.trim()
      : null;

    if (response.status === 429) {
      throw new Error(providerErrorMessage ?? 'Rate limit exceeded. Please try again in a moment.');
    }

    if (response.status === 402) {
      throw new Error(providerErrorMessage ?? 'GutBrain provider credits are depleted. Please refresh provider billing.');
    }

    throw new Error(providerErrorMessage ?? 'Failed to connect to GutBrain service');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('GutBrain returned an invalid response.');
  }

  return payload as GutBrainTurnPayload;
};
