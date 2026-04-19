import type { Symptom } from '@/hooks/symptomData';

export type SymptomTrend = 'better' | 'same' | 'worse';
export type SymptomDurationBucket = 'under_1h' | '1_3h' | '3_12h' | '12_24h' | 'multi_day';

export interface SymptomCheckinItem {
  id: string;
  checkinId: string;
  symptomKey: string;
  symptomLabel: string;
  category: string;
  severity: number;
  trend: SymptomTrend;
  durationBucket: SymptomDurationBucket;
  bodyAreas: string[];
  isCustom: boolean;
  createdAt: string;
}

export interface SymptomFactor {
  id: string;
  checkinId: string;
  bristolType?: number | null;
  hydrationLevel?: number | null;
  sleepQuality?: number | null;
  supplementsTaken?: boolean | null;
  triggerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomCheckin {
  id: string;
  dayNumber: number;
  loggedAt: string;
  gutState?: number | null;
  moodScore?: number | null;
  energyScore?: number | null;
  stressScore?: number | null;
  note?: string | null;
  items: SymptomCheckinItem[];
  factors?: SymptomFactor | null;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomCheckinItemInput {
  symptomKey: string;
  symptomLabel: string;
  category: string;
  severity?: number;
  trend?: SymptomTrend;
  durationBucket?: SymptomDurationBucket;
  bodyAreas?: string[];
  isCustom?: boolean;
}

export interface SymptomFactorInput {
  bristolType?: number | null;
  hydrationLevel?: number | null;
  sleepQuality?: number | null;
  supplementsTaken?: boolean | null;
  triggerNotes?: string | null;
}

export interface SymptomCheckinInput {
  dayNumber?: number;
  gutState?: number | null;
  moodScore?: number | null;
  energyScore?: number | null;
  stressScore?: number | null;
  note?: string | null;
  items: SymptomCheckinItemInput[];
  factors?: SymptomFactorInput | null;
}

export interface SymptomTrendPoint {
  dayNumber: number;
  loggedAt: string;
  gutState: number | null;
  moodScore: number | null;
  energyScore: number | null;
  stressScore: number | null;
  symptomLoad: number;
}

export interface SymptomInsight {
  id: string;
  kind: 'trend' | 'recurrence' | 'driver';
  title: string;
  description: string;
  confidence: number;
  sampleSize: number;
  rangeDays: number;
}

export interface SymptomDriverInsight {
  id: string;
  label: string;
  description: string;
  confidence: number;
  sampleSize: number;
  impact: number;
}

export interface SymptomInsightsPayload {
  trendPoints: SymptomTrendPoint[];
  topSymptoms: Array<{
    key: string;
    label: string;
    category: string;
    count: number;
    avgSeverity: number;
  }>;
  likelyDrivers: SymptomDriverInsight[];
  cards: SymptomInsight[];
}

export interface SymptomCoachFollowup {
  interpretation: string;
  nextAction: string;
  coachPrompt: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const average = (values: number[]) => {
  if (!values.length) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value;
};

const normalized = (value: string) => value.trim().toLowerCase();

const scoreSymptomMatch = (symptom: Symptom, query: string) => {
  if (!query) return 0;
  const label = symptom.label.toLowerCase();
  const key = symptom.key.toLowerCase();
  const category = symptom.category.toLowerCase();
  const aliases = (symptom.aliases ?? []).map((alias) => alias.toLowerCase());

  if (label === query || key === query) return 220;
  if (label.startsWith(query) || key.startsWith(query)) return 170;
  if (label.split(/\s+/).some((word) => word.startsWith(query))) return 135;
  if (label.includes(query) || key.includes(query)) return 110;
  if (aliases.some((alias) => alias === query)) return 100;
  if (aliases.some((alias) => alias.startsWith(query))) return 90;
  if (aliases.some((alias) => alias.includes(query))) return 70;
  if (category.includes(query)) return 55;
  return 0;
};

export function rankSymptomSearch(catalog: Symptom[], query: string, recentKeys: string[] = []) {
  const needle = normalized(query);
  const recentSet = new Set(recentKeys.map((key) => key.toLowerCase()));

  return [...catalog]
    .map((symptom) => {
      const relevance = needle ? scoreSymptomMatch(symptom, needle) : 1;
      const recentBoost = recentSet.has(symptom.key.toLowerCase()) ? 24 : 0;
      return {
        symptom,
        score: relevance + recentBoost,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.symptom.label.localeCompare(b.symptom.label);
    })
    .map((entry) => entry.symptom);
}

export function getSymptomLoad(checkin: SymptomCheckin) {
  if (!checkin.items.length) {
    return 0;
  }
  return average(checkin.items.map((item) => item.severity));
}

const selectLatestByDay = (checkins: SymptomCheckin[]) => {
  const latestByDay = new Map<number, SymptomCheckin>();

  for (const checkin of checkins) {
    const current = latestByDay.get(checkin.dayNumber);
    if (!current) {
      latestByDay.set(checkin.dayNumber, checkin);
      continue;
    }

    if (new Date(checkin.loggedAt).getTime() > new Date(current.loggedAt).getTime()) {
      latestByDay.set(checkin.dayNumber, checkin);
    }
  }

  return [...latestByDay.values()].sort((a, b) => a.dayNumber - b.dayNumber);
};

const buildTrendPoints = (checkins: SymptomCheckin[]): SymptomTrendPoint[] => {
  return selectLatestByDay(checkins).map((checkin) => ({
    dayNumber: checkin.dayNumber,
    loggedAt: checkin.loggedAt,
    gutState: toNumber(checkin.gutState),
    moodScore: toNumber(checkin.moodScore),
    energyScore: toNumber(checkin.energyScore),
    stressScore: toNumber(checkin.stressScore),
    symptomLoad: Number(getSymptomLoad(checkin).toFixed(2)),
  }));
};

const buildTopSymptoms = (checkins: SymptomCheckin[]) => {
  const buckets = new Map<string, {
    key: string;
    label: string;
    category: string;
    count: number;
    severityTotal: number;
  }>();

  for (const checkin of checkins) {
    for (const item of checkin.items) {
      const existing = buckets.get(item.symptomKey);
      if (existing) {
        existing.count += 1;
        existing.severityTotal += item.severity;
        continue;
      }

      buckets.set(item.symptomKey, {
        key: item.symptomKey,
        label: item.symptomLabel,
        category: item.category,
        count: 1,
        severityTotal: item.severity,
      });
    }
  }

  return [...buckets.values()]
    .map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      category: bucket.category,
      count: bucket.count,
      avgSeverity: Number((bucket.severityTotal / Math.max(bucket.count, 1)).toFixed(2)),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.avgSeverity - a.avgSeverity;
    })
    .slice(0, 6);
};

type DriverScenario = {
  id: string;
  label: string;
  active: (checkin: SymptomCheckin) => boolean;
  baseline: (checkin: SymptomCheckin) => boolean;
  description: (impact: number, sampleSize: number) => string;
};

const DRIVER_SCENARIOS: DriverScenario[] = [
  {
    id: 'hydration',
    label: 'Low hydration days',
    active: (checkin) => (checkin.factors?.hydrationLevel ?? null) !== null && (checkin.factors?.hydrationLevel ?? 0) <= 4,
    baseline: (checkin) => (checkin.factors?.hydrationLevel ?? null) !== null && (checkin.factors?.hydrationLevel ?? 0) >= 7,
    description: (impact, sampleSize) => `When hydration is low, symptom load is ${impact.toFixed(1)} points higher across ${sampleSize} comparable logs.`,
  },
  {
    id: 'sleep',
    label: 'Poor sleep nights',
    active: (checkin) => (checkin.factors?.sleepQuality ?? null) !== null && (checkin.factors?.sleepQuality ?? 0) <= 4,
    baseline: (checkin) => (checkin.factors?.sleepQuality ?? null) !== null && (checkin.factors?.sleepQuality ?? 0) >= 7,
    description: (impact, sampleSize) => `After lower sleep quality nights, symptom load trends ${impact.toFixed(1)} points higher over ${sampleSize} logs.`,
  },
  {
    id: 'stress',
    label: 'High stress windows',
    active: (checkin) => (checkin.stressScore ?? null) !== null && (checkin.stressScore ?? 0) >= 7,
    baseline: (checkin) => (checkin.stressScore ?? null) !== null && (checkin.stressScore ?? 0) <= 3,
    description: (impact, sampleSize) => `High stress entries show symptom load ${impact.toFixed(1)} points above calm periods (${sampleSize} logs).`,
  },
  {
    id: 'supplements',
    label: 'Skipped supplement windows',
    active: (checkin) => checkin.factors?.supplementsTaken === false,
    baseline: (checkin) => checkin.factors?.supplementsTaken === true,
    description: (impact, sampleSize) => `Logs without supplements show ${impact.toFixed(1)} points higher symptom load across ${sampleSize} comparisons.`,
  },
  {
    id: 'stool',
    label: 'Bristol out-of-range days',
    active: (checkin) => {
      const stoolType = checkin.factors?.bristolType;
      if (typeof stoolType !== 'number') return false;
      return stoolType <= 2 || stoolType >= 6;
    },
    baseline: (checkin) => {
      const stoolType = checkin.factors?.bristolType;
      if (typeof stoolType !== 'number') return false;
      return stoolType >= 3 && stoolType <= 5;
    },
    description: (impact, sampleSize) => `When Bristol stool type is out of range, symptom load is ${impact.toFixed(1)} points higher in ${sampleSize} logs.`,
  },
];

const computeConfidence = (impact: number, sampleSize: number) => {
  const normalizedImpact = clamp(impact / 2.2, 0, 1);
  const normalizedSample = clamp(sampleSize / 12, 0, 1);
  return Number(clamp(0.3 + normalizedImpact * 0.4 + normalizedSample * 0.3, 0, 0.96).toFixed(2));
};

const buildLikelyDrivers = (checkins: SymptomCheckin[]) => {
  const drivers: SymptomDriverInsight[] = [];

  for (const scenario of DRIVER_SCENARIOS) {
    const activeGroup = checkins.filter((checkin) => scenario.active(checkin));
    const baselineGroup = checkins.filter((checkin) => scenario.baseline(checkin));

    const sampleSize = Math.min(activeGroup.length, baselineGroup.length);
    if (sampleSize < 3) {
      continue;
    }

    const activeLoad = average(activeGroup.slice(0, sampleSize).map(getSymptomLoad));
    const baselineLoad = average(baselineGroup.slice(0, sampleSize).map(getSymptomLoad));
    const impact = Number((activeLoad - baselineLoad).toFixed(2));
    const absoluteImpact = Math.abs(impact);

    if (absoluteImpact < 0.75) {
      continue;
    }

    const confidence = computeConfidence(absoluteImpact, sampleSize);
    if (confidence < 0.55) {
      continue;
    }

    drivers.push({
      id: scenario.id,
      label: scenario.label,
      description: scenario.description(absoluteImpact, sampleSize),
      confidence,
      sampleSize,
      impact,
    });
  }

  return drivers
    .sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return Math.abs(b.impact) - Math.abs(a.impact);
    })
    .slice(0, 3);
};

