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
    optional?: string; // e.g. 'pick one' or 'alternative' — shown as a badge
}

export interface ShoppingCategory {
    category: string;
    emoji: string;
    items: ShoppingItem[];
}

export interface ShoppingPhase {
    phase: string;
    emoji: string;
    buyBefore: string;
    categories: ShoppingCategory[];
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
                items: [
                    { name: 'Activated Charcoal 500mg caps', quantity: '2-3 bottles', notes: '2-4 caps daily, 2hrs from food' },
                    { name: 'Bentonite Clay (food grade)', quantity: '1 container', notes: '1 tsp daily between meals', optional: 'or charcoal' },
                    { name: 'Psyllium Husk Powder', quantity: '1 large bag', notes: '1 tsp before bed with water', optional: 'optional add-on' },
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
                items: [
                    { name: 'Oregano Oil Capsules', quantity: '7-day supply', notes: '2-3 caps, 2x daily' },
                    { name: 'Caprylic Acid', quantity: '7-day supply', notes: '1000-1500mg daily' },
                    { name: 'Pau d\'Arco', quantity: '7-day supply', notes: 'Tea or 500mg capsules', optional: 'optional' },
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
                items: [
                    { name: 'Chlorella (cracked cell wall)', quantity: '7-day supply', notes: '9000mg/day (3000mg 3x)' },
                    { name: 'Spirulina', quantity: '7-day supply', notes: '4000mg daily', optional: 'optional' },
                    { name: 'Modified Citrus Pectin', quantity: '7-day supply', notes: '4500mg/day (1500mg 3x)' },
                    { name: 'Zeolite (micronized)', quantity: '7-day supply', notes: '1600mg daily' },
                    { name: 'Vitamin C (liposomal)', quantity: '7-day supply', notes: '3000mg daily' },
                    { name: 'Glutathione (liposomal)', quantity: '7-day supply', notes: '500mg daily' },
                ],
            },
        ],
    },
];

