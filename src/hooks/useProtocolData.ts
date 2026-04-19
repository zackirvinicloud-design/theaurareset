/**
 * Protocol data for each phase/day of the 21-day program.
 * Extracted from protocol-original.html into structured data.
 */

export interface ChecklistItem {
    key: string;
    label: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    emoji: string;
    showFromDay?: number; // Only show this item on or after this day
}

export interface ChecklistSupport {
    why: string;
    timingHint?: string;
}

export interface PhaseInfo {
    name: string;
    shortName: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    supplements: string[];
    tips: string[];
}

export interface ShoppingItem {
    name: string;
    quantity: string;
    notes?: string;
    optional?: string; // e.g. 'alternative' or 'optional' — shown as a badge
}

export interface ShoppingCategory {
    category: string;
    emoji: string;
    guidance?: string;
    items: ShoppingItem[];
}

export interface ShoppingPhase {
    phase: string;
    emoji: string;
    buyBefore: string;
    categories: ShoppingCategory[];
}

export interface ShoppingCategoryMatch {
  phase: string;
  category: ShoppingCategory;
}

export interface DefaultShoppingItemMatch {
    key: string;
    phase: string;
    phaseEmoji: string;
    category: string;
    categoryEmoji: string;
    guidance?: string;
    item: ShoppingItem;
    index: number;
}

