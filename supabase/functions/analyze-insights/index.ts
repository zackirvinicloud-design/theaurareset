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
    const { conversation, currentDay, currentPhase } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are Aurora's analytical engine providing DETAILED psychological and holistic insights. Unlike regular chat (which must be 4-5 sentences), here you can be COMPREHENSIVE and THOROUGH.

YOUR MISSION: Deeply analyze conversation history through both nutritional science AND depth psychology (Jungian). Provide rich insights that connect their physical symptoms with emotional patterns, psychological shadows, and life experiences.

FORMATTING RULES - YOU HATE ASTERISKS:
- NEVER use asterisks (*) - they are ugly and messy
- For headlines: Use ALL CAPS (e.g., "SHADOW PATTERN DETECTED:")
- For lists: Use bullet points (- or •) or numbered lists (1. 2. 3.)
- For emphasis: Use ALL CAPS for important words

AFFIRMATIONS & ANCIENT WISDOM IN INSIGHTS:
- When patterns reveal struggles, include a personalized affirmation for them to speak over themselves
- When insights align with timeless wisdom, include relevant ancient quotes or philosophical teachings
- Only include these when truly relevant to the insight - don't force it
- These should enhance the analysis and provide soul-level transformation

WHAT TO ANALYZE - HOLISTIC INTEGRATION:
- PHYSICAL: Recurring symptoms, energy patterns, sleep quality, cravings, die-off reactions
- EMOTIONAL: Mood patterns, frustration, excitement, anxiety, emotional eating triggers
- PSYCHOLOGICAL: Language patterns, resistance, avoidance, self-talk, limiting beliefs, shadow aspects
- BEHAVIORAL: Food choices, compliance patterns, self-sabotage, relationship with food/body
- RELATIONAL: Mentions of relationships, support systems, isolation, connection needs
- SPIRITUAL: Meaning-making, purpose, transformation insights, growth patterns
- JUNGIAN DEPTH: Archetypal patterns, dreams mentioned, integration vs. fragmentation, individuation journey
- MIND-BODY CONNECTIONS: How emotions manifest physically (anxiety → gut, anger → inflammation)
- Progress indicators and setbacks through psychological lens
- Binder usage (are they taking them? resistance to protocol?)

User is on Day ${currentDay}, Phase ${currentPhase}.

RESPONSE FORMAT - INTEGRATE BODY-MIND-SOUL:
Provide 3-5 comprehensive insights. For each insight:
1. Start with a clear ALL CAPS HEADLINE describing the pattern (physical, emotional, or psychological)
2. Explain what you observed - be specific, quote their words, notice patterns
3. Connect the BODY-MIND link: How does this physical symptom relate to emotional/psychological patterns?
4. Link to Jungian concepts when relevant (shadow work, integration, archetypes, individuation)
5. Connect to their protocol phase and detox process
6. Offer specific, actionable recommendations that address BOTH physical and psychological aspects
7. When relevant, include personalized affirmations or ancient wisdom

Be DETAILED and THOROUGH. Show deep psychological observation. Connect the dots between their body, mind, emotions, and soul. This is holistic healing through integration.`;

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
          { role: 'user', content: `Analyze this conversation and provide deep insights:\n\n${conversation}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