const FOUNDATION_ITEMS: ChecklistItem[] = [
    { key: 'tongue_scrape', label: 'Tongue scrape (before anything else)', timeOfDay: 'morning', emoji: '👅' },
    { key: 'lemon_salt_water', label: 'Warm lemon water + pinch of sea salt (16oz)', timeOfDay: 'morning', emoji: '🍋' },
    { key: 'binder_morning', label: 'Take binder (empty stomach, wait 30min)', timeOfDay: 'morning', emoji: '🧲' },
    { key: 'probiotics', label: 'Take probiotics (away from binder)', timeOfDay: 'morning', emoji: '🦠' },
    { key: 'breakfast_compliant', label: 'Eat compliant breakfast', timeOfDay: 'morning', emoji: '🥗' },
    { key: 'supplements_am', label: 'Morning supplements with food', timeOfDay: 'morning', emoji: '💊' },
    { key: 'hydration_goal', label: 'Stay hydrated — half body weight in oz', timeOfDay: 'afternoon', emoji: '💧' },
    { key: 'lunch_compliant', label: 'Eat compliant lunch', timeOfDay: 'afternoon', emoji: '🥗' },
    { key: 'supplements_pm', label: 'Afternoon supplements', timeOfDay: 'afternoon', emoji: '💊' },
    { key: 'dinner_compliant', label: 'Eat compliant dinner', timeOfDay: 'evening', emoji: '🥗' },
    { key: 'binder_evening', label: 'Evening binder (2hrs after food)', timeOfDay: 'evening', emoji: '🧲' },
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
        { key: 'oregano_oil', label: 'Oregano oil with lunch', timeOfDay: 'afternoon', emoji: '🌿' },
        { key: 'caprylic_acid', label: 'Caprylic acid with meals', timeOfDay: 'afternoon', emoji: '🥥' },
        { key: 'garlic_supplement', label: 'Garlic extract with dinner', timeOfDay: 'evening', emoji: '🧄' },
        { key: 'no_sugar', label: 'Zero sugar / sweeteners today', timeOfDay: 'anytime', emoji: '🚫' },
        { key: 'herx_check', label: 'Log any die-off symptoms', timeOfDay: 'evening', emoji: '📝' },
        // Shopping reminder for Phase 3 — appears Day 5+
        { key: 'shop_phase3', label: 'Shop for Phase 3 (Parasite) supplies', timeOfDay: 'anytime', emoji: '🛒', showFromDay: 5 },
    ],
    3: [
        // Phase 3 = Days 8-14 (Parasites)
        { key: 'mimosa_pudica', label: 'Mimosa pudica seed', timeOfDay: 'morning', emoji: '🌱' },
        { key: 'wormwood', label: 'Wormwood complex', timeOfDay: 'afternoon', emoji: '🌿' },
        { key: 'black_walnut', label: 'Black walnut hull', timeOfDay: 'afternoon', emoji: '🥜' },
        { key: 'clove', label: 'Clove supplement', timeOfDay: 'evening', emoji: '🫚' },
        { key: 'moon_cycle', label: 'Check moon cycle (full moon = peak)', timeOfDay: 'anytime', emoji: '🌕' },
        // Shopping reminder for Phase 4 — appears Day 12+
        { key: 'shop_phase4', label: 'Shop for Phase 4 (Heavy Metal) supplies', timeOfDay: 'anytime', emoji: '🛒', showFromDay: 12 },
    ],
    4: [
        // Phase 4 = Days 15-21 (Heavy Metals)
        { key: 'chlorella', label: 'Chlorella (start low, increase)', timeOfDay: 'morning', emoji: '🟢' },
        { key: 'cilantro', label: 'Cilantro tincture / fresh cilantro', timeOfDay: 'afternoon', emoji: '🌿' },
        { key: 'zeolite', label: 'Zeolite / clinoptilolite', timeOfDay: 'afternoon', emoji: '⚡' },
        { key: 'selenium', label: 'Selenium with dinner', timeOfDay: 'evening', emoji: '💎' },
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
        supplements: ['Binders (activated charcoal or bentonite clay)', 'Probiotics', 'Digestive enzymes', 'Magnesium citrate'],
        tips: ['Remove sugar, gluten, dairy, and processed foods', 'Stock your kitchen with compliant foods', 'Set up a supplement organizer'],
    },
    2: {
        name: 'Fungal Elimination',
        shortName: 'Fungal',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Target candida and fungal overgrowth with antifungal herbs and strict dietary control.',
        supplements: ['Oregano oil', 'Caprylic acid', 'Garlic extract', 'Pau d\'arco', 'Binders (continue)'],
        tips: ['Die-off symptoms are normal — headaches, fatigue, brain fog', 'Drink extra water to flush toxins', 'Take binders 2 hours away from other supplements'],
    },
    3: {
        name: 'Parasite Cleanse',
        shortName: 'Parasites',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        description: 'Eliminate parasites with targeted anti-parasitic herbs. Full moon cycle enhances effectiveness.',
        supplements: ['Mimosa pudica seed', 'Wormwood complex', 'Black walnut hull', 'Clove', 'Binders (continue)'],
        tips: ['Full moon = parasites are most active, best time to cleanse', 'Strange bowel movements are normal', 'Keep up with binders to manage detox reactions'],
    },
    4: {
        name: 'Heavy Metal Detox',
        shortName: 'Metals',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        description: 'Chelate and remove heavy metals accumulated in tissues. Go slow and support your liver.',
        supplements: ['Chlorella', 'Cilantro tincture', 'Zeolite / clinoptilolite', 'Selenium', 'Binders (continue)'],
        tips: ['Start chlorella at a low dose and increase gradually', 'Sweating helps mobilize metals — sauna or exercise', 'Support liver with milk thistle or NAC'],
    },
};

export function calculatePhase(day: number): 1 | 2 | 3 | 4 {
    if (day === 0) return 1;
    if (day <= 7) return 2;
    if (day <= 14) return 3;
    return 4;
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