export const SHOPPING_LIST: ShoppingPhase[] = [
    {
        phase: 'Foundation',
        emoji: '🛡️',
        buyBefore: 'Before starting',
        categories: [
            {
                category: 'Fresh Produce (buy weekly)',
                emoji: '🥬',
                items: [
                    { name: 'Lemons (organic)', quantity: '15/week', notes: '45+ total for 21 days' },
                    { name: 'Beets (medium)', quantity: '6/week', notes: 'For liver detox juices' },
                    { name: 'Carrots (organic)', quantity: '10/week', notes: 'For juicing' },
                    { name: 'Green Apples', quantity: '10/week', notes: 'Granny Smith preferred' },
                    { name: 'Celery', quantity: '2 bunches/week', notes: '6 bunches total' },
                    { name: 'Kale', quantity: '2 bunches/week', notes: 'For green juices' },
                    { name: 'Fresh Ginger Root', quantity: '6+ inch piece', notes: 'Buy fresh weekly' },
                    { name: 'Fresh Turmeric Root', quantity: '3 inches', notes: 'Or turmeric powder' },
                ],
            },
            {
                category: 'Morning Ritual Essentials',
                emoji: '🌅',
                guidance: 'Salt is the core buy here. Baking soda supports the alkalizer or complete elixir. ACV and raw honey are only needed if you want the tonic variations from the written protocol.',
                items: [
                    { name: 'Himalayan Pink Salt', quantity: '1 bag or jar', notes: 'Choose this or Celtic sea salt for sole water.' },
                    { name: 'Celtic Sea Salt', quantity: '1 bag or jar', notes: 'Alternative to Himalayan salt for sole water.', optional: 'alternative' },
                    { name: 'Aluminum-Free Baking Soda', quantity: '1 box', notes: 'For the baking soda alkalizer or complete morning elixir.' },
                    { name: 'Raw Apple Cider Vinegar', quantity: '1 bottle', notes: 'For liver tonic support or bath add-ins from the written protocol.', optional: 'optional' },
                    { name: 'Raw Honey', quantity: '1 jar', notes: 'Optional sweetener for the liver love tonic.', optional: 'optional' },
                ],
            },
            {
                category: 'Liver Support Supplements',
                emoji: '💊',
                items: [
                    { name: 'Milk Thistle Extract 300mg', quantity: '21-day supply', notes: '600mg/day (2x daily)' },
                    { name: 'NAC (N-Acetyl Cysteine) 600mg', quantity: '21-day supply', notes: '1x daily with lunch' },
                    { name: 'Alpha-Lipoic Acid 300mg', quantity: '21-day supply', notes: '1x daily with lunch' },
                    { name: 'Dandelion Root 500mg', quantity: '21-day supply', notes: '1x daily with breakfast' },
                    { name: 'Artichoke Extract 500mg', quantity: '21-day supply', notes: '1x daily with dinner' },
                    { name: 'Selenium 200mcg', quantity: '21-day supply', notes: '1x daily with lunch' },
                    { name: 'B-Complex (Methylated)', quantity: '21-day supply', notes: '1x daily with lunch' },
                ],
            },
            {
                category: 'Essential Binders (pick 1-2)',
                emoji: '🧲',
                guidance: 'Choose 1-2 total in this section. Activated charcoal and bentonite clay are alternatives. Psyllium is optional.',
                items: [
                    { name: 'Activated Charcoal 500mg caps', quantity: '2-3 bottles', notes: '2-4 caps daily, 2hrs from food' },
                    { name: 'Bentonite Clay (food grade)', quantity: '1 container', notes: 'Use this instead of activated charcoal if you prefer clay.', optional: 'alternative' },
                    { name: 'Psyllium Husk Powder', quantity: '1 large bag', notes: 'Optional add-on. Helpful for extra bowel support, but not required.', optional: 'optional' },
                ],
            },
            {
                category: 'Detox Support Supplies',
                emoji: '🛁',
                guidance: 'Tongue scraper and Epsom salt are the most practical buys here. The rest are optional support tools from the full written protocol.',
                items: [
                    { name: 'Tongue Scraper', quantity: '1', notes: 'Copper or stainless steel.' },
                    { name: 'Epsom Salt', quantity: '2-4 lbs', notes: 'For baths during tougher detox days.' },
                    { name: 'Dry Brush', quantity: '1', notes: 'Optional lymphatic support tool.', optional: 'optional' },
                    { name: 'Castor Oil + Cloth', quantity: '1 set', notes: 'Optional for liver pack support.', optional: 'optional' },
                    { name: 'Enema Kit', quantity: '1', notes: 'Optional. Only if this is already part of your practice.', optional: 'optional' },
                ],
            },
        ],
    },
    {
        phase: 'Fungal Elimination',
        emoji: '🍄',
        buyBefore: 'Before starting',
        categories: [
            {
                category: 'Additional Produce',
                emoji: '🥬',
                items: [
                    { name: 'Garlic', quantity: '4 bulbs', notes: 'You\'ll use a LOT' },
                    { name: 'Onions', quantity: '5 large' },
                    { name: 'Leafy Greens', quantity: 'Large quantities', notes: 'Spinach, arugula' },
                    { name: 'Broccoli', quantity: '2 crowns' },
                    { name: 'Cauliflower', quantity: '1 head' },
                    { name: 'Brussels Sprouts', quantity: '1 lb' },
                    { name: 'Fresh Herbs', quantity: '2 bunches each', notes: 'Cilantro, parsley, oregano, thyme, basil' },
                    { name: 'Avocados', quantity: '5' },
                    { name: 'Asparagus', quantity: '2 bunches' },
                ],
            },
            {
                category: 'Proteins & Healthy Fats',
                emoji: '🥩',
                items: [
                    { name: 'Organic Eggs', quantity: '1-2 dozen' },
                    { name: 'Wild-Caught Fish', quantity: 'Variety for week', notes: 'Salmon, sardines, mackerel, cod' },
                    { name: 'Coconut Oil (virgin)', quantity: '1 large jar', notes: 'Cold-pressed' },
                    { name: 'Extra Virgin Olive Oil', quantity: '1 large bottle' },
                    { name: 'Raw Pumpkin Seeds', quantity: '3 cups', notes: 'Plus sunflower seeds, almonds' },
                    { name: 'Coconut Yogurt', quantity: '2 containers', notes: 'Unsweetened' },
                ],
            },
            {
                category: 'Fungal Support Supplements',
                emoji: '💊',
                guidance: 'Oregano oil and caprylic acid are the core buys here. Pau d\'Arco is optional if you want to keep this phase simpler.',
                items: [
                    { name: 'Oregano Oil Capsules', quantity: '7-day supply', notes: '2-3 caps, 2x daily' },
                    { name: 'Caprylic Acid', quantity: '7-day supply', notes: '1000-1500mg daily' },
                    { name: 'Pau d\'Arco', quantity: '7-day supply', notes: 'Optional. Tea or 500mg capsules.', optional: 'optional' },
                    { name: 'Probiotics 50+ billion CFU', quantity: '21-day supply', notes: 'Continue through all phases' },
                    { name: 'Digestive Enzymes', quantity: '21-day supply', notes: 'With each meal' },
                ],
            },
        ],
    },
    {
        phase: 'Parasite Elimination',
        emoji: '🎯',
        buyBefore: 'Before Day 8',
        categories: [
            {
                category: 'Parasite-Fighting Foods',
                emoji: '🥬',
                items: [
                    { name: 'Papaya', quantity: '3 whole', notes: 'For the seeds!' },
                    { name: 'Pineapple', quantity: '2 whole', notes: 'Bromelain enzyme' },
                    { name: 'Pomegranate', quantity: '4 whole' },
                    { name: 'Additional Pumpkin Seeds', quantity: '2 more cups', notes: 'Raw' },
                    { name: 'More Garlic', quantity: '3 additional bulbs' },
                ],
            },
            {
                category: 'Parasite Formula Supplements',
                emoji: '💊',
                items: [
                    { name: 'Black Walnut Hull Extract', quantity: '7-day supply', notes: '1000mg, 2x daily' },
                    { name: 'Wormwood', quantity: '7-day supply', notes: '300mg, 2x daily' },
                    { name: 'Clove Capsules', quantity: '7-day supply', notes: '1000mg, 2x daily' },
                    { name: 'Berberine Complex', quantity: '7-day supply', notes: '500mg daily' },
                    { name: 'Grapefruit Seed Extract', quantity: '7-day supply', notes: '150mg daily' },
                    { name: 'Diatomaceous Earth', quantity: '1 bag', notes: 'Food grade, 1 tsp daily' },
                ],
            },
        ],
    },
    {
        phase: 'Heavy Metal Detox',
        emoji: '⚡',
        buyBefore: 'Before Day 15',
        categories: [
            {
                category: 'Metal-Chelating Foods',
                emoji: '🥬',
                items: [
                    { name: 'Cilantro', quantity: '4 large bunches', notes: 'Massive amounts needed' },
                    { name: 'Wild Blueberries', quantity: '4 cups', notes: 'Frozen OK, must be WILD' },
                    { name: 'Atlantic Dulse Seaweed', quantity: '1 bag', notes: 'Dried flakes or fresh' },
                    { name: 'Bananas', quantity: '7', notes: 'For daily heavy metal smoothie' },
                    { name: 'Additional Parsley', quantity: '2 bunches' },
                ],
            },
            {
                category: 'Chelation Supplements',
                emoji: '💊',
                guidance: 'Spirulina is optional if you want to keep this phase leaner. The rest are your main heavy metal support items.',
                items: [
                    { name: 'Chlorella (cracked cell wall)', quantity: '7-day supply', notes: '9000mg/day (3000mg 3x)' },
                    { name: 'Spirulina', quantity: '7-day supply', notes: 'Optional if you want to keep this phase simpler.', optional: 'optional' },
                    { name: 'Modified Citrus Pectin', quantity: '7-day supply', notes: '4500mg/day (1500mg 3x)' },
                    { name: 'Zeolite (micronized)', quantity: '7-day supply', notes: '1600mg daily' },
                    { name: 'Vitamin C (liposomal)', quantity: '7-day supply', notes: '3000mg daily' },
                    { name: 'Glutathione (liposomal)', quantity: '7-day supply', notes: '500mg daily' },
                ],
            },
        ],
    },
];

