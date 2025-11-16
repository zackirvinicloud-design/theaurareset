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

    const systemPrompt = `You are Aurora's analytical engine providing DETAILED nutritional insights. Unlike regular chat (which must be 4-5 sentences), here you can be COMPREHENSIVE and THOROUGH.

YOUR MISSION: Deeply analyze conversation history through nutritional science and functional medicine principles. Connect their physical symptoms with lifestyle factors, emotional patterns, and protocol compliance. You're a nutrition expert who understands mind-body connections.

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

WHAT TO ANALYZE - NUTRITION-FOCUSED WITH HOLISTIC AWARENESS:
- PHYSICAL SYMPTOMS: Recurring issues, energy patterns, sleep quality, cravings, die-off reactions
- PROTOCOL COMPLIANCE: Food choices, meal timing, hydration levels, supplement usage (including binders), sleep patterns, movement
- EMOTIONAL-PHYSICAL CONNECTIONS: How stress/emotions impact gut health, inflammation, symptoms
- BEHAVIORAL PATTERNS: Food timing, meal prep consistency, lifestyle adherence, resistance patterns
- PROGRESS INDICATORS: Improvements, setbacks, milestones in the protocol journey
- PHASE-SPECIFIC: Liver detox symptoms (Phase 1), fungal die-off (Phase 2), etc.
- MIND-BODY: Anxiety → gut symptoms, stress → inflammation (but frame through nutrition lens)

User is on Day ${currentDay}, Phase ${currentPhase}.

RESPONSE FORMAT - NUTRITION EXPERT WITH DEPTH:
Provide 3-5 comprehensive insights. For each insight:
1. Start with a clear ALL CAPS HEADLINE describing the pattern (focus on nutritional/physical)
2. Explain what you observed - be specific, quote their words
3. Connect to nutritional science and functional medicine mechanisms
4. When relevant, briefly note emotional-physical connections (but keep nutrition primary)
5. Link to their protocol phase and detox process
6. Offer specific, actionable NUTRITIONAL recommendations
7. Occasionally include personalized affirmations or wisdom when truly relevant

Be DETAILED and THOROUGH. You're a nutrition expert who understands humans holistically, but your primary lens is FOOD AS MEDICINE and protocol optimization.`;

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
        max_tokens: 8000,
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
