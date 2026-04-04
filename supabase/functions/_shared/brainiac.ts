export type GrowthArea =
  | 'measurement'
  | 'acquisition'
  | 'activation'
  | 'retention'
  | 'conversion'
  | 'operations';

export interface BusinessMetrics {
  visitors30d?: number;
  signups30d?: number;
  signupRate?: number;
  activationRate?: number;
  paidConversionRate?: number;
  week1RetentionRate?: number;
  day7CompletionRate?: number;
  day21CompletionRate?: number;
  revenueMrr?: number;
  churnRate?: number;
}

export interface BusinessConstraints {
  teamSize: number;
  devCapacityHoursPerWeek: number;
  cashTight: boolean;
}

export interface BacklogItem {
  title: string;
  area?: GrowthArea;
  effort?: number;
  impact?: number;
  status?: string;
}

export interface ExperimentRecord {
  name: string;
  area?: GrowthArea;
  status?: 'planned' | 'running' | 'won' | 'lost';
  hypothesis?: string;
  result?: string;
}

export interface BusinessStateInput {
  businessName?: string;
  northStarMetric?: string;
  currentFocus?: string;
  timeHorizon?: 'weekly' | 'monthly' | 'quarterly';
  metrics?: BusinessMetrics;
  constraints?: Partial<BusinessConstraints>;
  backlog?: BacklogItem[];
  experiments?: ExperimentRecord[];
  notes?: string[];
}

export interface BusinessState {
  businessName: string;
  northStarMetric: string;
  currentFocus: string;
  timeHorizon: 'weekly' | 'monthly' | 'quarterly';
  metrics: BusinessMetrics;
  constraints: BusinessConstraints;
  backlog: BacklogItem[];
  experiments: ExperimentRecord[];
  notes: string[];
}

export interface GrowthDecision {
  title: string;
  area: GrowthArea;
  rationale: string;
  expectedOutcome: string;
  leadingMetric: string;
  firstStep: string;
  reversible: boolean;
}

export interface GrowthPlan {
  generatedAt: string;
  businessName: string;
  northStarMetric: string;
  primaryConstraint: GrowthArea;
  primaryObjective: string;
  summary: string;
  scores: Record<GrowthArea, number>;
  decisions: GrowthDecision[];
  killList: string[];
  assumptions: string[];
  operatingCadence: string[];
}

const DEFAULT_STATE: BusinessState = {
  businessName: 'The Gut Brain Journal',
  northStarMetric: 'Day 21 completion rate',
  currentFocus: 'guided protocol adherence, trust, and conversion',
  timeHorizon: 'weekly',
  metrics: {},
  constraints: {
    teamSize: 1,
    devCapacityHoursPerWeek: 20,
    cashTight: true,
  },
  backlog: [],
  experiments: [],
  notes: [],
};

const TARGETS = {
  signupRate: 0.04,
  activationRate: 0.6,
  paidConversionRate: 0.08,
  week1RetentionRate: 0.5,
  day7CompletionRate: 0.45,
  day21CompletionRate: 0.2,
  visitors30d: 2000,
  revenueMrr: 10000,
};