const normalizeShoppingValue = (value: string) => value.trim().toLowerCase();

export function buildShopKey(phase: string, category: string, index: number) {
    return `shop_${phase}_${category}_${index}`;
}

export function getShoppingPhaseForDay(day: number): string {
  if (day <= 0) return 'Foundation';
  if (day <= 7) return 'Fungal Elimination';
  if (day <= 14) return 'Parasite Elimination';
  return 'Heavy Metal Detox';
}

export function getJourneyWeek(day: number): 1 | 2 | 3 | null {
  if (day === 0) return null;
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  return 3;
}

export function getJourneyStageLabel(day: number, currentPhase?: number) {
  if (day === 0) {
    return 'Prep Day';
  }

  const week = getJourneyWeek(day);
  const phase = currentPhase ?? calculatePhase(day);
  return `Week ${week}: ${PHASE_INFO[phase].shortName}`;
}

export function findShoppingCategoryMatch(categoryName: string): ShoppingCategoryMatch | null {
    const normalizedCategory = normalizeShoppingValue(categoryName);

    for (const phase of SHOPPING_LIST) {
        const category = phase.categories.find((entry) => normalizeShoppingValue(entry.category) === normalizedCategory);
        if (category) {
            return { phase: phase.phase, category };
        }
    }

    return null;
}

