import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildMercuryDecisionArtifact,
  type MercuryInput,
  type MercuryDecisionArtifact,
} from "../_shared/mercury.ts";
import {
  buildMercuryProviderHeaders,
  resolveMercuryProvider,
  type MercuryProviderConfig,
} from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mercury-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MercuryRequest {
  input?: MercuryInput;
  withMemo?: boolean;
  persist?: boolean;
}

async function generateMercuryMemo(
  artifact: MercuryDecisionArtifact,
  provider: MercuryProviderConfig,
) {
  const systemPrompt = [
    "You are MERCURY, the CMO growth operator for The Gut Brain Journal.",
    "You must follow trust and compliance guardrails.",
    "Use the structured decision artifact as the source of truth.",
    "Do not invent metrics, citations, or outcomes.",
    "Produce concise operator language for BRAINIAC review.",
  ].join(" ");

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: buildMercuryProviderHeaders(provider),
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            "Turn this artifact into a memo with sections:",
            "1. Weekly Bottleneck",
            "2. Ranked Experiment Slate",
            "3. Content + Landing Test Pack",
            "4. Expected Conversion Impact",
            "5. Evidence + Confidence",
            "6. BRAINIAC Approval Required Actions",
            "",
            JSON.stringify(artifact, null, 2),
          ].join("\n"),
        },
      ],
      max_tokens: 1400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mercury AI gateway error (${provider.provider}): ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

async function persistArtifact(
  artifact: MercuryDecisionArtifact,
  input: MercuryInput,
  memo?: string,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: run, error: runError } = await supabase
    .from("mercury_runs")
    .insert({
      objective: artifact.objective,
      guardrail_status: artifact.guardrail_status,
      guardrail_reason: artifact.guardrail_reason,
      required_approval: artifact.required_approval,
      source_citations: artifact.source_citations,
      input_payload: input,
      artifact_payload: artifact,
      model_memo: memo ?? null,
    })
    .select("id")
    .single();

  if (runError) {
    throw runError;
  }

  const rows = artifact.ranked_experiments.map((experiment, index) => ({
    run_id: run.id,
    experiment_index: index,
    experiment_id: experiment.id,
    title: experiment.title,
    expected_lift: experiment.expected_lift,
    confidence: experiment.confidence,
    effort: experiment.effort,
    risk: experiment.risk,
    time_to_signal: experiment.time_to_signal,
    approval_required: experiment.approval_required,
    experiment_payload: experiment,
  }));

  const { error: experimentsError } = await supabase
    .from("mercury_experiments")
    .insert(rows);

  if (experimentsError) {
    throw experimentsError;
  }

  return run.id as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const configuredKey = Deno.env.get("MERCURY_API_KEY");
    if (!configuredKey) {
      throw new Error("MERCURY_API_KEY is not configured");
    }

    const providedKey = req.headers.get("x-mercury-key");
    if (providedKey !== configuredKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = (await req.json()) as MercuryRequest;
    const artifact = buildMercuryDecisionArtifact(payload.input ?? {});
    const persist = payload.persist ?? true;

    let memo: string | undefined;
    if (payload.withMemo ?? true) {
      const provider = resolveMercuryProvider();
      memo = await generateMercuryMemo(artifact, provider);
    }

    const runId = persist ? await persistArtifact(artifact, payload.input ?? {}, memo) : null;

    return new Response(
      JSON.stringify({
        artifact,
        memo,
        runId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("MERCURY planner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