const buildTrendCard = (trendPoints: SymptomTrendPoint[], rangeDays: number): SymptomInsight[] => {
  const pointsWithGut = trendPoints.filter((point) => point.gutState !== null);
  if (pointsWithGut.length < 2) {
    return [];
  }

  const first = pointsWithGut[0].gutState ?? 0;
  const last = pointsWithGut[pointsWithGut.length - 1].gutState ?? 0;
  const delta = Number((last - first).toFixed(1));
  const sampleSize = pointsWithGut.length;

  if (Math.abs(delta) < 0.4) {
    return [];
  }

  const confidence = computeConfidence(Math.abs(delta), sampleSize);
  const direction = delta > 0 ? 'up' : 'down';

  return [{
    id: 'trend-gut-state',
    kind: 'trend',
    title: 'Gut state trajectory',
    description: `Your gut state is trending ${direction} by ${Math.abs(delta).toFixed(1)} points over the recent ${sampleSize} logged days.`,
    confidence,
    sampleSize,
    rangeDays,
  }];
};

const buildRecurrenceCards = (
  topSymptoms: SymptomInsightsPayload['topSymptoms'],
  rangeDays: number,
): SymptomInsight[] => {
  return topSymptoms.slice(0, 2).map((symptom, index) => ({
    id: `recurrence-${symptom.key}-${index}`,
    kind: 'recurrence',
    title: `${symptom.label} is recurring`,
    description: `${symptom.label} appeared ${symptom.count} times with average severity ${symptom.avgSeverity.toFixed(1)} during the selected window.`,
    confidence: computeConfidence(symptom.avgSeverity, symptom.count),
    sampleSize: symptom.count,
    rangeDays,
  }));
};