export function findDefaultShoppingItem(params: {
    name: string;
    phase?: string;
    category?: string;
}): DefaultShoppingItemMatch | null {
    const normalizedName = normalizeShoppingValue(params.name);
    const normalizedPhase = params.phase ? normalizeShoppingValue(params.phase) : null;
    const normalizedCategory = params.category ? normalizeShoppingValue(params.category) : null;

    for (const phase of SHOPPING_LIST) {
        if (normalizedPhase && normalizeShoppingValue(phase.phase) !== normalizedPhase) {
            continue;
        }

        for (const category of phase.categories) {
            if (normalizedCategory && normalizeShoppingValue(category.category) !== normalizedCategory) {
                continue;
            }

            const index = category.items.findIndex((item) => normalizeShoppingValue(item.name) === normalizedName);
            if (index !== -1) {
                return {
                    key: buildShopKey(phase.phase, category.category, index),
                    phase: phase.phase,
                    phaseEmoji: phase.emoji,
                    category: category.category,
                    categoryEmoji: category.emoji,
                    guidance: category.guidance,
                    item: category.items[index],
                    index,
                };
            }
        }
    }

    return null;
}

const FOUNDATION_ITEMS: ChecklistItem[] = [
    { key: 'tongue_scrape', label: 'Tongue scrape (before anything else)', timeOfDay: 'morning', emoji: '👅' },
    { key: 'lemon_salt_water', label: 'Morning elixir of choice', timeOfDay: 'morning', emoji: '🍋' },
    { key: 'binder_morning', label: 'First binder window: take 2 hrs before or after food/supplements', timeOfDay: 'anytime', emoji: '🧲' },
    { key: 'breakfast_compliant', label: 'Eat compliant breakfast', timeOfDay: 'morning', emoji: '🥗' },
    { key: 'supplements_am', label: 'Breakfast liver support: milk thistle + dandelion root', timeOfDay: 'morning', emoji: '💊' },
    { key: 'hydration_goal', label: 'Stay hydrated — half body weight in oz', timeOfDay: 'afternoon', emoji: '💧' },
    { key: 'lunch_compliant', label: 'Eat compliant lunch', timeOfDay: 'afternoon', emoji: '🥗' },
    { key: 'supplements_pm', label: 'Lunch liver support: NAC + alpha-lipoic acid + selenium + B-complex', timeOfDay: 'afternoon', emoji: '💊' },
    { key: 'dinner_compliant', label: 'Eat compliant dinner', timeOfDay: 'evening', emoji: '🥗' },
    { key: 'supplements_dinner', label: 'Dinner liver support: milk thistle + artichoke extract', timeOfDay: 'evening', emoji: '💊' },
    { key: 'binder_evening', label: 'Second binder window: take 2 hrs before or after food/supplements', timeOfDay: 'evening', emoji: '🧲' },
    { key: 'sleep_routine', label: 'Bedtime routine by 10pm', timeOfDay: 'evening', emoji: '🌙' },
];

