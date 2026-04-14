import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  GUT_BRAIN_AI_NAME,
  buildGutBrainInsightPrompt,
  parseJsonResponse,
  type GutBrainProfilePayload,
  type GutBrainSnapshotPayload,
} from "../_shared/gutbrain.ts";
import { buildChatProviderHeaders, resolveChatProvider } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeInsightsResponse {
  profile: GutBrainProfilePayload;
  snapshot: GutBrainSnapshotPayload;
}

const fallbackResponse: AnalyzeInsightsResponse = {
  profile: {
    assistantName: GUT_BRAIN_AI_NAME,
    preferredName: null,
    protocolGoal: null,
    whyNow: null,
    motivationStyle: null,
    barriers: [],
    supportPreferences: [],
    wins: [],
    conversationSummary: "The conversation is still early, so GutBrain AI does not have a durable read yet.",
  },
  snapshot: {
    summary: "There is not enough grounded conversation yet to form a strong daily read.",
    nextStep: "Ask one concrete question about today or share what feels hardest right now.",
    signals: [],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      conversation,
      currentDay,
      currentPhase,
      existingProfile,
      latestSnapshot,
    } = await req.json();

    const provider = resolveChatProvider();

    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: buildChatProviderHeaders(provider),
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content: buildGutBrainInsightPrompt(
              typeof conversation === "string" ? conversation : "",
              Number.isFinite(currentDay) ? currentDay : 0,
              Number.isFinite(currentPhase) ? currentPhase : 1,
              existingProfile ?? null,
              latestSnapshot ?? null,
            ),
          },
          {
            role: "user",
            content: "Return the updated memory and insight snapshot as JSON only.",
          },
        ],
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errorText = await response.text();
      throw new Error(`AI gateway error (${provider.provider}) ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseJsonResponse<AnalyzeInsightsResponse>(content);

    return new Response(JSON.stringify({
      profile: parsed.profile ?? fallbackResponse.profile,
      snapshot: parsed.snapshot ?? fallbackResponse.snapshot,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze insights error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