const buildDriverCards = (drivers: SymptomDriverInsight[], rangeDays: number): SymptomInsight[] => {
  return drivers.map((driver) => ({
    id: `driver-${driver.id}`,
    kind: 'driver',
    title: driver.label,
    description: driver.description,
    confidence: driver.confidence,
    sampleSize: driver.sampleSize,
    rangeDays,
  }));
};

export function buildSymptomInsights(checkins: SymptomCheckin[], rangeDays = 21): SymptomInsightsPayload {
  const sorted = [...checkins]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  const trendPoints = buildTrendPoints(sorted);
  const topSymptoms = buildTopSymptoms(sorted);
  const likelyDrivers = buildLikelyDrivers(sorted);

  const cards = [
    ...buildTrendCard(trendPoints, rangeDays),
    ...buildRecurrenceCards(topSymptoms, rangeDays),
    ...buildDriverCards(likelyDrivers, rangeDays),
  ];

  return {
    trendPoints,
    topSymptoms,
    likelyDrivers,
    cards,
  };
}

export function getLegacySymptomKeysFromCheckin(checkin: SymptomCheckin): string[] {
  const keys = checkin.items
    .filter((item) => item.severity > 0)
    .map((item) => item.symptomKey.trim())
    .filter(Boolean);

  return [...new Set(keys.map((key) => key.toLowerCase()))];
}