const PHASE_SPECIFIC_ITEMS: Record<number, ChecklistItem[]> = {
    1: [
        // Phase 1 = Day 0 prep
        { key: 'shopping', label: 'Complete shopping list', timeOfDay: 'anytime', emoji: '🛒' },
        { key: 'remove_foods', label: 'Remove non-compliant foods', timeOfDay: 'anytime', emoji: '🚫' },
        { key: 'prep_meals', label: 'Meal prep for Week 1', timeOfDay: 'anytime', emoji: '🍳' },
        { key: 'organize_supps', label: 'Organize supplements', timeOfDay: 'anytime', emoji: '📦' },
        { key: 'set_intention', label: 'Set your intention / why', timeOfDay: 'anytime', emoji: '🎯' },
    ],
    2: [
        // Phase 2 = Days 1-7 (Fungal)
        { key: 'oregano_oil', label: 'Breakfast antifungals: oregano oil + caprylic acid', timeOfDay: 'morning', emoji: '🌿' },
        { key: 'caprylic_acid', label: 'Breakfast gut support: probiotic + digestive enzyme', timeOfDay: 'morning', emoji: '🦠' },
        { key: 'liver_juice_support', label: 'Support drink later in the day: liver juice (beet-based if choosing one)', timeOfDay: 'afternoon', emoji: '🥤' },
        { key: 'garlic_supplement', label: 'Dinner antifungals: oregano oil + digestive enzyme', timeOfDay: 'evening', emoji: '🧄' },
        { key: 'no_sugar', label: 'Zero sugar / sweeteners today', timeOfDay: 'anytime', emoji: '🚫' },
        { key: 'herx_check', label: 'Note any die-off changes (mention them in chat)', timeOfDay: 'evening', emoji: '📝' },
        // Shopping reminder for Phase 3 — appears Day 5+
        { key: 'shop_phase3', label: 'Get Week 2 supplies ready', timeOfDay: 'anytime', emoji: '🛒', showFromDay: 5 },
    ],
    3: [
        // Phase 3 = Days 8-14 (Parasites)
        { key: 'mimosa_pudica', label: 'Breakfast parasite stack: black walnut + wormwood + clove', timeOfDay: 'morning', emoji: '🌱' },
        { key: 'wormwood', label: 'Continue breakfast support: oregano oil + caprylic acid + probiotic + digestive enzyme', timeOfDay: 'morning', emoji: '🌿' },
        { key: 'parasite_juice_support', label: 'Support drink later in the morning: parasite juice', timeOfDay: 'morning', emoji: '🍍' },
        { key: 'black_walnut', label: 'Lunch parasite support: berberine + grapefruit seed extract', timeOfDay: 'afternoon', emoji: '🥜' },
        { key: 'clove', label: 'Dinner parasite stack: black walnut + wormwood + clove', timeOfDay: 'evening', emoji: '🫚' },
        { key: 'moon_cycle', label: 'Afternoon binder support: diatomaceous earth (2hrs away from food/supplements)', timeOfDay: 'afternoon', emoji: '🌕' },
        { key: 'parasite_dinner_support', label: 'Dinner support: oregano oil + digestive enzyme', timeOfDay: 'evening', emoji: '🍽️' },
        // Shopping reminder for Phase 4 — appears Day 12+
        { key: 'shop_phase4', label: 'Get Week 3 supplies ready', timeOfDay: 'anytime', emoji: '🛒', showFromDay: 12 },
    ],
    4: [
        // Phase 4 = Days 15-21 (Heavy Metals)
        { key: 'chlorella', label: 'Breakfast support drink: heavy metal smoothie', timeOfDay: 'morning', emoji: '🟢' },
        { key: 'cilantro_detox', label: 'Support drink later in the morning: Cilantro Detox', timeOfDay: 'morning', emoji: '🌿' },
        { key: 'cilantro', label: 'Breakfast chelators: chlorella + spirulina + modified citrus pectin', timeOfDay: 'morning', emoji: '🌿' },
        { key: 'zeolite', label: 'Continue breakfast support: milk thistle + NAC + alpha-lipoic acid + reduced oregano oil + probiotic + digestive enzyme', timeOfDay: 'morning', emoji: '⚡' },
        { key: 'selenium', label: 'Lunch chelators: chlorella + zeolite + modified citrus pectin + vitamin C + selenium + B-complex', timeOfDay: 'afternoon', emoji: '💎' },
        { key: 'heavy_metal_dinner', label: 'Dinner chelators: chlorella + spirulina + modified citrus pectin + glutathione', timeOfDay: 'evening', emoji: '🌌' },
        { key: 'sauna_sweat', label: 'Sweat session (sauna/exercise)', timeOfDay: 'anytime', emoji: '🔥' },
    ],
};

