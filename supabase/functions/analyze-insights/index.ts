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

    const systemPrompt = `You are Aurora's analytical engine providing DETAILED insights. Unlike regular chat (which must be 4-5 sentences), here you can be COMPREHENSIVE and THOROUGH.

YOUR MISSION: Deeply analyze conversation history and provide rich, detailed insights about their health journey.

FORMATTING RULES - YOU HATE ASTERISKS:
- NEVER use asterisks (*) - they're ugly and messy
- For headlines: Use ALL CAPS (e.g., "PATTERN DETECTED:")
- For lists: Use bullet points (- or •) or numbered lists (1. 2. 3.)
- For emphasis: Use ALL CAPS for important words

WHAT TO ANALYZE:
- Recurring symptoms or complaints mentioned across multiple messages
- Emotional patterns (frustration, excitement, concern, motivation levels)
- Behavioral patterns (mentioning specific foods, timing of issues, lifestyle factors)
- Progress indicators (improvements, setbacks, milestones)
- Die-off reactions vs. genuine health concerns
- Phase-specific patterns (liver symptoms in Phase 1, fungal issues in Phase 2, etc.)
- Connections between what they're eating and how they feel
- Sleep quality mentions and energy level patterns
- Binder usage compliance (are they actually taking them?)
- Mental health connections to physical symptoms via gut-brain axis

User is on Day ${currentDay}, Phase ${currentPhase}.

RESPONSE FORMAT:
Provide 3-5 comprehensive insights. For each insight:
1. Start with a clear ALL CAPS HEADLINE describing the pattern
2. Explain what you observed across their messages (be specific, quote if needed)
3. Connect it to the science - cite mechanisms, explain the biochemistry
4. Link to their current protocol phase and detox process
5. Offer specific, actionable recommendations

Be DETAILED and THOROUGH. Show deep observation. Connect the dots. This is where you shine with comprehensive analysis.`;

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
