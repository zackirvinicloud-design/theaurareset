export type RecipeMealType =
  | 'morning_elixir'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'support_drink'
  | 'snack';

export type RecipeSource = 'protocol' | 'manual' | 'ai';

export interface RecipeItem {
  key: string;
  title: string;
  phase: string;
  mealType: RecipeMealType;
  summary?: string;
  ingredients: string[];
  instructions: string[];
  notes?: string;
  source: RecipeSource;
  isHidden?: boolean;
  createdAt?: string;
}

export const RECIPE_PHASE_ORDER = [
  'Foundation',
  'Fungal Elimination',
  'Parasite Elimination',
  'Heavy Metal Detox',
] as const;

export const RECIPE_MEAL_TYPE_OPTIONS: Array<{ value: RecipeMealType; label: string }> = [
  { value: 'morning_elixir', label: 'Morning elixir' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'support_drink', label: 'Support drink' },
  { value: 'snack', label: 'Snack' },
];

const RECIPE_MEAL_ORDER: Record<RecipeMealType, number> = {
  morning_elixir: 0,
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  support_drink: 4,
  snack: 5,
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const slugify = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

export function getRecipePhaseForDay(day: number) {
  if (day <= 0) return 'Foundation';
  if (day <= 7) return 'Fungal Elimination';
  if (day <= 14) return 'Parasite Elimination';
  return 'Heavy Metal Detox';
}

export function getRecipeMealTypeLabel(mealType: RecipeMealType) {
  const match = RECIPE_MEAL_TYPE_OPTIONS.find((option) => option.value === mealType);
  return match?.label ?? 'Recipe';
}

export function normalizeRecipeMealType(value: string | null | undefined, fallback: RecipeMealType = 'breakfast'): RecipeMealType {
  const normalized = normalizeText(value ?? '');
  if (!normalized) {
    return fallback;
  }

  if (normalized.includes('elixir')) return 'morning_elixir';
  if (normalized.includes('breakfast')) return 'breakfast';
  if (normalized.includes('lunch')) return 'lunch';
  if (normalized.includes('dinner')) return 'dinner';
  if (normalized.includes('snack')) return 'snack';
  if (normalized.includes('drink') || normalized.includes('juice') || normalized.includes('smoothie') || normalized.includes('tea')) {
    return 'support_drink';
  }

  return fallback;
}

export function buildRecipeKey(phase: string, title: string) {
  const phaseSlug = slugify(phase || 'custom');
  const titleSlug = slugify(title || 'recipe');
  return `recipe_${phaseSlug}_${titleSlug}`;
}

export const DEFAULT_PROTOCOL_RECIPES: RecipeItem[] = [
  {
    key: 'recipe_foundation_sole_water',
    title: 'Sole Water',
    phase: 'Foundation',
    mealType: 'morning_elixir',
    summary: 'Mineral-forward morning hydration from the core protocol.',
    ingredients: [
      '8-16 oz filtered water',
      '1/4-1/2 tsp Himalayan or Celtic salt',
      'Juice of 1/2 lemon',
    ],
    instructions: [
      'Add salt and lemon juice to room-temperature or warm water.',
      'Stir until dissolved.',
      'Drink first thing before food or supplements.',
    ],
    notes: 'Protocol default for fatigue, depletion, or low blood pressure mornings.',
    source: 'protocol',
  },
  {
    key: 'recipe_foundation_baking_soda_alkalizer',
    title: 'Baking Soda Alkalizer',
    phase: 'Foundation',
    mealType: 'morning_elixir',
    summary: 'Simple die-off support option from the protocol.',
    ingredients: [
      '8-16 oz filtered water',
      '1/4-1/2 tsp aluminum-free baking soda',
      'Juice of 1/2 lemon',
    ],
    instructions: [
      'Add baking soda and lemon juice to water.',
      'Stir until dissolved.',
      'Sip slowly in the morning.',
    ],
    notes: 'Useful when die-off symptoms feel heavier than usual.',
    source: 'protocol',
  },
  {
    key: 'recipe_foundation_complete_morning_elixir',
    title: 'Complete Morning Elixir',
    phase: 'Foundation',
    mealType: 'morning_elixir',
    summary: 'Maximum-support elixir from the written protocol.',
    ingredients: [
      '12-16 oz warm filtered water',
      '1/4 tsp Himalayan salt',
      '1/4 tsp aluminum-free baking soda',
      'Juice of 1/2 lemon',
      'Optional: 1/8 tsp cayenne',
    ],
    instructions: [
      'Mix salt, baking soda, and lemon juice into warm water.',
      'Add cayenne if desired.',
      'Drink before breakfast.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_foundation_lemon_ginger_kick',
    title: 'Lemon Ginger Kick',
    phase: 'Foundation',
    mealType: 'support_drink',
    summary: 'Fast liver-support juice from the daily rotation.',
    ingredients: [
      '1 lemon, juiced',
      '1-inch fresh ginger',
      '1/8 tsp cayenne',
      '1/2 cup water',
    ],
    instructions: [
      'Blend or juice ingredients until smooth.',
      'Strain if preferred.',
      'Serve immediately.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_foundation_beet_detox_blend',
    title: 'Beet Detox Blend',
    phase: 'Foundation',
    mealType: 'support_drink',
    summary: 'Afternoon beet-based support from the protocol.',
    ingredients: [
      '1 medium beet',
      '1 carrot',
      '1 apple',
      '1/2-inch ginger',
    ],
    instructions: [
      'Juice beet, carrot, apple, and ginger.',
      'Stir and drink fresh.',
      'Use this as the single daily juice when time is tight.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_foundation_green_soother',
    title: 'Green Soother',
    phase: 'Foundation',
    mealType: 'support_drink',
    summary: 'Evening green juice from the protocol rotation.',
    ingredients: [
      '2 apples',
      '2 celery sticks',
      '1/2 lemon',
      '2 kale leaves',
      '1 handful spinach',
    ],
    instructions: [
      'Juice apples, celery, lemon, kale, and spinach.',
      'Mix and taste before adding extra lemon.',
      'Drink in the evening support window.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_fungal_breakfast_scramble',
    title: 'Fungal Breakfast Scramble',
    phase: 'Fungal Elimination',
    mealType: 'breakfast',
    summary: 'Day 1-style compliant breakfast for fungal phase.',
    ingredients: [
      '2-3 eggs',
      '1 cup spinach',
      '2 garlic cloves, minced',
      '1/4 onion, diced',
      'Coconut oil for cooking',
      'Steamed asparagus with lemon on the side',
    ],
    instructions: [
      'Saute onion and garlic in coconut oil.',
      'Add spinach and cook until wilted.',
      'Scramble eggs into the pan and serve with asparagus.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_fungal_lunch_salad',
    title: 'Fungal Lunch Salad',
    phase: 'Fungal Elimination',
    mealType: 'lunch',
    summary: 'Large anti-fungal salad with salmon and seeds.',
    ingredients: [
      'Mixed greens',
      'Cucumber and celery',
      '1 avocado',
      '1/4 cup raw pumpkin seeds',
      '4-6 oz wild-caught salmon',
      '2 tbsp sauerkraut',
      'Olive oil and lemon dressing',
    ],
    instructions: [
      'Build a large greens base with cucumber, celery, and avocado.',
      'Top with salmon, pumpkin seeds, and sauerkraut.',
      'Dress with olive oil and lemon right before eating.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_fungal_dinner_fish_plate',
    title: 'Fungal Dinner Fish Plate',
    phase: 'Fungal Elimination',
    mealType: 'dinner',
    summary: 'Simple dinner built around fish, garlic, and crucifers.',
    ingredients: [
      '4-6 oz white fish',
      '2 garlic cloves, minced',
      'Fresh oregano and thyme',
      'Broccoli and cauliflower',
      'Leafy greens',
      'Coconut oil',
    ],
    instructions: [
      'Season fish with garlic, oregano, and thyme and grill or bake.',
      'Steam broccoli and cauliflower, then finish with coconut oil.',
      'Serve with sauteed leafy greens.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_parasite_pineapple_power',
    title: 'Pineapple Power',
    phase: 'Parasite Elimination',
    mealType: 'support_drink',
    summary: 'Parasite-phase support juice from Day 8.',
    ingredients: [
      '1 cup fresh pineapple',
      '1/2 cup papaya',
      'Juice of 1 lime',
      '1-inch ginger',
      'Pinch cayenne',
    ],
    instructions: [
      'Blend or juice all ingredients.',
      'Serve cold.',
      'Use in the mid-morning support window.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_parasite_green_warrior',
    title: 'Green Warrior',
    phase: 'Parasite Elimination',
    mealType: 'support_drink',
    summary: 'Day 9 support juice with early cilantro ramp-up.',
    ingredients: [
      '1 cup kale',
      '1 green apple',
      '1/2 cucumber',
      'Large handful cilantro',
      '1-inch ginger',
      'Juice of 1/2 lemon',
    ],
    instructions: [
      'Juice or blend ingredients until smooth.',
      'Strain if preferred.',
      'Drink in the juice support window.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_parasite_lunch_salad',
    title: 'Parasite Lunch Salad',
    phase: 'Parasite Elimination',
    mealType: 'lunch',
    summary: 'Garlic-forward salad from parasite phase guidance.',
    ingredients: [
      'Large salad greens base',
      '1/3 cup raw pumpkin seeds',
      '2 raw garlic cloves, minced',
      'Red onion and sprouts',
      '4-6 oz grilled wild salmon',
      '3 tbsp fermented vegetables',
    ],
    instructions: [
      'Build a greens base and layer pumpkin seeds, garlic, onion, and sprouts.',
      'Top with grilled salmon and fermented vegetables.',
      'Serve immediately.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_parasite_dinner_plate',
    title: 'Parasite Dinner Plate',
    phase: 'Parasite Elimination',
    mealType: 'dinner',
    summary: 'Dinner pattern emphasizing garlic, herbs, and vegetables.',
    ingredients: [
      'Grass-fed beef or lamb',
      '4+ garlic cloves',
      'Onions',
      'Fresh oregano and thyme',
      'Roasted pumpkin cubes',
      'Steamed broccoli',
      'Fermented vegetables',
    ],
    instructions: [
      'Cook beef or lamb with garlic, onion, oregano, and thyme.',
      'Roast pumpkin cubes and steam broccoli.',
      'Plate with fermented vegetables.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_metals_heavy_metal_smoothie',
    title: 'Heavy Metal Smoothie',
    phase: 'Heavy Metal Detox',
    mealType: 'breakfast',
    summary: 'Core Week 3 smoothie formula from the protocol.',
    ingredients: [
      '1 cup wild blueberries',
      '1 ripe banana',
      '1-2 cups fresh cilantro',
      '1 tsp spirulina powder',
      '1 tsp chlorella powder',
      '1 cup coconut water or filtered water',
      'Optional: 1 tbsp almond butter',
    ],
    instructions: [
      'Blend all ingredients until smooth.',
      'Adjust thickness with extra water as needed.',
      'Drink for breakfast in Phase 4.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_metals_cilantro_detox',
    title: 'Cilantro Detox',
    phase: 'Heavy Metal Detox',
    mealType: 'support_drink',
    summary: 'Mid-morning detox juice from heavy metal phase.',
    ingredients: [
      '2 cups fresh cilantro',
      '2 green apples',
      '1 cucumber',
      'Juice of 1 lemon',
      '1-inch ginger',
    ],
    instructions: [
      'Juice cilantro, apples, cucumber, lemon, and ginger.',
      'Mix and serve fresh.',
      'Drink in the mid-morning window.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_metals_detox_salad',
    title: 'Heavy Metal Detox Salad',
    phase: 'Heavy Metal Detox',
    mealType: 'lunch',
    summary: 'High-cilantro lunch built for heavy metal phase.',
    ingredients: [
      'Mixed greens',
      '1 cup cilantro',
      '1/2 cup parsley',
      '1 tbsp Atlantic dulse flakes',
      'Cucumber and celery',
      'Wild-caught salmon',
      'Fermented vegetables',
    ],
    instructions: [
      'Build salad with greens, cilantro, parsley, cucumber, and celery.',
      'Top with salmon, dulse flakes, and fermented vegetables.',
      'Dress lightly with lemon and olive oil.',
    ],
    source: 'protocol',
  },
  {
    key: 'recipe_metals_cilantro_dinner',
    title: 'Cilantro-Heavy Dinner',
    phase: 'Heavy Metal Detox',
    mealType: 'dinner',
    summary: 'Dinner pattern with herbs as the base, not garnish.',
    ingredients: [
      '2+ cups combined cilantro and parsley',
      'Grilled wild fish',
      'Roasted vegetables',
      'Coconut oil',
      'Atlantic dulse flakes',
    ],
    instructions: [
      'Use cilantro and parsley as the salad base.',
      'Add grilled fish and roasted vegetables.',
      'Finish with dulse flakes and coconut oil.',
    ],
    source: 'protocol',
  },
];

export function findDefaultRecipe(params: { title: string; phase?: string | null }) {
  const normalizedTitle = normalizeText(params.title);
  const normalizedPhase = params.phase ? normalizeText(params.phase) : null;

  return DEFAULT_PROTOCOL_RECIPES.find((recipe) => (
    normalizeText(recipe.title) === normalizedTitle
    && (!normalizedPhase || normalizeText(recipe.phase) === normalizedPhase)
  )) ?? null;
}

export function resolveRecipes(overrides: RecipeItem[] = []) {
  const hiddenKeys = new Set(
    overrides
      .filter((item) => item.isHidden)
      .map((item) => item.key),
  );

  const byKey = new Map<string, RecipeItem>();

  for (const recipe of DEFAULT_PROTOCOL_RECIPES) {
    if (hiddenKeys.has(recipe.key)) {
      continue;
    }
    byKey.set(recipe.key, recipe);
  }

  for (const override of overrides) {
    if (override.isHidden) {
      byKey.delete(override.key);
      continue;
    }
    byKey.set(override.key, override);
  }

  const getPhaseOrder = (phase: string) => {
    const index = RECIPE_PHASE_ORDER.findIndex((entry) => entry === phase);
    return index === -1 ? RECIPE_PHASE_ORDER.length : index;
  };

  return [...byKey.values()].sort((a, b) => {
    const phaseDelta = getPhaseOrder(a.phase) - getPhaseOrder(b.phase);
    if (phaseDelta !== 0) return phaseDelta;

    const mealDelta = (RECIPE_MEAL_ORDER[a.mealType] ?? 99) - (RECIPE_MEAL_ORDER[b.mealType] ?? 99);
    if (mealDelta !== 0) return mealDelta;

    if (a.source !== b.source) {
      if (a.source === 'manual' || a.source === 'ai') return -1;
      if (b.source === 'manual' || b.source === 'ai') return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

export function buildRecipeChatContext(recipes: RecipeItem[], day: number) {
  if (!recipes.length) {
    return '';
  }

  const phaseNow = getRecipePhaseForDay(day);
  const sorted = [...recipes].sort((a, b) => {
    const aCurrent = a.phase === phaseNow ? 0 : 1;
    const bCurrent = b.phase === phaseNow ? 0 : 1;
    if (aCurrent !== bCurrent) return aCurrent - bCurrent;

    const aCustom = a.source === 'manual' || a.source === 'ai' ? 0 : 1;
    const bCustom = b.source === 'manual' || b.source === 'ai' ? 0 : 1;
    if (aCustom !== bCustom) return aCustom - bCustom;

    return a.title.localeCompare(b.title);
  });

  const topRecipes = sorted.slice(0, 14);
  const lines = topRecipes.map((recipe) => {
    const mealLabel = getRecipeMealTypeLabel(recipe.mealType);
    const ingredients = recipe.ingredients.slice(0, 6).join(', ');
    return `- ${recipe.title} | phase=${recipe.phase} | meal=${mealLabel} | ingredients=${ingredients}`;
  });

  return [
    `IN-APP RECIPE LIBRARY (current phase: ${phaseNow})`,
    ...lines,
    'Use these names when the user asks for saved recipes. Offer one recipe at a time, then branch with a clarifier.',
    'If the user asks to save a recipe, include a RECIPE_ACTION block.',
  ].join('\n');
}

const SEARCH_SYNONYMS: Record<string, string[]> = {
  breakfast: ['morning', 'am'],
  lunch: ['midday', 'noon'],
  dinner: ['evening', 'pm'],
  smoothie: ['drink', 'support'],
  juice: ['drink', 'support'],
  elixir: ['morning', 'drink'],
  detox: ['cleanse', 'support', 'liver'],
  bloat: ['bloating', 'digestion', 'gut'],
  energy: ['focus', 'fatigue'],
  quick: ['fast', 'simple', 'easy'],
  egg: ['eggs'],
  avocado: ['avocados'],
};

function normalizeSearchToken(token: string) {
  const cleaned = token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();

  if (cleaned.length <= 2) {
    return cleaned;
  }

  if (cleaned.endsWith('ies')) return `${cleaned.slice(0, -3)}y`;
  if (cleaned.endsWith('es')) return cleaned.slice(0, -2);
  if (cleaned.endsWith('s')) return cleaned.slice(0, -1);
  return cleaned;
}

function buildSearchTokens(query: string) {
  const baseTokens = query
    .split(/[\s,;|/]+/g)
    .map((token) => normalizeSearchToken(token))
    .filter((token) => token.length >= 2);

  const expanded = new Set<string>();

  for (const token of baseTokens) {
    expanded.add(token);
    const extras = SEARCH_SYNONYMS[token] ?? [];
    for (const extra of extras) {
      const normalized = normalizeSearchToken(extra);
      if (normalized.length >= 2) {
        expanded.add(normalized);
      }
    }
  }

  return [...expanded];
}

function includesToken(value: string, token: string) {
  return normalizeText(value).includes(token);
}

function scoreRecipe(recipe: RecipeItem, query: string, tokens: string[]) {
  const title = normalizeText(recipe.title);
  const summary = normalizeText(recipe.summary ?? '');
  const phase = normalizeText(recipe.phase);
  const meal = normalizeText(getRecipeMealTypeLabel(recipe.mealType));
  const notes = normalizeText(recipe.notes ?? '');
  const ingredients = recipe.ingredients.map((item) => normalizeText(item));
  const instructions = recipe.instructions.map((item) => normalizeText(item));
  const queryPhrase = normalizeText(query);

  let score = 0;
  let matchedTokens = 0;

  if (queryPhrase && (title.includes(queryPhrase) || ingredients.some((item) => item.includes(queryPhrase)))) {
    score += 30;
  }

  for (const token of tokens) {
    let tokenMatched = false;

    if (title.includes(token)) {
      score += 18;
      tokenMatched = true;
    }
    if (ingredients.some((item) => item.includes(token))) {
      score += 14;
      tokenMatched = true;
    }
    if (summary.includes(token) || notes.includes(token)) {
      score += 8;
      tokenMatched = true;
    }
    if (phase.includes(token) || meal.includes(token)) {
      score += 6;
      tokenMatched = true;
    }
    if (instructions.some((item) => item.includes(token))) {
      score += 4;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchedTokens += 1;
    }
  }

  if (matchedTokens === 0) {
    return 0;
  }

  if (matchedTokens >= Math.max(2, Math.ceil(tokens.length * 0.75))) {
    score += 12;
  }

  if (tokens.some((token) => includesToken(recipe.title, token))) {
    score += 4;
  }

  return score;
}

export function searchRecipes(recipes: RecipeItem[], query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return recipes;
  }

  const tokens = buildSearchTokens(trimmedQuery);
  if (!tokens.length) {
    return recipes;
  }

  return recipes
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, trimmedQuery, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.recipe.title.localeCompare(b.recipe.title);
    })
    .map((entry) => entry.recipe);
}
