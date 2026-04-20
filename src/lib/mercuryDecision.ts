export interface MercuryDecisionRequest {
  input?: Record<string, unknown>;
  withMemo?: boolean;
  persist?: boolean;
}

export interface MercuryDecisionResponse {
  artifact: {
    decision_id: string;
    objective: "paid_conversions";
    generated_at: string;
    hypotheses: Array<Record<string, unknown>>;
    ranked_experiments: Array<Record<string, unknown>>;
    guardrail_status: "pass" | "blocked";
    guardrail_reason: string;
    required_approval: true;
    source_citations: string[];
  };
  memo?: string;
  runId?: string | null;
}

export async function fetchMercuryDecision(
  payload: MercuryDecisionRequest,
  options: {
    supabaseUrl: string;
    publishableKey: string;
    mercuryApiKey: string;
  },
): Promise<MercuryDecisionResponse> {
  const endpoint = `${options.supabaseUrl}/functions/v1/mercury-cmo`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.publishableKey}`,
      "x-mercury-key": options.mercuryApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mercury decision request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as MercuryDecisionResponse;
}
