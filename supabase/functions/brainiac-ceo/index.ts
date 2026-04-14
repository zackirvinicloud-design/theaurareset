import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildGrowthPlan,
  normalizeBusinessState,
  type BusinessStateInput,
  type GrowthPlan,
} from "../_shared/brainiac.ts";
import {
  buildChatProviderHeaders,
  resolveChatProvider,
  type ChatProviderConfig,
} from "../_shared/ai-provider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-brainiac-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PlannerRequest {
  businessState?: BusinessStateInput;
  persist?: boolean;
  withMemo?: boolean;
}

async function generateMemo(plan: GrowthPlan, provider: ChatProviderConfig) {
  const systemPrompt = [
    'You are BRAINIAC, the backend CEO planner for a software business.',
    'You are not inventing strategy from scratch. A deterministic planner already selected the constraint, scores, and decisions.',
    'Your job is to turn the plan into a concise operator memo.',
    'Do not invent metrics that are not present.',
    'Do not broaden the company beyond the supplied business context.',
    'Use plain English.',
    'Keep the memo high-signal and practical.',
  ].join(' ');

  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: buildChatProviderHeaders(provider),
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            'Convert this structured plan into a CEO memo with these sections:',
            '1. Primary Constraint',
            '2. What We Will Do This Cycle',
            '3. What We Will Not Do',
            '4. What Must Be Measured',
            '',
            JSON.stringify(plan, null, 2),
          ].join('\n'),
        },
      ],
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error (${provider.provider}): ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

async function persistPlan(plan: GrowthPlan, rawState: BusinessStateInput, memo?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: run, error: runError } = await supabase
    .from('brainiac_runs')
    .insert({
      business_name: plan.businessName,
      north_star_metric: plan.northStarMetric,
      primary_constraint: plan.primaryConstraint,
      primary_objective: plan.primaryObjective,
      state_payload: rawState,
      plan_payload: plan,
      model_memo: memo ?? null,
    })
    .select('id')
    .single();

  if (runError) {
    throw runError;
  }

  const decisionRows = plan.decisions.map((decision, index) => ({
    run_id: run.id,
    decision_index: index,
    area: decision.area,
    title: decision.title,
    rationale: decision.rationale,
    expected_outcome: decision.expectedOutcome,
    leading_metric: decision.leadingMetric,
    first_step: decision.firstStep,
    reversible: decision.reversible,
    status: 'proposed',
    decision_payload: decision,
  }));

  const { error: decisionsError } = await supabase
    .from('brainiac_decisions')
    .insert(decisionRows);

  if (decisionsError) {
    throw decisionsError;
  }

  return run.id as string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const configuredKey = Deno.env.get('BRAINIAC_API_KEY');
    if (!configuredKey) {
      throw new Error('BRAINIAC_API_KEY is not configured');
    }

    const providedKey = req.headers.get('x-brainiac-key');
    if (providedKey !== configuredKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { businessState, persist = true, withMemo = true } = (await req.json()) as PlannerRequest;
    const normalizedState = normalizeBusinessState(businessState);
    const plan = buildGrowthPlan(normalizedState);

    let memo: string | undefined;
    if (withMemo) {
      const hasGeminiKey = Boolean(Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY"));
      if (hasGeminiKey) {
        const provider = resolveChatProvider();
        memo = await generateMemo(plan, provider);
      }
    }

    const runId = persist ? await persistPlan(plan, businessState ?? {}, memo) : null;

    return new Response(
      JSON.stringify({
        plan,
        memo,
        runId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('BRAINIAC planner error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
