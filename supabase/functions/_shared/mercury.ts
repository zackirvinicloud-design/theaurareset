export type MercuryObjective = "paid_conversions";

export type MercuryStatus = "approved" | "adapted" | "rejected";

export interface TranscriptCitation {
  sourceId: string;
  excerpt: string;
  confidence: number;
  status: MercuryStatus;
}

export interface PerformanceMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  landingConversionRate?: number;
  checkoutConversionRate?: number;
  paidCount?: number;
  day1ActivationRate?: number;
}

export interface GrowthSignal {
  id: string;
  channel: string;
  theme: string;
  painPoint: string;
  observedLift?: number;
  evidenceStrength: number;
  sourceIds: string[];
}

export interface ExperimentHypothesis {
  id: string;
  statement: string;
  mechanism: string;
  channel: string;
  objective: MercuryObjective;
}

export interface RankedExperiment {
  id: string;
  title: string;
  expected_lift: number;
  confidence: number;
  effort: number;
  risk: number;
  time_to_signal: number;
  rationale: string;
  approval_required: true;
}

export interface MercuryDecisionArtifact {
  decision_id: string;
  objective: MercuryObjective;
  generated_at: string;
  hypotheses: ExperimentHypothesis[];
  ranked_experiments: RankedExperiment[];
  guardrail_status: "pass" | "blocked";
  guardrail_reason: string;
  required_approval: true;
  source_citations: string[];
}

export interface MercuryInput {
  objective?: MercuryObjective;
  budgetCapUsdMonthly?: number;
  kpis?: PerformanceMetrics;
  growthSignals?: GrowthSignal[];
  citations?: TranscriptCitation[];
  constraints?: string[];
}

const DEFAULT_BUDGET_CAP_USD_MONTHLY = 2000;

const BLOCKED_TERMS = [
  "fake testimonial",
  "fabricated testimonial",
  "deceptive claim",
  "medical cure",
  "guaranteed cure",
  "account farm",
  "bot traffic",
];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const safeNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeRate = (value: unknown, fallback = 0) => {
  const parsed = safeNumber(value, fallback);
  if (parsed > 1) {
    return clamp(parsed / 100);
  }
  return clamp(parsed);
};

function evaluateConstraintGate(constraints: string[] = []) {
  const text = constraints.join(" ").toLowerCase();
  const hit = BLOCKED_TERMS.find((term) => text.includes(term));
  if (hit) {
    return {
      status: "blocked" as const,
      reason: `Blocked by trust/compliance constraint: "${hit}"`,
    };
  }

  return {
    status: "pass" as const,
    reason: "No blocked trust/compliance constraints detected.",
  };
}

function buildSignals(input: MercuryInput): GrowthSignal[] {
  const explicit = Array.isArray(input.growthSignals) ? input.growthSignals : [];
  if (explicit.length > 0) {
    return explicit;
  }

  const ctr = normalizeRate(input.kpis?.ctr);
  const landing = normalizeRate(input.kpis?.landingConversionRate);
  const checkout = normalizeRate(input.kpis?.checkoutConversionRate);

  return [
    {
      id: "signal-low-ctr",
      channel: "short_form",
      theme: "hook clarity",
      painPoint: "Hook does not convert attention to click intent.",
      observedLift: ctr < 0.015 ? 0 : 0.02,
      evidenceStrength: ctr < 0.015 ? 0.8 : 0.45,
      sourceIds: ["superwall-unknown-01"],
    },
    {
      id: "signal-low-landing-conv",
      channel: "landing_page",
      theme: "message-market fit",
      painPoint: "Page messaging does not resolve confused-cleanser objections fast enough.",
      observedLift: landing < 0.03 ? 0 : 0.015,
      evidenceStrength: landing < 0.03 ? 0.85 : 0.5,
      sourceIds: ["superwall-unknown-02"],
    },
    {
      id: "signal-low-checkout-conv",
      channel: "checkout",
      theme: "friction removal",
      painPoint: "Checkout flow and offer framing leak high-intent buyers.",
      observedLift: checkout < 0.04 ? 0 : 0.012,
      evidenceStrength: checkout < 0.04 ? 0.9 : 0.4,
      sourceIds: ["julia-unknown-01"],
    },
  ];
}

function buildHypotheses(objective: MercuryObjective, signals: GrowthSignal[]) {
  return signals.slice(0, 5).map((signal, index) => ({
    id: `hypothesis-${index + 1}`,
    statement: `If we improve ${signal.theme} for ${signal.channel}, paid conversions should increase.`,
    mechanism: signal.painPoint,
    channel: signal.channel,
    objective,
  }));
}

function rankExperiments(
  hypotheses: ExperimentHypothesis[],
  input: MercuryInput,
): RankedExperiment[] {
  const budgetCap = safeNumber(input.budgetCapUsdMonthly, DEFAULT_BUDGET_CAP_USD_MONTHLY);
  const budgetPressure = budgetCap <= 1000 ? 0.2 : 0.05;
  const checkoutRate = normalizeRate(input.kpis?.checkoutConversionRate, 0.03);
  const landingRate = normalizeRate(input.kpis?.landingConversionRate, 0.02);

  return hypotheses
    .map((hypothesis, index) => {
      const baseExpectedLift = 0.01 + index * 0.003;
      const expectedLift = clamp(baseExpectedLift + (0.05 - checkoutRate) * 0.2 + (0.04 - landingRate) * 0.15, 0.002, 0.09);
      const effort = clamp(0.35 + index * 0.1 + budgetPressure);
      const risk = clamp(0.2 + index * 0.1);
      const confidence = clamp(0.78 - index * 0.09);

      return {
        id: `experiment-${index + 1}`,
        title: `${hypothesis.channel} conversion test: ${hypothesis.statement}`,
        expected_lift: Number(expectedLift.toFixed(4)),
        confidence: Number(confidence.toFixed(2)),
        effort: Number(effort.toFixed(2)),
        risk: Number(risk.toFixed(2)),
        time_to_signal: index < 2 ? 7 : 14,
        rationale: `Prioritized for paid conversion impact under ${budgetCap} USD monthly cap.`,
        approval_required: true as const,
      };
    })
    .sort((a, b) => {
      const left = a.expected_lift * a.confidence - (a.effort * 0.25 + a.risk * 0.2);
      const right = b.expected_lift * b.confidence - (b.effort * 0.25 + b.risk * 0.2);
      return right - left;
    });
}

function dedupeSourceIds(signals: GrowthSignal[], citations: TranscriptCitation[] = []) {
  const ids = new Set<string>();
  for (const signal of signals) {
    for (const id of signal.sourceIds) {
      if (id.trim()) {
        ids.add(id.trim());
      }
    }
  }
  for (const citation of citations) {
    if (citation.sourceId.trim()) {
      ids.add(citation.sourceId.trim());
    }
  }
  return [...ids];
}

export function buildMercuryDecisionArtifact(input: MercuryInput = {}): MercuryDecisionArtifact {
  const objective = input.objective ?? "paid_conversions";
  const gate = evaluateConstraintGate(input.constraints);
  const signals = buildSignals(input);
  const hypotheses = buildHypotheses(objective, signals);
  const rankedExperiments = rankExperiments(hypotheses, input);
  const sourceCitations = dedupeSourceIds(signals, input.citations);

  return {
    decision_id: crypto.randomUUID(),
    objective,
    generated_at: new Date().toISOString(),
    hypotheses,
    ranked_experiments: rankedExperiments,
    guardrail_status: gate.status,
    guardrail_reason: gate.reason,
    required_approval: true,
    source_citations: sourceCitations,
  };
}
