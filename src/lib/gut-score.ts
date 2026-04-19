/**
 * Gut Health Score Calculator
 *
 * Produces a 0-10 score where:
 * 0 = severe gut-brain risk profile
 * 10 = low-risk and stable baseline
 *
 * The score is derived from:
 * - Symptom burden (multi-select health flags)
 * - Symptom duration
 * - Behavior blocker pattern
 * - Stated transformation goal intensity
 * - Diet pattern risk/friction
 * - Food restriction complexity (allergies/no-go list)
 */

export interface GutScoreInput {
  healthFlags: string[];
  whyNow: string | null;
  protocolGoal: string | null;
  primaryBlocker: string | null;
  dietPattern: string | null;
  foodPreferences?: string[];
}

interface ScoreDriver {
  label: string;
  points: number;
}

interface ScoreDetails {
  score: number;
  riskPoints: number;
  drivers: ScoreDriver[];
  uncertaintyPenalty: number;
}

const HEALTH_FLAG_WEIGHTS: Record<string, number> = {
  'Irregular Digestion (IBS)': 2.6,
  'Brain Fog & Fatigue': 2.4,
  'Stubborn Bloating': 1.9,
  'Sugar & Carb Cravings': 1.6,
  'Stress-reactive digestion': 1.5,
  'Just feeling off': 0.8,
};

const DURATION_WEIGHTS: Record<string, number> = {
  'A few weeks': 0.9,
  'A few months': 1.9,
  'Years': 3.1,
};

const BLOCKER_WEIGHTS: Record<string, number> = {
  Confusion: 1.9,
  'Lack of time': 1.6,
  'Losing motivation': 2.1,
  'Social events': 1.2,
  Forgetful: 1.4,
};

const GOAL_WEIGHTS: Record<string, number> = {
  'Flat stomach': 0.9,
  'More energy': 1.3,
  'Stop cravings': 1.2,
  'Total reset': 1.9,
};

const DIET_WEIGHTS: Record<string, number> = {
  Omnivore: 1.0,
  'High-protein': 1.2,
  'Low-carb': 0.8,
  Vegetarian: 0.5,
  Vegan: 0.6,
  Pescatarian: 0.4,
  'Gluten-free': 0.3,
  'Dairy-free': 0.3,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const sortDrivers = (drivers: ScoreDriver[]) => {
  return [...drivers].sort((a, b) => b.points - a.points);
};

const getScoreDetails = (input: GutScoreInput): ScoreDetails => {
  const drivers: ScoreDriver[] = [];
  const uniqueFlags = [...new Set((input.healthFlags ?? []).map((item) => item.trim()).filter(Boolean))];
  const safeFoodPreferences = input.foodPreferences ?? [];

  let riskPoints = 0;

  for (const flag of uniqueFlags) {
    const points = HEALTH_FLAG_WEIGHTS[flag] ?? 0;
    if (points > 0) {
      riskPoints += points;
      drivers.push({ label: flag, points });
    }
  }

  const durationPoints = input.whyNow ? (DURATION_WEIGHTS[input.whyNow] ?? 0) : 0;
  if (durationPoints > 0) {
    riskPoints += durationPoints;
    drivers.push({ label: `Pattern length: ${input.whyNow}`, points: durationPoints });
  }

  const blockerPoints = input.primaryBlocker ? (BLOCKER_WEIGHTS[input.primaryBlocker] ?? 0) : 0;
  if (blockerPoints > 0) {
    riskPoints += blockerPoints;
    drivers.push({ label: `Execution blocker: ${input.primaryBlocker}`, points: blockerPoints });
  }

  const goalPoints = input.protocolGoal ? (GOAL_WEIGHTS[input.protocolGoal] ?? 0) : 0;
  if (goalPoints > 0) {
    riskPoints += goalPoints;
    drivers.push({ label: `Goal urgency: ${input.protocolGoal}`, points: goalPoints });
  }

  const dietPoints = input.dietPattern ? (DIET_WEIGHTS[input.dietPattern] ?? 0) : 0;
  if (dietPoints > 0) {
    riskPoints += dietPoints;
    drivers.push({ label: `Diet pattern friction: ${input.dietPattern}`, points: dietPoints });
  }

  const foodFrictionPoints = Math.min(safeFoodPreferences.length, 5) * 0.2;
  if (foodFrictionPoints > 0) {
    riskPoints += foodFrictionPoints;
    drivers.push({ label: 'Food constraint complexity', points: foodFrictionPoints });
  }

  // Interaction effects to create realistic spread and avoid flat scores.
  if (uniqueFlags.length >= 3 && input.whyNow === 'Years') {
    riskPoints += 1.2;
    drivers.push({ label: 'High symptom load over long duration', points: 1.2 });
  }

  if (
    uniqueFlags.includes('Sugar & Carb Cravings')
    && (input.primaryBlocker === 'Losing motivation' || input.primaryBlocker === 'Social events')
  ) {
    riskPoints += 0.8;
    drivers.push({ label: 'Craving-control mismatch', points: 0.8 });
  }

  if (uniqueFlags.includes('Irregular Digestion (IBS)') && input.primaryBlocker === 'Confusion') {
    riskPoints += 0.7;
    drivers.push({ label: 'Protocol-order uncertainty with IBS pattern', points: 0.7 });
  }

  if (uniqueFlags.length === 0 && input.whyNow === 'A few weeks') {
    riskPoints -= 0.9;
  }

  const answeredSignals = [
    uniqueFlags.length > 0,
    Boolean(input.whyNow),
    Boolean(input.primaryBlocker),
    Boolean(input.protocolGoal),
    Boolean(input.dietPattern),
  ].filter(Boolean).length;
  const unansweredSignals = 5 - answeredSignals;
  const uncertaintyPenalty = unansweredSignals * 0.18;

  riskPoints = clamp(riskPoints + uncertaintyPenalty, 0, 10);

  return {
    score: clamp(Math.round(10 - riskPoints), 0, 10),
    riskPoints,
    drivers: sortDrivers(drivers),
    uncertaintyPenalty,
  };
};

export const calculateGutScore = (input: GutScoreInput): number => {
  return getScoreDetails(input).score;
};

export const getGutScoreExplanation = (input: GutScoreInput): string => {
  const details = getScoreDetails(input);
  const topDrivers = details.drivers
    .filter((driver) => driver.points > 0)
    .slice(0, 3)
    .map((driver) => driver.label.toLowerCase());

  const base = topDrivers.length
    ? `This score is weighted by symptom burden, timeline, behavior friction, and nutrition fit. Your strongest score drivers were ${topDrivers.join(', ')}.`
    : 'This score is weighted by symptom burden, timeline, behavior friction, and nutrition fit. Your current answers indicate a relatively low-risk pattern.';

  if (details.uncertaintyPenalty > 0.3) {
    return `${base} Because several inputs were skipped, this is a conservative estimate that will refine as GutBrain learns more.`;
  }

  return `${base} As your daily data accumulates, GutBrain will keep recalibrating your risk profile.`;
};

export const getScoreLabel = (score: number): string => {
  if (score <= 2) return 'Severe Risk';
  if (score <= 4) return 'High Risk';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'Mild';
  return 'Resilient';
};

export const getScoreColor = (score: number): string => {
  if (score <= 2) return '#ef4444';
  if (score <= 4) return '#f97316';
  if (score <= 6) return '#f59e0b';
  if (score <= 8) return '#84cc16';
  return '#22c55e';
};
