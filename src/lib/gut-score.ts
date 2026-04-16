/**
 * Gut Health Score Calculator
 *
 * Derives a score from 1–10 based on existing onboarding quiz answers.
 * Lower = worse gut health = higher urgency.
 *
 * Scoring model:
 *   Start at 10.
 *   Each health flag selected: -1.5 (max 4 flags = -6)
 *   High-risk blocker (confusion, forgetful): -0.5
 *   Diet patterns associated with more inflammation: -0.5
 *   Unpredictable routine: -0.5
 *   Floor at 2 (never 1 or 0 — would feel fake).
 *   Ceiling at 8 (if they're taking a gut quiz, they're not a 10).
 */

export interface GutScoreInput {
  healthFlags: string[];
  primaryBlocker: string | null;
  dietPattern: string | null;
  routineType: string | null;
}

export const calculateGutScore = (input: GutScoreInput): number => {
  let score = 10;

  // Symptoms — most impactful factor
  const flagCount = Math.min(input.healthFlags.length, 4);
  score -= flagCount * 1.5;

  // Blocker risk
  const highRiskBlockers = ['Confusion', 'Forgetful'];
  if (input.primaryBlocker && highRiskBlockers.includes(input.primaryBlocker)) {
    score -= 0.5;
  }

  // Diet inflammation signal
  const inflammatoryDiets = ['Omnivore', 'High-protein'];
  if (input.dietPattern && inflammatoryDiets.includes(input.dietPattern)) {
    score -= 0.5;
  }

  // Routine instability
  if (input.routineType === 'Unpredictable routine') {
    score -= 0.5;
  }

  // Clamp to valid range
  return Math.max(2, Math.min(8, Math.round(score)));
};

export const getScoreLabel = (score: number): string => {
  if (score <= 3) return 'Critical';
  if (score <= 5) return 'At Risk';
  if (score <= 7) return 'Moderate';
  return 'Stable';
};

export const getScoreColor = (score: number): string => {
  if (score <= 3) return '#ef4444'; // red-500
  if (score <= 5) return '#f59e0b'; // amber-500
  if (score <= 7) return '#eab308'; // yellow-500
  return '#22c55e'; // green-500
};