export const PHASE_INFO: Record<number, PhaseInfo> = {
    1: {
        name: 'Prep & Foundation',
        shortName: 'Prep',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        description: 'Set up your environment, gather supplies, and prepare mentally for the journey ahead.',
        supplements: ['Milk thistle', 'Dandelion root', 'NAC', 'Alpha-lipoic acid', 'Artichoke extract', 'Selenium', 'B-complex', 'Binders'],
        tips: ['Remove sugar, gluten, dairy, and processed foods', 'Stock your kitchen with compliant foods', 'Set up a supplement organizer'],
    },
    2: {
        name: 'Fungal Elimination',
        shortName: 'Fungal',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Target candida and fungal overgrowth with antifungal herbs and strict dietary control.',
        supplements: ['Oregano oil', 'Caprylic acid', 'Probiotic', 'Digestive enzyme', 'Pau d\'arco'],
        tips: ['Die-off symptoms are normal — headaches, fatigue, brain fog', 'Drink extra water to flush toxins', 'Take binders 2 hours away from other supplements'],
    },
    3: {
        name: 'Parasite Cleanse',
        shortName: 'Parasites',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        description: 'Eliminate parasites with targeted anti-parasitic herbs. Full moon cycle enhances effectiveness.',
        supplements: ['Black walnut hull', 'Wormwood', 'Clove', 'Berberine', 'Grapefruit seed extract', 'Diatomaceous earth'],
        tips: ['Full moon can intensify symptoms', 'Strange bowel movements are normal', 'Keep up with binders to manage detox reactions'],
    },
    4: {
        name: 'Heavy Metal Detox',
        shortName: 'Metals',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        description: 'Chelate and remove heavy metals accumulated in tissues. Go slow and support your liver.',
        supplements: ['Chlorella', 'Spirulina', 'Modified citrus pectin', 'Zeolite', 'Vitamin C', 'Glutathione'],
        tips: ['Start chlorella at a low dose and increase gradually', 'Sweating helps mobilize metals — sauna or exercise', 'Support liver with milk thistle or NAC'],
    },
};