export function buildSymptomCoachFollowup(checkin: SymptomCheckin, currentDay: number): SymptomCoachFollowup {
  const sortedItems = [...checkin.items].sort((a, b) => b.severity - a.severity);
  const top = sortedItems[0];
  const avgSeverity = Number(getSymptomLoad(checkin).toFixed(1));

  const interpretation = top
    ? `Most intense signal right now is ${top.symptomLabel} (severity ${top.severity}/4). Average symptom load is ${avgSeverity}/4.`
    : `Your check-in is logged. Current average symptom load is ${avgSeverity}/4.`;

  let nextAction = 'Keep hydration steady, keep meals simple, and reassess in 8-12 hours before changing multiple variables at once.';

  if ((checkin.stressScore ?? 0) >= 7) {
    nextAction = 'Stress is elevated. Run a 10-minute downshift first, then keep meals and supplement timing boring for the next 24 hours.';
  } else if ((checkin.factors?.hydrationLevel ?? 10) <= 4) {
    nextAction = 'Hydration is low. Prioritize fluids and electrolytes over the next 3-4 hours, then retest symptom intensity tonight.';
  } else if ((checkin.gutState ?? 10) <= 3) {
    nextAction = 'Gut state is low. Reduce decision load today: stick to gentle compliant meals and avoid adding new interventions.';
  }

  const symptomList = sortedItems.slice(0, 3).map((item) => item.symptomLabel).join(', ');
  const coachPrompt = symptomList
    ? `Day ${currentDay} symptom pattern: ${symptomList}. My symptom load average is ${avgSeverity}/4. Give me what is expected, what is caution, and one 24-hour action plan.`
    : `Day ${currentDay} symptom check-in saved. Use my latest tracker data to explain expected vs caution and one simple 24-hour action plan.`;

  return {
    interpretation,
    nextAction,
    coachPrompt,
  };
}

export function mapLegacyDailySymptomsToCheckin(
  dayNumber: number,
  symptomKeys: string[],
  loggedAt?: string,
): SymptomCheckinInput {
  return {
    dayNumber,
    gutState: null,
    moodScore: null,
    energyScore: null,
    stressScore: null,
    note: 'Imported from legacy symptom tracker.',
    items: symptomKeys
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key) => ({
        symptomKey: key,
        symptomLabel: key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        category: inferCategoryFromKey(key),
        severity: 2,
        trend: 'same' as const,
        durationBucket: '12_24h' as const,
        bodyAreas: [],
        isCustom: false,
      })),
    factors: null,
  };
}

export function inferCategoryFromKey(symptomKey: string) {
  const key = symptomKey.toLowerCase();

  if (['bloating', 'nausea', 'cramping', 'diarrhea', 'constipation', 'cravings', 'heartburn'].some((item) => key.includes(item))) {
    return 'digestive';
  }

  if (['fatigue', 'sleep', 'wired', 'insomnia', 'energy', 'dizzy'].some((item) => key.includes(item))) {
    return 'energy';
  }

  if (['anxious', 'anxiety', 'irritable', 'mood', 'emotional', 'low_mood'].some((item) => key.includes(item))) {
    return 'mood';
  }

  if (['skin', 'rash', 'breakout', 'itchy'].some((item) => key.includes(item))) {
    return 'skin';
  }

  return 'detox';
}