const PRIMARY_OBJECTIVES: Record<GrowthArea, string> = {
  measurement: 'Make the business legible enough to allocate attention correctly.',
  acquisition: 'Increase qualified starts without broadening the product.',
  activation: 'Get more users through the first meaningful moment with confidence.',
  retention: 'Increase Day 7 and Day 21 completion through tighter adherence loops.',
  conversion: 'Improve visitor-to-paid economics with clearer value and less friction.',
  operations: 'Protect focus so the team compounds on one high-leverage objective at a time.',
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function safeRate(value: unknown): number | undefined {
  const parsed = safeNumber(value);
  if (parsed === undefined) {
    return undefined;
  }

  if (parsed > 1) {
    return clamp(parsed / 100);
  }

  return clamp(parsed);
}

function deficiency(actual: number | undefined, target: number) {
  if (actual === undefined) {
    return 0.35;
  }

  return clamp((target - actual) / target);
}

function countDefinedMetrics(metrics: BusinessMetrics) {
  const values = [
    metrics.visitors30d,
    metrics.signups30d,
    metrics.signupRate,
    metrics.activationRate,
    metrics.paidConversionRate,
    metrics.week1RetentionRate,
    metrics.day7CompletionRate,
    metrics.day21CompletionRate,
    metrics.revenueMrr,
    metrics.churnRate,
  ];

  return values.filter((value) => value !== undefined).length;
}

function formatRate(value: number | undefined) {
  if (value === undefined) {
    return 'unknown';
  }

  return `${Math.round(value * 100)}%`;
}

function deriveSignupRate(metrics: BusinessMetrics) {
  if (metrics.signupRate !== undefined) {
    return metrics.signupRate;
  }

  if (
    metrics.visitors30d !== undefined &&
    metrics.signups30d !== undefined &&
    metrics.visitors30d > 0
  ) {
    return clamp(metrics.signups30d / metrics.visitors30d);
  }

  return undefined;
}

function normalizeBacklogItem(item: BacklogItem): BacklogItem {
  return {
    title: safeText(item.title, 'Untitled backlog item'),
    area: item.area,
    effort: safeNumber(item.effort),
    impact: safeNumber(item.impact),
    status: safeText(item.status),
  };
}

function normalizeExperiment(experiment: ExperimentRecord): ExperimentRecord {
  return {
    name: safeText(experiment.name, 'Untitled experiment'),
    area: experiment.area,
    status: experiment.status,
    hypothesis: safeText(experiment.hypothesis),
    result: safeText(experiment.result),
  };
}

export function normalizeBusinessState(input: BusinessStateInput = {}): BusinessState {
  const metricsInput = input.metrics ?? {};
  const metrics: BusinessMetrics = {
    visitors30d: safeNumber(metricsInput.visitors30d),
    signups30d: safeNumber(metricsInput.signups30d),
    signupRate: safeRate(metricsInput.signupRate),
    activationRate: safeRate(metricsInput.activationRate),
    paidConversionRate: safeRate(metricsInput.paidConversionRate),
    week1RetentionRate: safeRate(metricsInput.week1RetentionRate),
    day7CompletionRate: safeRate(metricsInput.day7CompletionRate),
    day21CompletionRate: safeRate(metricsInput.day21CompletionRate),
    revenueMrr: safeNumber(metricsInput.revenueMrr),
    churnRate: safeRate(metricsInput.churnRate),
  };

  metrics.signupRate = deriveSignupRate(metrics);

  return {
    businessName: safeText(input.businessName, DEFAULT_STATE.businessName),
    northStarMetric: safeText(input.northStarMetric, DEFAULT_STATE.northStarMetric),
    currentFocus: safeText(input.currentFocus, DEFAULT_STATE.currentFocus),
    timeHorizon: input.timeHorizon ?? DEFAULT_STATE.timeHorizon,
    metrics,
    constraints: {
      teamSize: safeNumber(input.constraints?.teamSize) ?? DEFAULT_STATE.constraints.teamSize,
      devCapacityHoursPerWeek:
        safeNumber(input.constraints?.devCapacityHoursPerWeek) ??
        DEFAULT_STATE.constraints.devCapacityHoursPerWeek,
      cashTight: Boolean(input.constraints?.cashTight ?? DEFAULT_STATE.constraints.cashTight),
    },
    backlog: Array.isArray(input.backlog) ? input.backlog.map(normalizeBacklogItem) : [],
    experiments: Array.isArray(input.experiments)
      ? input.experiments.map(normalizeExperiment)
      : [],
    notes: Array.isArray(input.notes)
      ? input.notes.filter((note): note is string => typeof note === 'string' && note.trim().length > 0)
      : [],
  };
}

export function scoreGrowthAreas(state: BusinessState): Record<GrowthArea, number> {
  const metricsKnown = countDefinedMetrics(state.metrics);
  const lowValueBacklog = state.backlog.filter(
    (item) => (item.effort ?? 0) >= 4 && (item.impact ?? 0) <= 2,
  ).length;
  const lowValueBacklogRatio =
    state.backlog.length > 0 ? lowValueBacklog / state.backlog.length : 0;

  const measurement = clamp((6 - Math.min(metricsKnown, 6)) / 6);
  const acquisition = clamp(
    deficiency(state.metrics.signupRate, TARGETS.signupRate) * 0.7 +
      deficiency(state.metrics.visitors30d, TARGETS.visitors30d) * 0.3,
  );
  const activation = deficiency(state.metrics.activationRate, TARGETS.activationRate);
  const retention = clamp(
    deficiency(state.metrics.week1RetentionRate, TARGETS.week1RetentionRate) * 0.25 +
      deficiency(state.metrics.day7CompletionRate, TARGETS.day7CompletionRate) * 0.45 +
      deficiency(state.metrics.day21CompletionRate, TARGETS.day21CompletionRate) * 0.3,
  );
  const conversion = clamp(
    deficiency(state.metrics.paidConversionRate, TARGETS.paidConversionRate) * 0.7 +
      deficiency(state.metrics.revenueMrr, TARGETS.revenueMrr) * 0.3,
  );
  const operations = clamp(
    (state.constraints.teamSize <= 1 ? 0.3 : 0.1) +
      (state.constraints.devCapacityHoursPerWeek < 20 ? 0.25 : 0.1) +
      (state.constraints.cashTight ? 0.2 : 0.05) +
      lowValueBacklogRatio * 0.25,
  );

  return {
    measurement,
    acquisition,
    activation,
    retention,
    conversion,
    operations,
  };
}

function rankGrowthAreas(scores: Record<GrowthArea, number>) {
  return (Object.entries(scores) as Array<[GrowthArea, number]>).sort((a, b) => b[1] - a[1]);
}

function buildSummary(state: BusinessState, primaryConstraint: GrowthArea) {
  const summaries: Record<GrowthArea, string> = {
    measurement:
      'BRAINIAC cannot allocate capital or effort cleanly until the funnel and retention metrics are visible every week.',
    acquisition:
      'The business needs more qualified demand entering the funnel before downstream optimizations can compound.',
    activation:
      `Too few users are reaching the first meaningful outcome. Current activation is ${formatRate(
        state.metrics.activationRate,
      )}, so the first experience needs to get simpler and more obvious.`,
    retention:
      `Completion is the moat for this product. Day 7 is ${formatRate(
        state.metrics.day7CompletionRate,
      )} and Day 21 is ${formatRate(
        state.metrics.day21CompletionRate,
      )}, which means adherence loops are still weak.`,
    conversion:
      `The offer is not converting enough value into revenue. Paid conversion is ${formatRate(
        state.metrics.paidConversionRate,
      )}, so pricing, proof, or checkout clarity is still leaking demand.`,
    operations:
      'The team needs a tighter operating system so limited time compounds on one lever instead of getting spread across the roadmap.',
  };

  return summaries[primaryConstraint];
}

function buildMeasurementDecisions(state: BusinessState): GrowthDecision[] {
  return [
    {
      title: 'Instrument the full growth funnel from visitor to Day 21 completion',
      area: 'measurement',
      rationale:
        'If the system cannot see where users stall, every roadmap decision becomes opinion. The first job is to make acquisition, activation, retention, and conversion visible in one scoreboard.',
      expectedOutcome:
        'Weekly planning shifts from guesses to measured bottlenecks, and future growth bets become easier to rank.',
      leadingMetric: 'Tracked funnel coverage for visitor, signup, paid start, Prep Day, Day 1, Day 7, and Day 21',
      firstStep:
        'Define the exact event names and a single source of truth for funnel reporting before shipping another customer-facing feature.',
      reversible: true,
    },
    {
      title: 'Run a weekly BRAINIAC scoreboard review',
      area: 'measurement',
      rationale:
        'Measurement only matters if it changes behavior. A fixed weekly review creates a decision loop instead of a dashboard graveyard.',
      expectedOutcome:
        'One primary constraint is named every week, and all new work is judged against it.',
      leadingMetric: state.northStarMetric,
      firstStep:
        'Create a recurring review that compares this week versus last week for traffic, activation, Day 7 completion, Day 21 completion, and paid conversion.',
      reversible: true,
    },
    {
      title: 'Freeze speculative roadmap work until the baseline is visible',
      area: 'measurement',
      rationale:
        'When data is missing, the easiest failure mode is building more surface area instead of learning. Temporary focus discipline is cheaper than random feature growth.',
      expectedOutcome:
        'More team capacity is redirected into measurement, diagnosis, and a smaller set of growth tests.',
      leadingMetric: 'Percentage of shipped work tied to a named growth metric',
      firstStep:
        'Label each in-flight task as acquisition, activation, retention, conversion, or operations. Pause anything that has no measurable growth thesis.',
      reversible: true,
    },
  ];
}

function buildAcquisitionDecisions(state: BusinessState): GrowthDecision[] {
  return [
    {
      title: 'Sharpen the promise around one painful job-to-be-done',
      area: 'acquisition',
      rationale:
        'Broad wellness language makes the product easy to ignore. A narrower promise around clear daily guidance for a 21-day protocol gives the market something concrete to buy into.',
      expectedOutcome:
        'More qualified visitors understand the offer quickly and opt into the funnel.',
      leadingMetric: `Landing-page signup rate (currently ${formatRate(state.metrics.signupRate)})`,
      firstStep:
        'Rewrite the hero, subhead, and first proof block so they answer who this is for, what problem it solves, and what changes by Day 21.',
      reversible: true,
    },
    {
      title: 'Run one focused acquisition experiment at a time',
      area: 'acquisition',
      rationale:
        'Early demand compounds when one distribution loop is tested hard enough to learn. Scattered channels create activity, not signal.',
      expectedOutcome:
        'The business identifies at least one repeatable acquisition loop instead of depending on random traffic.',
      leadingMetric: 'Cost per qualified signup or qualified signups per channel',
      firstStep:
        'Pick one channel where the target user already pays attention and define a two-week hypothesis with one success threshold.',
      reversible: true,
    },
    {
      title: 'Turn user wins into proof assets that match objections',
      area: 'acquisition',
      rationale:
        'Trust is a growth lever in a health-adjacent product. Strong proof lowers skepticism before the user ever reaches the checkout.',
      expectedOutcome:
        'The top objections lose force and more qualified users continue into the purchase path.',
      leadingMetric: 'Scroll depth to proof section and signup rate after proof exposure',
      firstStep:
        'Collect three proof snippets tied to real outcomes: clarity, adherence, and feeling less overwhelmed.',
      reversible: true,
    },
  ];
}

function buildActivationDecisions(state: BusinessState): GrowthDecision[] {
  return [
    {
      title: 'Compress Prep Day into a 10-minute first win',
      area: 'activation',
      rationale:
        `Activation is currently ${formatRate(
          state.metrics.activationRate,
        )}. The first experience needs to feel obvious, finite, and achievable or users will bounce before the protocol earns trust.`,
      expectedOutcome:
        'More users complete the first meaningful step and understand what tomorrow looks like.',
      leadingMetric: 'Prep Day completion rate',
      firstStep:
        'Reduce the first session to the minimum set of actions that creates momentum: understand the plan, gather what is needed, and know the next step.',
      reversible: true,
    },
    {
      title: 'Make the next action unmistakable on every entry point',
      area: 'activation',
      rationale:
        'Activation fails when users still have to interpret the product. The system should answer what to do now before it educates.',
      expectedOutcome:
        'User hesitation drops and the path from paid start to Day 1 becomes more direct.',
      leadingMetric: 'Time-to-first-checklist-completion',
      firstStep:
        'Audit every screen and strip or demote anything that competes with the immediate action for today.',
      reversible: true,
    },
    {
      title: 'Install a rescue sequence for users who stall before Day 1',
      area: 'activation',
      rationale:
        'The highest-leverage save happens before habit decay sets in. A short rescue sequence can recover users who are interested but stuck.',
      expectedOutcome:
        'A larger share of paid starts move from Prep Day into Day 1 instead of going silent.',
      leadingMetric: 'Prep Day to Day 1 transition rate',
      firstStep:
        'Define the stall trigger and write a small sequence that re-anchors the user on the next action rather than more education.',
      reversible: true,
    },
  ];
}

function buildRetentionDecisions(state: BusinessState): GrowthDecision[] {
  return [
    {
      title: 'Build a daily adherence loop around clarity, progress, and relief',
      area: 'retention',
      rationale:
        `Retention is the business moat. Day 7 completion is ${formatRate(
          state.metrics.day7CompletionRate,
        )} and Day 21 completion is ${formatRate(
          state.metrics.day21CompletionRate,
        )}, so the system needs tighter reinforcement after the initial purchase.`,
      expectedOutcome:
        'More users stay engaged long enough to feel progress, which improves both outcomes and downstream proof.',
      leadingMetric: 'Day 7 completion rate',
      firstStep:
        'Define one lightweight daily loop: next action, progress signal, and one supportive reflection point tied to the current phase.',
      reversible: true,
    },
    {
      title: 'Detect dropout points and intervene before momentum collapses',
      area: 'retention',
      rationale:
        'Users rarely abandon because of one big event. They drift after a few moments of confusion, friction, or discomfort. That drift should trigger a recovery play automatically.',
      expectedOutcome:
        'The system rescues users around predictable dropout windows instead of waiting until they disappear.',
      leadingMetric: 'Recovery rate for users inactive at Day 1, Day 3, and Day 7',
      firstStep:
        'Name the three highest-risk dropout windows and define the exact message or task that should fire in each one.',
      reversible: true,
    },
    {
      title: 'Translate symptom logging into visible wins and patterns',
      area: 'retention',
      rationale:
        'Users stay when the product helps them interpret what is changing. Pattern visibility turns journaling from a chore into proof of movement.',
      expectedOutcome:
        'The app feels more useful during hard days because it reflects progress, not just tasks.',
      leadingMetric: 'Weekly log completion rate plus Day 7 completion rate',
      firstStep:
        'Show one simple trend or pattern summary that connects symptoms, adherence, and phase progress.',
      reversible: true,
    },
  ];
}

function buildConversionDecisions(state: BusinessState): GrowthDecision[] {
  return [
    {
      title: 'Tighten the offer so value is concrete before purchase',
      area: 'conversion',
      rationale:
        `Paid conversion is ${formatRate(
          state.metrics.paidConversionRate,
        )}. Buyers need a sharper promise, a clearer deliverable, and a lower-perceived risk before they hand over money.`,
      expectedOutcome:
        'A larger share of interested visitors become paid starts without expanding scope.',
      leadingMetric: 'Visitor-to-paid conversion rate',
      firstStep:
        'Rewrite the offer section around the exact transformation: know what to do every day of the 21-day reset without building your own system.',
      reversible: true,
    },
    {
      title: 'Reduce checkout friction and unanswered objections',
      area: 'conversion',
      rationale:
        'Even strong demand leaks when the buying path feels uncertain. Conversion improves when checkout is shorter and objections are resolved earlier.',
      expectedOutcome:
        'More ready buyers finish payment instead of hesitating at the last moment.',
      leadingMetric: 'Checkout completion rate',
      firstStep:
        'Map the final buying flow and remove any step, copy block, or uncertainty that is not essential to payment confidence.',
      reversible: true,
    },
    {
      title: 'Align proof with the product promise, not generic wellness claims',
      area: 'conversion',
      rationale:
        'The buyer needs evidence that this specific format works. Trust rises when proof mirrors the actual product promise: structure, adherence, and reduced overwhelm.',
      expectedOutcome:
        'The buying decision feels safer and more grounded in the real product.',
      leadingMetric: 'Offer-section clickthrough to payment',
      firstStep:
        'Match each major objection with one proof asset and place it before the payment decision.',
      reversible: true,
    },
  ];
}

function buildOperationsDecisions(state: BusinessState): GrowthDecision[] {
  const backlogTitle = state.backlog.find(
    (item) => (item.effort ?? 0) >= 4 && (item.impact ?? 0) <= 2,
  )?.title;

  return [
    {
      title: 'Adopt a single weekly constraint and force all work through it',
      area: 'operations',
      rationale:
        'Small teams do not fail from lack of ideas. They fail from diluted attention. The business needs one governing question each week: what constraint matters most now?',
      expectedOutcome:
        'Time and budget move toward one compounding lever rather than scattered tasks.',
      leadingMetric: 'Percentage of shipped work tied to the weekly constraint',
      firstStep:
        'At the start of each week, name the primary bottleneck and reject tasks that do not move it.',
      reversible: true,
    },
    {
      title: 'Prune low-leverage work before adding new initiatives',
      area: 'operations',
      rationale:
        backlogTitle
          ? `The backlog already contains likely low-leverage work such as "${backlogTitle}". Killing weak work is usually higher leverage than adding another project.`
          : 'The roadmap will always expand to fill available attention. A disciplined kill list protects the team from building sideways.',
      expectedOutcome:
        'More capacity is available for growth bets with a measurable thesis.',
      leadingMetric: 'Hours reclaimed from paused or killed work',
      firstStep:
        'Tag every backlog item by expected metric impact and kill or defer anything with unclear leverage.',
      reversible: true,
    },
    {
      title: 'Separate reversible experiments from irreversible commitments',
      area: 'operations',
      rationale:
        'Business speed comes from making reversible decisions quickly while protecting the few moves that are hard to undo.',
      expectedOutcome:
        'The team moves faster on tests without accidentally making brand, architecture, or pricing mistakes permanent.',
      leadingMetric: 'Median cycle time for reversible growth experiments',
      firstStep:
        'Add a simple decision label to each initiative: reversible or irreversible. Anything irreversible requires a written rationale before execution.',
      reversible: true,
    },
  ];
}

function buildPlaybook(state: BusinessState, area: GrowthArea) {
  switch (area) {
    case 'measurement':
      return buildMeasurementDecisions(state);
    case 'acquisition':
      return buildAcquisitionDecisions(state);
    case 'activation':
      return buildActivationDecisions(state);
    case 'retention':
      return buildRetentionDecisions(state);
    case 'conversion':
      return buildConversionDecisions(state);
    case 'operations':
      return buildOperationsDecisions(state);
  }
}

function uniqueDecisions(decisions: GrowthDecision[]) {
  const seen = new Set<string>();
  return decisions.filter((decision) => {
    if (seen.has(decision.title)) {
      return false;
    }

    seen.add(decision.title);
    return true;
  });
}

function selectDecisions(state: BusinessState, scores: Record<GrowthArea, number>) {
  const rankedAreas = rankGrowthAreas(scores);
  const [primaryArea, secondaryArea] = rankedAreas.map(([area]) => area);

  return uniqueDecisions([
    ...buildPlaybook(state, primaryArea).slice(0, 2),
    ...buildPlaybook(state, secondaryArea).slice(0, 1),
  ]).slice(0, 3);
}

function buildKillList(primaryConstraint: GrowthArea) {
  const common = [
    'Do not broaden the product into a generic AI health platform.',
    'Do not add new major features without a named metric and a stop condition.',
  ];

  const specific: Record<GrowthArea, string> = {
    measurement: 'Do not debate strategy from anecdotes while baseline funnel data is still missing.',
    acquisition: 'Do not test multiple channels at once before one loop shows signal.',
    activation: 'Do not add more education before the first action becomes obvious.',
    retention: 'Do not chase more top-of-funnel traffic while completion is still leaking badly.',
    conversion: 'Do not compensate for weak conversion by inflating claims or adding hype.',
    operations: 'Do not let the roadmap become a list of unrelated tasks.',
  };

  return [...common, specific[primaryConstraint]];
}

function buildAssumptions(state: BusinessState) {
  const assumptions: string[] = [];

  if (countDefinedMetrics(state.metrics) < 4) {
    assumptions.push('Several key metrics are missing, so BRAINIAC is weighting measurement heavily.');
  }

  if (state.constraints.teamSize <= 1) {
    assumptions.push('Team size is constrained, so the plan favors a smaller number of high-leverage bets.');
  }

  if (state.constraints.cashTight) {
    assumptions.push('Cash is treated as constrained, so the plan favors reversible tests over expensive commitments.');
  }

  if (assumptions.length === 0) {
    assumptions.push('Provided metrics are sufficient for a focused weekly planning cycle.');
  }

  return assumptions;
}

function buildOperatingCadence(primaryConstraint: GrowthArea) {
  return [
    `Monday: review the scoreboard and confirm whether ${primaryConstraint} is still the primary constraint.`,
    'Tuesday: choose one reversible growth bet and define the success threshold before execution.',
    'Wednesday-Thursday: ship the smallest version that can produce a real signal.',
    'Friday: judge the result, log what happened, and either double down, revise, or kill the bet.',
  ];
}

export function buildGrowthPlan(state: BusinessState): GrowthPlan {
  const scores = scoreGrowthAreas(state);
  const primaryConstraint = rankGrowthAreas(scores)[0][0];

  return {
    generatedAt: new Date().toISOString(),
    businessName: state.businessName,
    northStarMetric: state.northStarMetric,
    primaryConstraint,
    primaryObjective: PRIMARY_OBJECTIVES[primaryConstraint],
    summary: buildSummary(state, primaryConstraint),
    scores,
    decisions: selectDecisions(state, scores),
    killList: buildKillList(primaryConstraint),
    assumptions: buildAssumptions(state),
    operatingCadence: buildOperatingCadence(primaryConstraint),
  };
}
