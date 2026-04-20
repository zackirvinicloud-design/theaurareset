export interface ChatProviderConfig {
  provider: "gemini";
  endpoint: string;
  apiKey: string;
  primaryModel: string;
  fallbackModel: string;
}

export interface MercuryProviderConfig {
  provider: "openai";
  endpoint: string;
  apiKey: string;
  model: string;
}

const DEFAULT_GEMINI_PRIMARY_MODEL = "gemini-3-flash-preview";
const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini-2025-04-14";

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
      primaryModel:
        Deno.env.get("GEMINI_MODEL_PRIMARY")?.trim()
        || Deno.env.get("GEMINI_MODEL")?.trim()
        || DEFAULT_GEMINI_PRIMARY_MODEL,
      fallbackModel:
        Deno.env.get("GEMINI_MODEL_FALLBACK")?.trim()
        || DEFAULT_GEMINI_FALLBACK_MODEL,
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

export function resolveMercuryProvider(): MercuryProviderConfig {
  const openAiApiKey = Deno.env.get("OPENAI_API_KEY")?.trim() ?? "";
  if (!openAiApiKey) {
    throw new Error("No Mercury provider key configured. Set OPENAI_API_KEY.");
  }

  return {
    provider: "openai",
    endpoint: Deno.env.get("OPENAI_CHAT_COMPLETIONS_ENDPOINT")?.trim() || "https://api.openai.com/v1/chat/completions",
    apiKey: openAiApiKey,
    model: Deno.env.get("MERCURY_MODEL")?.trim() || DEFAULT_OPENAI_MODEL,
  };
}

export function buildMercuryProviderHeaders(config: MercuryProviderConfig) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
}