const CHECKLIST_SUPPORT: Partial<Record<string, ChecklistSupport>> = {
    shopping: {
        why: 'Prep only works if the buying is handled before Day 1. This removes decision fatigue once the protocol starts.',
    },
    remove_foods: {
        why: 'Getting off-plan food out of your space makes the next 21 days dramatically easier to follow.',
    },
    prep_meals: {
        why: 'A little prep now prevents panic meals once cravings or low energy hit.',
    },
    organize_supps: {
        why: 'If the supplements are organized ahead of time, the protocol feels like a routine instead of a puzzle.',
    },
    set_intention: {
        why: 'Your why is what keeps the plan steady when motivation drops later.',
    },
    tongue_scrape: {
        why: 'This clears overnight buildup first thing and helps the morning routine feel clean and deliberate.',
        timingHint: 'Do it before drinks, food, or supplements.',
    },
    lemon_salt_water: {
        why: 'The morning elixir gets hydration and digestion moving without overcomplicating the start of the day.',
        timingHint: 'Use one simple morning elixir option and move on.',
    },
    binder_morning: {
        why: 'The binder gives your body a place to carry out the junk you are stirring up instead of recirculating it.',
        timingHint: 'Keep it in a clean 2-hour window away from food and supplements.',
    },
    breakfast_compliant: {
        why: 'A compliant breakfast sets the tone early and keeps blood sugar swings from knocking you off later.',
    },
    supplements_am: {
        why: 'This is your base liver support. It keeps the rest of the protocol from feeling heavier than it needs to.',
    },
    hydration_goal: {
        why: 'Hydration is what helps your body move waste out instead of letting detox symptoms pile up.',
        timingHint: 'Spread it across the day instead of chugging all at once.',
    },
    lunch_compliant: {
        why: 'A steady lunch keeps energy and cravings from crashing in the afternoon.',
    },
    supplements_pm: {
        why: 'This midday support keeps detox pathways open while the active phase compounds do their work.',
    },
    dinner_compliant: {
        why: 'A simple compliant dinner protects the evening and makes the next morning easier.',
    },
    supplements_dinner: {
        why: 'Dinner support helps you finish the day without asking your liver to do all the cleanup overnight alone.',
    },
    binder_evening: {
        why: 'The second binder window helps clean up what built up through the day so symptoms do not stack overnight.',
        timingHint: 'Give it the same 2-hour buffer away from food and supplements.',
    },
    sleep_routine: {
        why: 'This protocol goes better when recovery is steady. Sleep is part of the protocol, not a bonus.',
    },
    oregano_oil: {
        why: 'This is one of your main fungal elimination levers. Missing it weakens the whole first week.',
    },
    caprylic_acid: {
        why: 'This keeps the gut-support side of the plan steady so the antifungal phase does not feel as rough.',
    },
    liver_juice_support: {
        why: 'The support drink is optional help, but it can make the day feel smoother when detox symptoms are louder.',
    },
    garlic_supplement: {
        why: 'This keeps fungal pressure on through the evening instead of letting the day trail off early.',
    },
    no_sugar: {
        why: 'Sugar is the fastest way to feed the exact thing this phase is trying to starve out.',
    },
    herx_check: {
        why: 'A quick note helps you separate normal die-off from spiraling and gives GutBrain something real to work with.',
    },
    shop_phase3: {
        why: 'Buying Week 2 supplies early prevents the phase change from turning into a scramble.',
    },
    mimosa_pudica: {
        why: 'This is part of the parasite stack that makes Week 2 meaningfully different from Week 1.',
    },
    wormwood: {
        why: 'Keeping the breakfast support steady protects the foundation while the parasite phase ramps up.',
    },
    parasite_juice_support: {
        why: 'This is optional support, but it can make the parasite phase feel less harsh if mornings are rough.',
    },
    black_walnut: {
        why: 'This lunch support keeps parasite pressure up instead of letting the middle of the day go soft.',
    },
    clove: {
        why: 'The dinner parasite stack helps you finish the day with the full phase intent still intact.',
    },
    moon_cycle: {
        why: 'This binder-style support helps absorb some of the extra mess this phase can stir up.',
        timingHint: 'Keep it clearly separated from food and supplements.',
    },
    parasite_dinner_support: {
        why: 'Dinner support keeps the parasite phase consistent instead of making it breakfast-heavy only.',
    },
    shop_phase4: {
        why: 'Getting Week 3 supplies ready now protects your finish. Do not wait until Day 15 to start hunting for them.',
    },
    chlorella: {
        why: 'The heavy metal smoothie is the soft entry into the final phase and keeps the morning structured.',
    },
    cilantro_detox: {
        why: 'This extra support can help the metals phase feel steadier without changing the backbone of the plan.',
    },
    cilantro: {
        why: 'These breakfast chelators are core Week 3 work. They are not a nice-to-have add-on.',
    },
    zeolite: {
        why: 'This keeps the morning support broad enough to mobilize and bind instead of only stirring things up.',
    },
    selenium: {
        why: 'The lunch chelators keep the heavy metal phase active through the middle of the day, not just at breakfast.',
    },
    heavy_metal_dinner: {
        why: 'This closes the day with the full Week 3 intent and helps the final stretch feel complete.',
    },
    sauna_sweat: {
        why: 'Sweating is a simple way to support elimination in the final phase without adding more pills.',
    },
};

export function calculatePhase(day: number): 1 | 2 | 3 | 4 {
    if (day === 0) return 1;
    if (day <= 7) return 2;
    if (day <= 14) return 3;
    return 4;
}

export function getChecklistSupport(itemKey: string, day: number): ChecklistSupport {
    const directSupport = CHECKLIST_SUPPORT[itemKey];
    if (directSupport) {
        return directSupport;
    }

    const phase = getPhaseForDay(day);
    return {
        why: `${phase.description} This step matters because it keeps today's plan aligned with that goal.`,
        timingHint: phase.tips[0],
    };
}

export function getChecklistForDay(day: number): ChecklistItem[] {
    const phase = calculatePhase(day);

    if (phase === 1) {
        // Prep day — only prep items, no foundation routine yet
        return PHASE_SPECIFIC_ITEMS[1];
    }

    // Days 1-21: Foundation items + phase-specific items
    const phaseItems = PHASE_SPECIFIC_ITEMS[phase].filter(
        item => !item.showFromDay || day >= item.showFromDay
    );
    return [...FOUNDATION_ITEMS, ...phaseItems];
}

