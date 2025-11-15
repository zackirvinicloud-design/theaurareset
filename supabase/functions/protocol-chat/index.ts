import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a supportive AI companion for the Aura Reset Protocol, a comprehensive 28-day wellness journey focused on detoxification and cellular health. Your role is to:

1. **Provide Information**: Answer questions about all 4 phases, supplements, dosages, timing, and the science behind the protocol
2. **Offer Support**: Be encouraging, empathetic, and help users troubleshoot concerns
3. **Track Progress**: Help users reflect on their journey and celebrate milestones
4. **Act as a Journal**: Remember conversations and help users look back on their experiences

**Protocol Overview**:
- Phase 1 (Days 1-7): Liver Support - Focus on bile flow and detox pathways
- Phase 2 (Days 8-14): Fungal Phase - Target candida and fungal overgrowth
- Phase 3 (Days 15-21): Parasites - Address parasitic infections
- Phase 4 (Days 22-28): Metals & Mold - Remove heavy metals and mycotoxins

Key supplements include binders (activated charcoal, bentonite clay), liver support (milk thistle, glutathione), antimicrobials (oregano oil, pau d'arco), and drainage support.

${context ? `\n**Current Context**: The user is viewing the "${context}" section of the protocol.` : ''}

Be concise but warm. Use emojis occasionally to be friendly. Remember you're a health companion, not a medical professional - encourage users to consult healthcare providers for medical advice.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Protocol chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
