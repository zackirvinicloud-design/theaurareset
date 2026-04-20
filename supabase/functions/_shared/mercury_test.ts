import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildMercuryDecisionArtifact } from "./mercury.ts";

Deno.test("mercury artifact contains required objective and approval gate", () => {
  const artifact = buildMercuryDecisionArtifact({
    objective: "paid_conversions",
    budgetCapUsdMonthly: 2000,
  });

  assertEquals(artifact.objective, "paid_conversions");
  assertEquals(artifact.required_approval, true);
  assert(artifact.ranked_experiments.length > 0);
});

Deno.test("constraint gate blocks banned patterns", () => {
  const artifact = buildMercuryDecisionArtifact({
    constraints: ["Run fake testimonial ad at scale"],
  });

  assertEquals(artifact.guardrail_status, "blocked");
  assert(artifact.guardrail_reason.includes("trust/compliance"));
});

Deno.test("ranked experiments include expected fields", () => {
  const artifact = buildMercuryDecisionArtifact({});
  const first = artifact.ranked_experiments[0];

  assert(first.id.length > 0);
  assertGreater(first.expected_lift, 0);
  assert(first.time_to_signal >= 7);
});