export function getPhaseInfo(phase: number): PhaseInfo {
    return PHASE_INFO[phase] || PHASE_INFO[1];
}

export function getDayLabel(day: number): string {
    if (day === 0) return 'Prep Day';
    return `Day ${day} of 21`;
}

export function getPhaseForDay(day: number): PhaseInfo {
    return PHASE_INFO[calculatePhase(day)];
}

const CHAT_TIME_LABELS: Record<ChecklistItem['timeOfDay'], string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    anytime: 'Anytime',
};

export const FULL_PROTOCOL_CHAT_REFERENCE = [
    'AUTHORITATIVE FULL PROTOCOL REFERENCE: If any older shorthand conflicts with this, follow this reference.',
    'Day 0 is prep only. No active detox on Day 0.',
    'Binder timing rule: take binders in a clean 2-hour window before or after food and supplements. Do not assume they have to be taken immediately after waking if that timing does not fit the day.',
    'Morning ritual choice for every active day: keep this simple by default. Treat sole water, baking soda alkalizer, and the complete elixir as minor variations on the same morning elixir, not three separate required tasks. Only break down the differences if the user asks.',
    'Foundation schedule for EVERY active day (Days 1-21): Breakfast liver support = milk thistle + dandelion root. Lunch liver support = NAC + alpha-lipoic acid + selenium + B-complex. Dinner liver support = milk thistle + artichoke extract.',
    'Drink and formula support from the written protocol exists, but it is optional support rather than the main checklist. Do not surface juice rotations unless the user asks specifically about drinks, juices, or formulas.',
    'Phase 2 (Days 1-7): Breakfast antifungals = oregano oil + caprylic acid. Breakfast gut support = probiotic + digestive enzyme. Support drink later in the day = liver juice, with the afternoon beet-based option as the simplest default if they only want one. Dinner antifungals = oregano oil + digestive enzyme. Keep sugar at zero. Pau d\'arco is optional support.',
    'Phase 3 (Days 8-14): Breakfast parasite stack = black walnut + wormwood + clove. Continue oregano oil + caprylic acid + probiotic + digestive enzyme at breakfast. Support drink later in the morning = parasite juice after breakfast. Lunch parasite support = berberine + grapefruit seed extract. Afternoon binder support = diatomaceous earth 2 hours away from food and supplements. Dinner parasite stack = black walnut + wormwood + clove, plus oregano oil + digestive enzyme.',
    'Phase 4 (Days 15-21): Breakfast support drink = heavy metal smoothie. Support drink later in the morning = Cilantro Detox. Breakfast chelators = chlorella + spirulina + modified citrus pectin. Continue milk thistle + NAC + alpha-lipoic acid + reduced oregano oil + probiotic + digestive enzyme in the morning. Lunch chelators = chlorella + zeolite + modified citrus pectin + vitamin C + selenium + B-complex. Dinner chelators = chlorella + spirulina + modified citrus pectin + glutathione, plus milk thistle + artichoke extract.',
    'Day-specific notes from the full protocol: Day 2 adds artichoke extract at breakfast. Day 3 increases oregano oil and caprylic acid. Day 9 adds diatomaceous earth directly to the morning water. Days 10-14 increase black walnut, wormwood, clove, oregano oil, and probiotics. Day 15 starts the heavy metal phase.',
].join('\n');

export function buildProtocolChatContext(day: number): string {
    const checklist = getChecklistForDay(day)
        .map((item) => `- ${CHAT_TIME_LABELS[item.timeOfDay]} [key=${item.key}]: ${item.label}`)
        .join('\n');

    return [
        FULL_PROTOCOL_CHAT_REFERENCE,
        '',
        `CURRENT DAY: ${getDayLabel(day)} (Phase ${calculatePhase(day)})`,
        'TODAY\'S CHECKLIST:',
        checklist,
        '',
        'When the user asks what they need today, answer from the checklist and protocol above. If a checklist label is broad, spell out the exact supplements named in this reference.',
        'If you use app action tags for a checklist step, use the exact checklist key shown above when obvious.',
    ].join('\n');
}
