export interface ChatProviderConfig {
  provider: "gemini";
  endpoint: string;
  apiKey: string;
  model: string;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function resolveChatProvider(): ChatProviderConfig {
  const geminiApiKey =
    Deno.env.get("GEMINI_API_KEY")
    ?? Deno.env.get("GOOGLE_API_KEY")
    ?? null;

  if (geminiApiKey) {
    return {
      provider: "gemini",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: geminiApiKey,
      model: Deno.env.get("GEMINI_MODEL")?.trim() || DEFAULT_GEMINI_MODEL,
    };
  }

  throw new Error("No GutBrain provider key configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY).");
}

export function buildChatProviderHeaders(config: ChatProviderConfig) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
}
